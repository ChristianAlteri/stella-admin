import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { Prisma, Product } from "@prisma/client";
import { stripe } from "@/lib/stripe";

interface Metadata {
  storeId: string;
  urlFrom: string;
  soldByStaffId: string;
  userId: string;
  userEmail: string
  [key: string]: string;
}

const logKey = "VERIFY_WEBHOOK_PAYMENT";

export async function POST(request: Request) {
  const body = await request.json();
  const { metadata } = body; // Array of product objects sent from the frontend to our webhook who sends it to this endpoint
  console.log(`[ENTERING_${logKey}] with metadata`, metadata);
  console.log("[INFO] POST body:", JSON.stringify(body));

  if (!metadata.storeId || typeof metadata.storeId !== "string") {
    return NextResponse.json(
      { success: false, message: "Invalid store ID" },
      { status: 400 }
    );
  }

  if (!metadata || Object.keys(metadata).length === 0) {
    return NextResponse.json(
      { success: false, message: "No metadata provided" },
      { status: 400 }
    );
  }

  try {
    const store = await prismadb.store.findFirst({
      where: { id: metadata.storeId },
      include: { address: true },
    });
    const consignmentRate = store?.consignmentRate ?? 50;

    // Split the funds into
    const productIds = Object.keys(metadata)
      .filter((key) => key.startsWith("productId_"))
      .map((key) => metadata[key]);

    console.log(`[INFO] ${logKey} productIds`, JSON.stringify(productIds));

    const products = await prismadb.product.findMany({
      where: { id: { in: productIds } },
      include: { seller: true },
    });

    console.log(`[INFO] ${logKey} products`, JSON.stringify(products));

    // Calculate the total amount of the order (all products combined)
    const totalSales = products.reduce(
      (acc, product) => acc + product.ourPrice.toNumber(),
      0
    );

    console.log(`[INFO] ${logKey} totalSales`, JSON.stringify(totalSales));

    const STRIPE_FEE_PERCENTAGE = 0.02;
    const OUR_PLATFORM_FEE = store?.our_platform_fee
      ? store.our_platform_fee / 100
      : 0.05;

    console.log(`[INFO] ${logKey} OUR_PLATFORM_FEE`, OUR_PLATFORM_FEE);

    const totalFees = totalSales * (STRIPE_FEE_PERCENTAGE + OUR_PLATFORM_FEE);
    const totalSalesAfterFees = totalSales - totalFees;

    console.log(`[INFO] ${logKey} totalFees`, totalFees);
    console.log(`[INFO] ${logKey} totalSalesAfterFees`, totalSalesAfterFees);

    // Create a new Order
    const newOrder = await prismadb.order.create({
      data: {
        store: { connect: { id: metadata.storeId } },
        isPaid: true,
        totalAmount: new Prisma.Decimal(totalSalesAfterFees),
        soldByStaff: { connect: { id: metadata.soldByStaffId || metadata.storeId } },
        ...(metadata.userId && { userId: metadata.userId })
      },
    });

    console.log(`[INFO] ${logKey} newOrder`, JSON.stringify(newOrder));

    // Create Order Items individually to capture each ID
    const orderItems = await Promise.all(
      products.map(async (product) => {
        const orderItem = await prismadb.orderItem.create({
          data: {
            storeId: metadata.storeId,
            orderId: newOrder.id,
            productId: product.id,
            sellerId: product.seller.id || "",
            soldByStaffId: metadata.soldByStaffId || metadata.storeId,
            productAmount: new Prisma.Decimal(product.ourPrice),
          },
        });
        return orderItem.id; // Return the ID of each created order item
      })
    );

    console.log(`[INFO] ${logKey} orderItems`, orderItems);

    const sellerIds = products.map((product: any) => product.seller.id);

    console.log(`[INFO] ${logKey} sellerIds`, sellerIds);

    // Sum the total product amount for all items in this order
    const totalProductAmount = products.reduce(
      (acc, product) => acc + product.ourPrice.toNumber(),
      0
    );
    console.log(
      `[INFO] ${logKey} totalProductAmount total sales: ` + totalProductAmount
    );

    const staff = await prismadb.staff.update({
      where: { id: metadata.soldByStaffId },
      data: {
        totalSales: { increment: totalProductAmount },
        totalItemsSold: { increment: products.length },
        totalTransactionCount: { increment: 1 },
        orders: {
          connect: { id: newOrder.id },
        },
        orderItems: {
          connect: orderItems.map((id) => ({ id })),
        },
        ...(metadata.userId && { customers: { connect: { id: metadata.userId } } }),
      },
    });
    console.log(
      `[INFO] ${logKey} Updated total sales for staff:`,
      metadata.soldByStaffId
    );
    console.log(`[INFO] ${logKey} Updated staff member: `, staff);

    if (!metadata.userId) {
      console.log(`[INFO] No userId in metadata: ${JSON.stringify(metadata)}`);
    } else {
      const userExists = await prismadb.user.findUnique({ where: { id: metadata.userId } });
      if (userExists) {
        // Proceed with update only if the user is valid
        const updatedUser = await prismadb.user.update({
          where: { id: metadata.userId },
          data: {
            purchaseHistory: {
              connect: products.map((product) => ({ id: product.id })),
            },
            orderHistory: {
              connect: { id: newOrder.id },
            },
            totalPurchases: { increment: totalProductAmount },
            totalItemsPurchased: { increment: products.length },
            totalTransactionCount: { increment: 1 },
            interactingStaff: { connect: { id: metadata.soldByStaffId } },
          },
        });
        console.log(`[INFO] ${logKey} Updated user details: `, updatedUser);
      } else {
        console.log(`[INFO] ${logKey} No existing user found for userId: ${metadata.userId}`);
      }
    }
    console.log(`[INFO] ${logKey} Updated metrics for user:`, metadata.userId);

    // Mark products as archived, attach a user and staff who sold
    await prismadb.product.updateMany({
      where: { id: { in: productIds } },
      data: {
        isArchived: true,
        staffId: metadata.soldByStaffId || metadata.storeId,
        ...(metadata.userId ?? { userId: metadata.userId })
      },
    });

    // Update seller sold count
    await prismadb.seller.updateMany({
      where: { id: { in: sellerIds } },
      data: { soldCount: { increment: 1 } },
    });

    let storeCut = 0;

    // PAYOUT SELLERS
    const sellerPayouts = products.reduce<{ [key: string]: number }>(
      (acc, product) => {
        const productSalePrice = product.ourPrice.toNumber();
        // Calculate the seller's payout per product they sell:
        // Deduct Stripe fee and platform fee:
        const totalFeePercentage = STRIPE_FEE_PERCENTAGE + OUR_PLATFORM_FEE;
        const payoutAfterFees = productSalePrice * (1 - totalFeePercentage);
        // Use seller's consignment rate if available, otherwise use default consignmentRate
        const consignmentRateToUse =
          product?.seller?.consignmentRate ?? consignmentRate;
        const sellerPayout = payoutAfterFees * (consignmentRateToUse / 100);
        // Add the payout to the correct seller's total payout
        if (!acc[product.seller.stripe_connect_unique_id!]) {
          acc[product.seller.stripe_connect_unique_id!] = 0;
        }
        // Calculate the store's additional cut from the seller's consignment rate difference
        const storeAdditionalCut =
          payoutAfterFees * ((100 - consignmentRateToUse) / 100);
        storeCut += storeAdditionalCut;
        console.log(
          `[INFO] ${logKey} consignmentRateToUse`,
          consignmentRateToUse
        );
        console.log(`[INFO] ${logKey} storeCut`, storeCut);
        console.log(`[INFO] ${logKey} payoutAfterFees`, payoutAfterFees);

        acc[product.seller.stripe_connect_unique_id!] += sellerPayout;
        return acc;
      },
      {}
    );
    console.log(`[INFO] ${logKey} sellerPayouts: `, sellerPayouts);

    for (const [stripe_connect_unique_id, sellerNetPayout] of Object.entries(
      sellerPayouts
    )) {
      if (!stripe_connect_unique_id || stripe_connect_unique_id === "") {
        console.error(
          `[ERROR] ${logKey} Invalid Stripe Connect ID for seller. Skipping payout.`
        );
        continue; // Skip this payout and move to the next
      }

      try {
        const sellerWhoSoldId = products.find(
          (product) =>
            product.seller.stripe_connect_unique_id === stripe_connect_unique_id
        )?.seller.id;
        console.log(`[INFO] ${logKey} sellerWhoSoldId`, sellerWhoSoldId);
        if (sellerWhoSoldId) {
          console.log(
            "DEBUG STRIPE AMOUNT PAYING OUT",
            Math.round(sellerNetPayout * 100)
          );
          const stripeTransferForSeller = await stripe.transfers.create({
            amount: Math.round(sellerNetPayout * 100), // Stripe requires amounts in pence (smallest currency unit)
            currency: store?.currency?.toString() || "GBP",
            destination: stripe_connect_unique_id,
            transfer_group: `order_${newOrder.id}`,
            metadata: {
              store_id: metadata.storeId,
              order_id: newOrder.id,
              seller_id: sellerWhoSoldId,
              url_from: metadata.urlFrom,
              seller_net_payout: sellerNetPayout,
              total_sales: totalSales,
              total_sales_after_fees: totalSalesAfterFees,
              store_cut: storeCut,
              consignment_rate: consignmentRate,
              total_fees: totalFees,
              products: productIds.join(","),
            },
          });
          console.log(
            `[INFO] ${logKey} stripeTransfer for seller: `,
            stripeTransferForSeller
          );
          const payout = await prismadb.payout.create({
            data: {
              storeId: metadata.storeId,
              sellerId: sellerWhoSoldId,
              amount: new Prisma.Decimal(sellerNetPayout),
              transferGroupId: `order_${newOrder.id}`,
              stripeTransferId: stripeTransferForSeller.id,
              orderId: newOrder.id,
            },
          });
          console.log(`[INFO] ${logKey} payout: `, payout);
        } else {
          console.error(
            `[ERROR] ${logKey} Seller with Stripe Connect ID ${stripe_connect_unique_id} not found.`
          );
        }
      } catch (error) {
        console.error(
          `[ERROR] ${logKey} Error creating Stripe transfer for seller ${stripe_connect_unique_id}:`,
          error
        );
      }
    }

    // PAYOUT STORE
    try {
      console.log(
        "DEBUG STRIPE AMOUNT PAYING OUT TO STORE",
        Math.round(storeCut * 100)
      );
      const stripeTransferForStore = await stripe.transfers.create({
        amount: Math.round(storeCut * 100), // Stripe requires amounts in pence (smallest currency unit)
        currency: store?.currency?.toString() || "GBP",
        destination: store?.stripe_connect_unique_id || "",
        transfer_group: `order_${newOrder.id}`,
        metadata: {
          store_id: metadata.storeId,
          order_id: newOrder.id,
          seller_id: sellerIds.join(","),
          url_from: metadata.urlFrom,
          total_sales: totalSales,
          total_sales_after_fees: totalSalesAfterFees,
          store_cut: storeCut,
          consignment_rate: consignmentRate,
          total_fees: totalFees,
          products: productIds.join(","),
        },
      });
      const storePayoutRecord = await prismadb.payout.create({
        data: {
          storeId: metadata.storeId || "",
          sellerId: metadata.storeId || "",
          amount: new Prisma.Decimal(storeCut), // Amount after fees
          transferGroupId: `order_${newOrder.id}`,
          stripeTransferId: stripeTransferForStore.id,
          orderId: newOrder.id,
        },
      });
      console.log(
        `[INFO] ${logKey} stripeTransferForStore: `,
        stripeTransferForStore
      );
      console.log(`[INFO] ${logKey} storePayoutRecord: `, storePayoutRecord);
    } catch (error) {
      console.error(
        `[ERROR] ${logKey} Error creating Stripe transfer for store:`,
        error
      );
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(
      `[ERROR] ${logKey} Error verifying terminal payment: `,
      error
    );

    // Check for Stripe balance_insufficient error
    if (
      error instanceof stripe.errors.StripeInvalidRequestError &&
      error.code === "balance_insufficient"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient funds in Stripe account or wrong currency",
          errorCode: error.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
