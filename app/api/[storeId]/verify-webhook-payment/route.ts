import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { Prisma, Product } from "@prisma/client";
import { stripe } from "@/lib/stripe";

interface Metadata {
  storeId: string;
  urlFrom: string;
  [key: string]: string; // Product IDs
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
    const consignmentRate = store?.consignmentRate ?? 50;

    // Split the funds into
    const productIds = Object.keys(metadata)
      .filter((key) => key.startsWith("productId_"))
      .map((key) => metadata[key]);

    const products = await prismadb.product.findMany({
      where: { id: { in: productIds } },
      include: { seller: true },
    });
    // console.log("[Products] ", products);

    // Calculate the total amount of the order (all products combined)
    const totalSales = products.reduce(
      (acc, product) => acc + product.ourPrice.toNumber(),
      0
    );

    const STRIPE_FEE_PERCENTAGE = 0.03;
    const OUR_PLATFORM_FEE = store?.our_platform_fee
      ? store.our_platform_fee / 100
      : 0.05;

    const totalFees = totalSales * (STRIPE_FEE_PERCENTAGE + OUR_PLATFORM_FEE);
    const totalSalesAfterFees = totalSales - totalFees;

    // Create a new Order
    const newOrder = await prismadb.order.create({
      data: {
        storeId: metadata.storeId,
        isPaid: true,
        totalAmount: new Prisma.Decimal(totalSalesAfterFees),
      },
    });

    // Create Order Items (split products into order items)
    const orderItems = await prismadb.orderItem.createMany({
      data: products.map((product: any) => ({
        storeId: metadata.storeId,
        orderId: newOrder.id,
        productId: product.id,
        sellerId: product.seller.id || "",
        productAmount: new Prisma.Decimal(product.ourPrice),
      })),
    });

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

    // let storeCut = totalSalesAfterFees * (consignmentRate / 100);
    let storeCut = 0;

    console.log("TOTAL SALES", totalSales);
    console.log("totalSales after fees", totalSalesAfterFees);
    // console.log("storeCut", storeCut);

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
        console.log("consignmentRateToUse", consignmentRateToUse);
        console.log("storeCut", storeCut);

        acc[product.seller.stripe_connect_unique_id!] += sellerPayout;
        return acc;
      },
      {}
    );
    // console.log("sellerPayouts", sellerPayouts);

    for (const [stripe_connect_unique_id, sellerNetPayout] of Object.entries(
      sellerPayouts
    )) {
      if (!stripe_connect_unique_id || stripe_connect_unique_id === "") {
        console.error(`Invalid Stripe Connect ID for seller. Skipping payout.`);
        continue; // Skip this payout and move to the next
      }

      try {
        const sellerWhoSoldId = products.find(
          (product) =>
            product.seller.stripe_connect_unique_id === stripe_connect_unique_id
        )?.seller.id;

        if (sellerWhoSoldId) {
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
          console.log("stripeTransfer for seller: ", stripeTransferForSeller);
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
          // console.log("payout: ", payout);
        } else {
          console.error(
            `Seller with Stripe Connect ID ${stripe_connect_unique_id} not found.`
          );
        }
      } catch (error) {
        console.error(
          `Error creating Stripe transfer for seller ${stripe_connect_unique_id}:`,
          error
        );
      }
    }

    // PAYOUT STORE
    try {
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
      console.log("stripeTransferForStore: ", stripeTransferForStore);
    } catch (error) {
      console.error("Error creating Stripe transfer for store:", error);
    }

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

// import { NextResponse } from "next/server";
// import prismadb from "@/lib/prismadb";
// import { Prisma, Product } from "@prisma/client";
// import { stripe } from "@/lib/stripe";

// interface Metadata {
//   storeId: string;
//   urlFrom: string;
//   [key: string]: string;
// }

// export async function POST(request: Request) {
//   const body = await request.json();
//   const { metadata } = body; // Array of product objects sent from the frontend to our webhook who sends it to this endpoint

//   if (!metadata.storeId || typeof metadata.storeId !== "string") {
//     return NextResponse.json(
//       { success: false, message: "Invalid store ID" },
//       { status: 400 }
//     );
//   }

//   if (!metadata || Object.keys(metadata).length === 0) {
//     return NextResponse.json(
//       { success: false, message: "No metadata provided" },
//       { status: 400 }
//     );
//   }

//   try {
//     const store = await prismadb.store.findFirst({
//       where: { id: metadata.storeId },
//       include: { address: true },
//     });
//     // Now you have the stripe_unique_id of the store
//     // Split the funds into
//     const productIds = Object.keys(metadata)
//       .filter((key) => key.startsWith("productId_"))
//       .map((key) => metadata[key]);

//     const products = await prismadb.product.findMany({
//       where: { id: { in: productIds } },
//       include: { seller: true },
//     });
//     console.log("[Products] ", products);

//     // Create a new Order
//     const newOrder = await prismadb.order.create({
//       data: {
//         storeId: metadata.storeId,
//         isPaid: true,
//       },
//     });

//     // Create Order Items (split products into order items)
//     const orderItems = await prismadb.orderItem.createMany({
//       data: products.map((product: any) => ({
//         orderId: newOrder.id,
//         productId: product.id,
//         sellerId: product.seller.id || "",
//         productAmount: new Prisma.Decimal(product.ourPrice),
//       })),
//     });
//     console.log("orderItems", orderItems);
//     console.log("newOrder", newOrder);

//     const sellerIds = products.map((product: any) => product.seller.id);

//     // Mark products as archived
//     await prismadb.product.updateMany({
//       where: { id: { in: productIds } },
//       data: { isArchived: true },
//     });

//     // Update seller sold count
//     await prismadb.seller.updateMany({
//       where: { id: { in: sellerIds } },
//       data: { soldCount: { increment: 1 } },
//     });

//     // Calculate the total amount of the order (all products combined)
//     const totalSales = products.reduce(
//       (acc, product) => acc + product.ourPrice.toNumber(),
//       0
//     );

//     const STRIPE_FEE_PERCENTAGE = 0.03;

//     // PAYOUT SELLERS
//     // Group the order items by seller (stripe_connect_unique_id)
//     const sellerPayouts = products.reduce<{ [key: string]: number }>(
//       (acc, product) => {
//         if (!acc[product.seller.stripe_connect_unique_id!]) {
//           acc[product.seller.stripe_connect_unique_id!] = 0;
//         }

//         // Calculate payout for each seller after Stripe fee and platform fee deductions
//         const productTotal = product.ourPrice.toNumber();

//         // Seller gets their share based on consignment rate
//         const sellerShare =
//           productTotal * ((store?.consignmentRate ?? 50) / 100);

//         // Deduct Stripe fee from the seller's share
//         const payoutAfterFees = sellerShare * (1 - STRIPE_FEE_PERCENTAGE);

//         acc[product.seller.stripe_connect_unique_id!] += payoutAfterFees;
//         return acc;
//       },
//       {}
//     );

//     console.log("sellerPayouts after fee deductions: ", sellerPayouts);

//     // Now proceed with the Stripe transfers for each seller
//     for (const [stripe_connect_unique_id, adjustedAmount] of Object.entries(
//       sellerPayouts
//     )) {
//       if (!stripe_connect_unique_id || stripe_connect_unique_id === "") {
//         console.error(`Invalid Stripe Connect ID for seller. Skipping payout.`);
//         continue; // Skip this payout and move to the next
//       }

//       try {
//         // Use the adjustedAmount after fees have been deducted
//         const stripeTransfer = await stripe.transfers.create({
//           amount: Math.round(adjustedAmount * 100), // Stripe requires amounts in pence (smallest currency unit)
//           currency: store?.currency?.toString() || "GBP",
//           destination: stripe_connect_unique_id,
//           transfer_group: `order_${newOrder.id}`,
//         });
//         console.log("stripeTransfer: ", stripeTransfer);

//         const sellerWhoSoldId = products.find(
//           (product) =>
//             product.seller.stripe_connect_unique_id === stripe_connect_unique_id
//         )?.seller.id;

//         if (sellerWhoSoldId) {
//           const payout = await prismadb.payout.create({
//             data: {
//               sellerId: sellerWhoSoldId,
//               storeId: metadata.storeId,
//               amount: new Prisma.Decimal(adjustedAmount), // Amount after fees
//               transferGroupId: `order_${newOrder.id}`,
//               stripeTransferId: stripeTransfer.id,
//             },
//           });
//           console.log("payout: ", payout);
//         } else {
//           console.error(
//             `Seller with Stripe Connect ID ${stripe_connect_unique_id} not found.`
//           );
//         }

//         // PAYOUT STORE
//         // Make sure you take the 3 percent of this to cover the stripe fee
//         const stripeTransferForStore = await stripe.transfers.create({
//           amount: Math.round(adjustedAmount * 100), // Stripe requires amounts in pence (smallest currency unit)
//           currency: store?.currency?.toString() || "GBP",
//           destination: store?.stripe_connect_unique_id || "",
//           transfer_group: `order_${newOrder.id}`,
//         });

//         const storePayout = await prismadb.payout.create({
//           data: {
//             sellerId: store?.id || "",
//             storeId: store?.id || "",
//             amount: new Prisma.Decimal(adjustedAmount), // This needs to be the rest of the sale after the fees have been deducted
//             transferGroupId: `order_${newOrder.id}`,
//             stripeTransferId: stripeTransfer.id,
//           },
//         });
//         console.log("Store payout: ", storePayout);
//         console.log("stripeTransferForStore: ", stripeTransferForStore);
//       } catch (error) {
//         console.error(
//           `Error creating Stripe transfer for seller ${stripe_connect_unique_id}:`,
//           error
//         );
//       }
//     }
//     // console.log("[VERIFY_WEBHOOK_PAYMENT] ", store);
//     return NextResponse.json({ status: 200 });
//   } catch (error) {
//     console.error("Error verifying terminal payment:", error);

//     // Check for Stripe balance_insufficient error
//     if (
//       error instanceof stripe.errors.StripeInvalidRequestError &&
//       error.code === "balance_insufficient"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Insufficient funds in Stripe account or wrong currency",
//           errorCode: error.code,
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
