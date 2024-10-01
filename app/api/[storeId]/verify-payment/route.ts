import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { createProfileInKlaviyo } from "@/actions/klaviyo/create-profile-in-klaviyo";
import { postUserToKlaviyoWelcomeList } from "@/actions/klaviyo/post-profile-to-klaviyo-welcome-list";
import { findProfileInKlaviyo } from "@/actions/klaviyo/find-profile-in-klaviyo";
import { postOrderConfirmationEmail } from "@/actions/klaviyo/post-order-confirmation";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get("session_id");

  if (!session_id || typeof session_id !== "string") {
    return NextResponse.json(
      { success: false, message: "Invalid session ID" },
      { status: 400 }
    );
  }
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        return NextResponse.json(
          { success: false, message: "Order ID not found in session metadata" },
          { status: 400 }
        );
      }

      const successfulOrder = await prismadb.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          address: JSON.stringify(session.customer_details?.address),
          phone: session.customer_details?.phone || "",
          email: session.customer_details?.email || "",
        },
      });

      const orderItems = await prismadb.orderItem.findMany({
        where: { orderId },
        include: {
          product: {
            include: {
              seller: true,
            },
          },
        },
      });

      const productIds = orderItems.map((item) => item.productId);

      await prismadb.product.updateMany({
        where: { id: { in: productIds } },
        data: { isArchived: true },
      });

      const products = await prismadb.product.findMany({
        where: { id: { in: productIds } },
        include: { seller: true, designer: true, category: true },
      });
      const sellerIds = products.map((product) => product.seller.id);

      await prismadb.seller.updateMany({
        where: { id: { in: sellerIds } },
        data: { soldCount: { increment: 1 } },
      });

      // PAYOUT SELLERS
      // Group the order items by seller (stripe_connect_unique_id)
      const sellerPayouts = products.reduce<{ [key: string]: number }>(
        (acc, product) => {
          if (!acc[product.seller.stripe_connect_unique_id!]) {
            acc[product.seller.stripe_connect_unique_id!] = 0;
          }
          acc[product.seller.stripe_connect_unique_id!] +=
            product.ourPrice.toNumber();
          return acc;
        },
        {}
      );
      console.log("sellerPayouts: ", sellerPayouts);
      // Iterate over the sellerPayouts and create Stripe transfers for each seller then store the payout in the DB
      for (const [stripe_connect_unique_id, totalAmount] of Object.entries(
        sellerPayouts
      )) {
        const stripeTransfer = await stripe.transfers.create({
          amount: Math.round(totalAmount * 0.70 * 100), // Stripe needs * 100 this equals 70% to sellers
          currency: "GBP",
          // TODO: fetch the store id then set the config variables 
          // currency: store?.currency?.toString() || "GBP",
          destination: stripe_connect_unique_id,
          transfer_group: `order_${orderId}`,
        });
        console.log("stripeTransfer: ", stripeTransfer);
        // Find the actual sellerWhoSoldId based on the stripe_connect_unique_id
        const sellerWhoSoldId = products.find(
          (product) =>
            product.seller.stripe_connect_unique_id === stripe_connect_unique_id
        )?.seller.id;

        if (sellerWhoSoldId) {
          const payout = await prismadb.payout.create({
            data: {
              sellerId: sellerWhoSoldId,
              amount: new Prisma.Decimal(totalAmount * 0.7), // Our db is okay with * 0.7
              transferGroupId: `order_${orderId}`,
              stripeTransferId: stripeTransfer.id,
            },
          });
          console.log("payout: ", payout);
        } else {
          console.error(
            `Seller with Stripe Connect ID ${stripe_connect_unique_id} not found.`
          );
        }
      }

      const userEmail = session.customer_details?.email || "";
      const userName = session.customer_details?.name || "";
      let klaviyoProfileId = "";
      let promoCode = "";

      const existingUser = await prismadb.user.findUnique({
        where: { email: userEmail },
      });

      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userEmail, 12);
        const newUser = await prismadb.user.create({
          data: {
            email: userEmail,
            name: userName,
            hashedPassword: hashedPassword,
          },
        });

        promoCode = userEmail
          .split("@")[0]
          .replace(/[^a-zA-Z0-9]/g, "")
          .toUpperCase();

        await stripe.promotionCodes.create({
          coupon: "2FkJJiek",
          code: `${promoCode}`,
          max_redemptions: 1,
        });

        const newProfile = await createProfileInKlaviyo(
          userName,
          userEmail,
          promoCode
        );
        klaviyoProfileId = newProfile.data.id;

        await postUserToKlaviyoWelcomeList(
          userName,
          userEmail,
          klaviyoProfileId,
          "WPxyeH"
        );

      } else {
        const klaviyoProfile = await findProfileInKlaviyo(userEmail);
        if (klaviyoProfile.data && klaviyoProfile.data.length > 0) {
          klaviyoProfileId = klaviyoProfile.data[0].id;
        } else {
          // Handle case where the user exists in the DB but not in Klaviyo (rare edge case)
          const newProfile = await createProfileInKlaviyo(
            userName,
            userEmail,
            promoCode
          );
          klaviyoProfileId = newProfile.data.id;
        }
      }

      await postOrderConfirmationEmail(
        orderId,
        userEmail,
        userName,
        JSON.stringify(session.customer_details?.address),
        klaviyoProfileId,
        products
      );

      // TODO: Figure out how to get global context of a logged in user and update their orders. This may be something to pass in from the frontend.

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
