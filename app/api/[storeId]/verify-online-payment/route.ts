import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { createProfileInKlaviyo } from "@/actions/klaviyo/create-profile-in-klaviyo";
import { postUserToKlaviyoWelcomeList } from "@/actions/klaviyo/post-profile-to-klaviyo-welcome-list";
import { findProfileInKlaviyo } from "@/actions/klaviyo/find-profile-in-klaviyo";
import { postOrderConfirmationEmail } from "@/actions/klaviyo/post-order-confirmation";
import { Prisma, Product, Seller, Store } from "@prisma/client";
import { postConfirmationOfSaleToSeller } from "@/actions/klaviyo/post-confirmation-of-sale-to-seller";
import Stripe from "stripe";

const logKey = "VERIFY_ONLINE_PAYMENT";

type ProductWithSeller = Product & {
  seller?: Seller;
};

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get("session_id");
  console.log(`[ENTERING_${logKey}] with session_id`, session_id);

  if (!session_id || typeof session_id !== "string") {
    return NextResponse.json(
      { success: false, message: "Invalid session ID" },
      { status: 400 }
    );
  }
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");

  try {
    let session: Stripe.Checkout.Session;
    let store: Store | null;
    let products: ProductWithSeller[] = [];
    let productIds: string[] = [];
    let sellerIds: string[] = [];
    let STRIPE_FEE_PERCENTAGE: any;
    let OUR_PLATFORM_FEE: any;
    let consignmentRate: number;
    let totalSalesAfterFees: number;
    let totalSales: number;
    let totalFees: number;
    try {
      // Retrieve the Stripe session
      session = await stripe.checkout.sessions.retrieve(session_id);
      console.log(
        `[INFO] ${logKey} Retrieved Stripe payment session: `,
        session
      );

      // Find the store based on the session metadata
      store = await prismadb.store.findUnique({
        where: { id: session.metadata?.storeId },
      });
      consignmentRate = store?.consignmentRate ?? 50;

      if (!store) {
        console.warn(
          `[WARN] ${logKey} Store not found for storeId: ${session.metadata?.storeId}`
        );
        return NextResponse.json(
          { success: false, message: "Store not found" },
          { status: 404 }
        );
      }

      console.log(`[INFO] ${logKey} Store retrieved successfully: `, store);
    } catch (error) {
      console.error(
        `[ERROR] ${logKey} Error retrieving Stripe session or store: `,
        error
      );
      return NextResponse.json(
        { success: false, message: "Error retrieving Stripe session or store" },
        { status: 500 }
      );
    }
    if (session.payment_status === "paid") {
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        return NextResponse.json(
          { success: false, message: "Order ID not found in session metadata" },
          { status: 400 }
        );
      }

      try {
        // Now the user has completed the payment, update the order in the database
        const successfulOrder = await prismadb.order.update({
          where: { id: orderId },
          data: {
            isPaid: true,
            totalAmount: {
              increment: 10,
            }, // Increment by a hard coded shipping rate of $10
            address: JSON.stringify(session.customer_details?.address),
            phone: session.customer_details?.phone || "",
            email: session.customer_details?.email || "",
          },
        });

        console.log(
          `[INFO] ${logKey} Order updated successfully: `,
          successfulOrder
        );

        const productIds = session.metadata?.productIds?.split(",") || [];
        // Mark products as archived, attach a user and staff who sold
        await prismadb.product.updateMany({
          where: { id: { in: productIds } },
          data: {
            isArchived: true,
            staffId: session?.metadata?.storeId || "",
            // ...(userId && { userId: userId }),
          },
        });
        products = await prismadb.product.findMany({
          where: { id: { in: productIds } },
          include: { seller: true },
        });

        sellerIds = products.map((product) => product.sellerId);

        // Update seller sold count
        await prismadb.seller.updateMany({
          where: { id: { in: sellerIds } },
          data: { soldCount: { increment: 1 } },
        });

        console.log(`[INFO] ${logKey} productIds`, productIds);

        console.log(`[INFO] ${logKey} products`, JSON.stringify(products));

        // Calculate the total amount of the order (all products combined)
        totalSales = products.reduce(
          (acc, product) => acc + product.ourPrice.toNumber(),
          0
        );

        console.log(`[INFO] ${logKey} totalSales`, JSON.stringify(totalSales));

        STRIPE_FEE_PERCENTAGE = 0.02;
        OUR_PLATFORM_FEE = store?.our_platform_fee
          ? store.our_platform_fee / 100
          : 0.01;

        console.log(`[INFO] ${logKey} OUR_PLATFORM_FEE`, OUR_PLATFORM_FEE);

        totalFees = totalSales * (STRIPE_FEE_PERCENTAGE + OUR_PLATFORM_FEE);
        totalSalesAfterFees = totalSales - totalFees;

        console.log(`[INFO] ${logKey} totalFees`, totalFees);
        console.log(
          `[INFO] ${logKey} totalSalesAfterFees`,
          totalSalesAfterFees
        );
      } catch (error) {
        console.error(`[ERROR] ${logKey} Error updating the database: `, error);
        return NextResponse.json(
          {
            success: false,
            message: "Error updating the database",
          },
          { status: 500 }
        );
      }

      let storeCut = 10; // Hard coded shipping rate
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
            product.seller?.consignmentRate ?? consignmentRate;
          console.log(
            `[INFO] ${logKey} consignmentRateToUse:`,
            consignmentRateToUse
          );
          const sellerPayout = payoutAfterFees * (consignmentRateToUse / 100);
          // Add the payout to the correct seller's total payout
          if (!acc[product?.seller?.stripe_connect_unique_id!]) {
            acc[product?.seller?.stripe_connect_unique_id!] = 0;
          }
          // Calculate the store's additional cut from the seller's consignment rate difference
          const storeAdditionalCut =
            payoutAfterFees * ((100 - consignmentRateToUse) / 100);
          storeCut += storeAdditionalCut;
          console.log(`[INFO] ${logKey} storeCut`, storeCut);
          console.log(`[INFO] ${logKey} payoutAfterFees`, payoutAfterFees);

          if (product.seller) {
            acc[product.seller.stripe_connect_unique_id!] += sellerPayout;
          }
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
              product.seller?.stripe_connect_unique_id ===
              stripe_connect_unique_id
          )?.seller?.id;
          console.log(`[INFO] ${logKey} sellerWhoSoldId`, sellerWhoSoldId);
          if (sellerWhoSoldId) {
            const consignmentRateForMetadata =
              products.find(
                (product) =>
                  product?.seller?.stripe_connect_unique_id ===
                  stripe_connect_unique_id
              )?.seller?.consignmentRate ??
              store?.consignmentRate ??
              50;
            const stripeTransferForSeller = await stripe.transfers.create({
              amount: Math.round(sellerNetPayout * 100), // Stripe requires amounts in pence (smallest currency unit)
              currency: store?.currency?.toString() || "GBP",
              destination: stripe_connect_unique_id,
              transfer_group: `order_${orderId}`,
              metadata: {
                store_id: session?.metadata?.storeId ?? "",
                order_id: orderId,
                seller_id: sellerWhoSoldId,
                seller_net_payout: sellerNetPayout,
                total_sales: totalSales,
                total_sales_after_fees: totalSalesAfterFees,
                store_cut: storeCut,
                consignment_rate: consignmentRateForMetadata,
                total_fees: totalFees,
                products: productIds ? productIds.join(",") : "",
              },
            });
            console.log(
              `[INFO] ${logKey} stripeTransfer for seller: `,
              stripeTransferForSeller
            );
            const payout = await prismadb.payout.create({
              data: {
                storeId: session?.metadata?.storeId,
                sellerId: sellerWhoSoldId,
                amount: new Prisma.Decimal(sellerNetPayout),
                transferGroupId: `order_${orderId}`,
                stripeTransferId: stripeTransferForSeller.id,
                orderId: orderId,
                // TODO: Add the seller.storeName here
              },
            });
            console.log(`[INFO] ${logKey} payout: `, payout);
            // TODO: if this is successful then update the product to sellerPayedOut=true

            // Send event to Klaviyo which sends them email saying they made a sale
            const sellerEmailData = await prismadb?.seller.findUnique({
              where: { id: sellerWhoSoldId },
            });
            const sellerEmail = sellerEmailData?.email;
            const sellerName = sellerEmailData?.storeName || "Seller";
            console.log(`[INFO] ${logKey} sellerEmailData: `, sellerEmailData);
            console.log(
              `[INFO] ${logKey} sellerEmail and sellerName: `,
              sellerEmail,
              sellerName
            );
            const productsWithSellerIdObject = session.metadata
              ?.productsWithSellerIdStringify
              ? JSON.parse(session.metadata.productsWithSellerIdStringify)
              : {};
            console.log(
              "productsWithSellerIdObject",
              productsWithSellerIdObject
            );
            const sellersProductData =
              productsWithSellerIdObject[sellerWhoSoldId];
            console.log("sellersProductData", sellersProductData);
            if (sellerEmail) {
              // Find Klaviyo profile ID and send confirmation
              let klaviyoProfile = await findProfileInKlaviyo(sellerEmail);
              if (!klaviyoProfile.data || klaviyoProfile.data.length === 0) {
                console.log(
                  `[INFO] ${logKey} No Klaviyo profile found for ${sellerEmail}. Creating one...`
                );
                // If no profile create one then send the email confirmation
                klaviyoProfile = await createProfileInKlaviyo(
                  sellerName,
                  sellerEmail
                );
                // Refetch because of delay in Klaviyo api
                klaviyoProfile = await findProfileInKlaviyo(sellerEmail);
                console.log(`[INFO] ${logKey} Created Klaviyo profile:`);
              }
              console.log(`[INFO] ${logKey} Klaviyo profile:`, klaviyoProfile);
              const klaviyoProfileId = klaviyoProfile?.data[0]?.id;
              if (klaviyoProfileId) {
                console.log(
                  `[INFO] ${logKey} klaviyoProfileId for ${sellerEmail}:`,
                  klaviyoProfileId
                );
                try {
                  const saleConfirmationEmail =
                    await postConfirmationOfSaleToSeller(
                      klaviyoProfileId,
                      sellerEmail,
                      sellerNetPayout.toString(),
                      sellersProductData
                    );
                  if (saleConfirmationEmail) {
                    console.log(
                      `[INFO] ${logKey} Sale confirmation email successfully sent for ${sellerEmail}. Response:`
                      // saleConfirmationEmail
                    );
                  } else {
                    console.log(
                      `[WARNING] ${logKey} Sale confirmation email not sent for ${sellerEmail}. Response was null or undefined.`
                    );
                  }
                } catch (error) {
                  console.log(
                    `[ERROR] ${logKey} Failed to send sale confirmation email for ${sellerEmail}:`,
                    error
                  );
                }
              }
            }
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
        console.log("STORE DETAILS", store);
        const stripeTransferForStore = await stripe.transfers.create({
          amount: Math.round(storeCut * 100), // Stripe requires amounts in pence (smallest currency unit)
          currency: store?.currency?.toString() || "GBP",
          destination: store?.stripe_connect_unique_id || "",
          transfer_group: `order_${orderId}`,
          metadata: {
            store_id: session?.metadata?.storeId ?? "",
            order_id: orderId,
            seller_id: sellerIds.join(","),
            total_sales: totalSales,
            total_sales_after_fees: totalSalesAfterFees,
            store_cut: storeCut,
            consignment_rates: JSON.stringify(
              products.map((product) => ({
                productId: product.id,
                productName: product.name,
                productSeller: product?.seller?.storeName,
                consignmentRate:
                  product?.seller?.consignmentRate ??
                  store?.consignmentRate ??
                  50,
              }))
            ),
            total_fees: totalFees,
            products: productIds.join(","),
          },
        });
        const storePayoutRecord = await prismadb.payout.create({
          data: {
            storeId: session?.metadata?.storeId || "",
            sellerId: session?.metadata?.storeId || "",
            amount: new Prisma.Decimal(storeCut), // Amount after fees
            transferGroupId: `order_${orderId}`,
            stripeTransferId: stripeTransferForStore.id,
            orderId: orderId,
          },
        });
        console.log(
          `[INFO] ${logKey} stripeTransferForStore: `,
          stripeTransferForStore
        );
        console.log(`[INFO] ${logKey} storePayoutRecord: `, storePayoutRecord);
        // TODO: if this is successful then update the product to sellerPayedOut=true
      } catch (error) {
        console.error(
          `[ERROR] ${logKey} Error creating Stripe transfer for store:`,
          error
        );
      }

      // HANDLE USER AND KLAVIYO
      const userEmail = session.customer_details?.email || "";
      const userName = session.customer_details?.name || "";
      let klaviyoProfileId = "";
      const promoCode = userEmail
        .split("@")[0]
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();

      const existingUser = await prismadb.user.findUnique({
        where: { email: userEmail },
      });

      const orderWithUser = await prismadb.order.update({
        where: { id: orderId },
        data: {
          userId: existingUser?.id,
        },
      });
      console.log(
        `[INFO] ${logKey} User successfully attached to order: `,
        orderWithUser
      );

      try {
        // If not existing user, create a new user and send them a welcome email with promo code
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(userEmail, 12);
          const newUser = await prismadb.user.create({
            data: {
              email: userEmail,
              name: userName,
              hashedPassword: hashedPassword,
            },
          });
          const orderWithNewUser = await prismadb.order.update({
            where: { id: orderId },
            data: {
              userId: newUser?.id,
            },
          });
          console.log(
            `[INFO] ${logKey} User successfully attached to order: `,
            orderWithNewUser
          );
          console.log(`[INFO] ${logKey} newUser: ${newUser}`);

          try {
            const stripePromoCode = await stripe.promotionCodes.create({
              coupon: "2FkJJiek",
              code: `${promoCode}`,
              max_redemptions: 1,
            });
            console.log(`[INFO] ${logKey} stripePromoCode: ${stripePromoCode}`);
          } catch (stripeError) {
            console.warn(
              `[WARNING] ${logKey} Failed to create Stripe promo code:`,
              (stripeError as Error).message
            );
          }

          try {
            const newProfile = await createProfileInKlaviyo(
              userName,
              userEmail,
              promoCode
            );
            klaviyoProfileId = newProfile?.data?.id || "";
            console.log(`[INFO] ${logKey} newProfile Klaviyo: ${newProfile}`);

            await postUserToKlaviyoWelcomeList(
              userName,
              userEmail,
              klaviyoProfileId,
              "WPxyeH"
            );
          } catch (klaviyoError) {
            console.warn(
              `[WARNING] ${logKey} Failed to create or post to Klaviyo profile:`,
              (klaviyoError as Error).message
            );
          }
        } else {
          // If existing user, find their Klaviyo profile and send them an order confirmation email
          try {
            const klaviyoProfile = await findProfileInKlaviyo(userEmail);
            console.log(
              `[INFO] ${logKey} existing klaviyoProfile: ${klaviyoProfile}`
            );

            if (klaviyoProfile?.data?.length > 0) {
              klaviyoProfileId = klaviyoProfile.data[0].id;
            } else {
              // Handle case where user exists in DB but not in Klaviyo
              const newProfile = await createProfileInKlaviyo(
                userName,
                userEmail,
                promoCode
              );
              klaviyoProfileId = newProfile?.data?.id || "";
              console.log(
                `[INFO] ${logKey} newProfile Klaviyo from edge case: ${newProfile}`
              );
            }
          } catch (klaviyoError) {
            console.warn(
              `[WARNING] ${logKey} Failed to fetch or create Klaviyo profile:`,
              (klaviyoError as Error).message
            );
          }
        }

        try {
          const orderConfirmationEmail = await postOrderConfirmationEmail(
            orderId,
            userEmail,
            userName,
            JSON.stringify(session.customer_details?.address),
            klaviyoProfileId,
            products
          );
          console.log(
            `[INFO] ${logKey} orderConfirmationEmail: ${orderConfirmationEmail}`
          );
        } catch (emailError) {
          console.warn(
            `[WARNING] ${logKey} Failed to send order confirmation email:`,
            (emailError as Error).message
          );
        }
      } catch (error) {
        console.error(
          `[ERROR] ${logKey} General error in user processing:`,
          error
        );
      }

      console.log(
        `[SUCCESS] ${logKey} ORDER ${orderId} COMPLETE and PAYMENT PROCESSED`
      );

      return NextResponse.json({ success: true, productIds, orderId });
    } else {
      return NextResponse.json(
        { success: false, message: "Payment not completed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// if (existingUser) {
//   // Proceed with update only if the user is valid
//   const updatedUser = await prismadb.user.update({
//     where: { id: existingUser.id },
//     data: {
//       purchaseHistory: {
//         connect: products.map((product) => ({ id: product.id })),
//       },
//       orderHistory: {
//         connect: { id: orderId },
//       },
//       totalPurchases: { increment: totalSales },
//       totalItemsPurchased: { increment: products.length },
//       totalTransactionCount: { increment: 1 },
//       interactingStaff: { connect: { id: session?.metadata?.storeId } },
//     },
//   });
//   console.log(`[INFO] ${logKey} Updated user details: `, updatedUser);
// } else {
//   console.log(
//     `[INFO] ${logKey} No existing user found for userId: ${existingUser}`
//   );
// }

// if (!existingUser) {
//   const hashedPassword = await bcrypt.hash(userEmail, 12);
//   const newUser = await prismadb.user.create({
//     data: {
//       email: userEmail,
//       name: userName,
//       hashedPassword: hashedPassword,
//     },
//   }
// );
// console.log(
//   `[INFO] ${logKey} newUser: ${newUser}`
// );

//   promoCode = userEmail
//     .split("@")[0]
//     .replace(/[^a-zA-Z0-9]/g, "")
//     .toUpperCase();

//   const stripePromoCode = await stripe.promotionCodes.create({
//     coupon: "2FkJJiek",
//     code: `${promoCode}`,
//     max_redemptions: 1,
//   });

//   console.log(
//     `[INFO] ${logKey} stripePromoCode: ${stripePromoCode}`
//   );

//   const newProfile = await createProfileInKlaviyo(
//     userName,
//     userEmail,
//     promoCode
//   );
//   klaviyoProfileId = newProfile.data.id;

//   console.log(
//     `[INFO] ${logKey} newProfile Klaviyo: ${newProfile}`
//   );

//   await postUserToKlaviyoWelcomeList(
//     userName,
//     userEmail,
//     klaviyoProfileId,
//     "WPxyeH"
//   );
// } else {
//   const klaviyoProfile = await findProfileInKlaviyo(userEmail);
//   console.log(
//     `[INFO] ${logKey} existing klaviyoProfile: ${klaviyoProfile}`
//   );
//   if (klaviyoProfile.data && klaviyoProfile.data.length > 0) {
//     klaviyoProfileId = klaviyoProfile.data[0].id;
//   } else {
//     // Handle case where the user exists in the DB but not in Klaviyo (rare edge case)
//     const newProfile = await createProfileInKlaviyo(
//       userName,
//       userEmail,
//       promoCode
//     );
//     klaviyoProfileId = newProfile.data.id;
//     console.log(
//       `[INFO] ${logKey} newProfile Klaviyo from edge case: ${newProfile}`
//     );
//   }
// }

// const orderConfirmationEmail = await postOrderConfirmationEmail(
//   orderId,
//   userEmail,
//   userName,
//   JSON.stringify(session.customer_details?.address),
//   klaviyoProfileId,
//   products
// );
