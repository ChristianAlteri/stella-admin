import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { Prisma, Product } from "@prisma/client";
import { stripe } from "@/lib/stripe";

interface Metadata {
  storeId: string;
  urlFrom: string;
  [key: string]: string;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { metadata } = body; // Array of product objects sent from the frontend to our webhook who sends it to this endpoint

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
    // Now you have the stripe_unique_id of the store
    // Split the funds into
    const productIds = Object.keys(metadata)
      .filter((key) => key.startsWith("productId_"))
      .map((key) => metadata[key]);

    const products = await prismadb.product.findMany({
      where: { id: { in: productIds } },
      include: { seller: true },
    });
    console.log("[Products] ", products);

    // Create a new Order
    const newOrder = await prismadb.order.create({
      data: {
        storeId: metadata.storeId,
        isPaid: true,
      },
    });

    // Create Order Items (split products into order items)
    const orderItems = await prismadb.orderItem.createMany({
      data: products.map((product: any) => ({
        orderId: newOrder.id,
        productId: product.id,
        sellerId: product.seller.id || "",
        productAmount: new Prisma.Decimal(product.ourPrice),
      })),
    });
    console.log("orderItems", orderItems);
    console.log("newOrder", newOrder);

    const sellerIds = products.map((product: any) => product.seller.id);

    // Mark products as archived
    await prismadb.product.updateMany({
      where: { id: { in: productIds } },
      data: { isArchived: true },
    });

    // Update seller sold count
    await prismadb.seller.updateMany({
      where: { id: { in: sellerIds } },
      data: { soldCount: { increment: 1 } },
    });

    // Take 2 percent of the totalAmount, that is the platform fee

    // PAYOUT STORE
    // Here we need to send some of the 50% of the totalAmount to the store by using the store.stripe_connect_unique_id
    // Define the Stripe fee percentage and platform fee percentage
    // const STRIPE_FEE_PERCENTAGE = 0.03; // 3% for Stripe fees
    // const CONSIGNMATE_FEE_PERCENTAGE = 0.02; // 2% for your platform fee

    // Calculate the total amount of the order (all products combined)
    const totalSales = products.reduce(
      (acc, product) => acc + product.ourPrice.toNumber(),
      0
    );

    // Calculate total Stripe fees and platform fee
    // const stripeFeeTotal = totalSales * STRIPE_FEE_PERCENTAGE;
    // const platformFeeTotal = totalSales * CONSIGNMATE_FEE_PERCENTAGE;
    // const totalDeductions = stripeFeeTotal + platformFeeTotal;
    const STRIPE_FEE_PERCENTAGE = 0.03;

    // PAYOUT SELLERS
    // Group the order items by seller (stripe_connect_unique_id)
    const sellerPayouts = products.reduce<{ [key: string]: number }>(
      (acc, product) => {
        if (!acc[product.seller.stripe_connect_unique_id!]) {
          acc[product.seller.stripe_connect_unique_id!] = 0;
        }
        const productTotal = product.ourPrice.toNumber();
        const payoutAfterStripeFee = productTotal * (1 - STRIPE_FEE_PERCENTAGE);
        acc[product.seller.stripe_connect_unique_id!] +=
          product.ourPrice.toNumber();
        return acc;
      },
      {}
    );
    console.log("sellerPayouts: ", sellerPayouts);
    // Iterate over the sellerPayouts and create Stripe transfers for each seller
    for (const [stripe_connect_unique_id, totalAmount] of Object.entries(
      sellerPayouts
    )) {
      // Check if stripe_connect_unique_id is valid
      if (!stripe_connect_unique_id || stripe_connect_unique_id === "") {
        console.error(`Invalid Stripe Connect ID for seller. Skipping payout.`);
        continue; // Skip this payout and move to the next
      }

      // Each seller gets a percentage (store.consignmentRate) of the totalAmount
      try {
        const stripeTransfer = await stripe.transfers.create({
          amount: Math.round(
            totalAmount * ((store?.consignmentRate ?? 50) / 100) * 100
          ), // Stripe requires * 100 for amounts in smallest currency unit
          currency: store?.currency?.toString() || "GBP",
          destination: stripe_connect_unique_id,
          transfer_group: `order_${newOrder.id}`,
        });
        console.log("stripeTransfer: ", stripeTransfer);

        // Find the actual sellerWhoSoldId based on the stripe_connect_unique_id
        const sellerWhoSoldId = products.find(
          (product) =>
            product.seller.stripe_connect_unique_id === stripe_connect_unique_id
        )?.seller.id;
        console.log("sellerWhoSoldId", sellerWhoSoldId);

        if (sellerWhoSoldId) {
          const payout = await prismadb.payout.create({
            data: {
              storeId: metadata.storeId,
              sellerId: sellerWhoSoldId,
              amount: new Prisma.Decimal(totalAmount).mul(
                (store?.consignmentRate ?? 50) / 100
              ),
              transferGroupId: `order_${newOrder.id}`,
              stripeTransferId: stripeTransfer.id,
            },
          });
          console.log("payout: ", payout);
          console.log("totalAmount", totalAmount);
        } else {
          console.error(
            `Seller with Stripe Connect ID ${stripe_connect_unique_id} not found.`
          );
        }

        // const storePayout = (totalSales / 2) - totalDeductions;
        // try {
        //   const stripeTransferForStore = await stripe.transfers.create({
        //     amount: Math.round(storePayout * 100),
        //     currency: store?.currency?.toString() || "GBP",
        //     destination: store.stripe_connect_unique_id,
        //     transfer_group: `order_${newOrder.id}`,
        //   });
        //   console.log("Store payout: ", stripeTransferForStore);
      } catch (error) {
        console.error(
          `Error creating Stripe transfer for seller ${stripe_connect_unique_id}:`,
          error
        );
      }
    }
    // console.log("[VERIFY_WEBHOOK_PAYMENT] ", store);
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error verifying terminal payment:", error);

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
