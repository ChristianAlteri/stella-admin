import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { createProfileInKlaviyo } from "@/actions/klaviyo/create-profile-in-klaviyo";
import { postUserToKlaviyoWelcomeList } from "@/actions/klaviyo/post-profile-to-klaviyo-welcome-list";
import { findProfileInKlaviyo } from "@/actions/klaviyo/find-profile-in-klaviyo";
import { postOrderConfirmationEmail } from "@/actions/klaviyo/post-order-confirmation";

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
        select: { productId: true },
      });

      const productIds = orderItems.map((item) => item.productId);

      await prismadb.product.updateMany({
        where: { id: { in: productIds } },
        data: { isArchived: true },
      });

      const products = await prismadb.product.findMany({
        where: { id: { in: productIds } },
        include: { seller: true, designer: true, category: true },
        // select: { sellerId: true },
      });
      console.log("products", products);

      const sellerIds = products.map((product) => product.sellerId);

      await prismadb.seller.updateMany({
        where: { id: { in: sellerIds } },
        data: { soldCount: { increment: 1 } },
      });

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
        console.log("New user created", newUser);
      } else {
        const klaviyoProfile = await findProfileInKlaviyo(userEmail);
        if (klaviyoProfile.data && klaviyoProfile.data.length > 0) {
          klaviyoProfileId = klaviyoProfile.data[0].id;
        } else {
          // Handle case where the user exists in the DB but not in Klaviyo (rare edge case)
          const newProfile = await createProfileInKlaviyo(userName, userEmail, promoCode);
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
      console.log("Order Details", orderId,
        userEmail,
        userName,
        JSON.stringify(session.customer_details?.address),
        klaviyoProfileId,
        products);

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

// import bcrypt from "bcrypt";
// import { NextResponse } from "next/server";
// import { stripe } from "@/lib/stripe";
// import prismadb from "@/lib/prismadb";
// import { createProfileInKlaviyo } from "@/actions/klaviyo/create-profile-in-klaviyo";
// // import { postUserToKlaviyoSuccessfulPurchaseList } from "@/actions/klaviyo/post-profile-to-klaviyo-successful-purchase-list";
// import { postUserToKlaviyoWelcomeList } from "@/actions/klaviyo/post-profile-to-klaviyo-welcome-list";
// import { findProfileInKlaviyo } from "@/actions/klaviyo/find-profile-in-klaviyo";
// import { postOrderConfirmationEmail } from "@/actions/klaviyo/post-order-confirmation";

// export async function OPTIONS(request: Request) {
//   const headers = new Headers();
//   headers.set("Access-Control-Allow-Origin", "*");
//   headers.set(
//     "Access-Control-Allow-Methods",
//     "GET,OPTIONS,PATCH,DELETE,POST,PUT"
//   );
//   headers.set(
//     "Access-Control-Allow-Headers",
//     "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
//   );
//   headers.set("Access-Control-Allow-Credentials", "true");

//   return new NextResponse(null, { status: 204, headers });
// }

// export async function POST(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const session_id = searchParams.get("session_id");

//   if (!session_id || typeof session_id !== "string") {
//     return NextResponse.json(
//       { success: false, message: "Invalid session ID" },
//       { status: 400 }
//     );
//   }
//   const headers = new Headers();
//   headers.set("Access-Control-Allow-Origin", "*");

//   try {
//     const session = await stripe.checkout.sessions.retrieve(session_id);

//     if (session.payment_status === "paid") {
//       const orderId = session.metadata?.orderId;
//       // Process the successful order
//       if (orderId) {
//         const successfulOrder = await prismadb.order.update({
//           where: { id: orderId },
//           data: {
//             isPaid: true,
//             address: JSON.stringify(session.customer_details?.address),
//             phone: session.customer_details?.phone || "",
//             email: session.customer_details?.email || "",
//           },
//         });

//         // Fetch the related order items to get the product IDs
//         const orderItems = await prismadb.orderItem.findMany({
//           where: { orderId },
//           select: { productId: true },
//         });
//         // console.log("orderItems", orderItems);

//         const productIds = orderItems.map((item) => item.productId);

//         // Update the products to set isArchived to true
//         const soldProduct = await prismadb.product.updateMany({
//           where: { id: { in: productIds } },
//           data: { isArchived: true },
//         });

//         // Fetch the products to get the seller IDs
//         const products = await prismadb.product.findMany({
//           where: { id: { in: productIds } },
//           select: { sellerId: true },
//         });

//         const sellerIds = products.map((product) => product.sellerId);

//         // Increment the soldCount for the corresponding sellers
//         const updatedSeller = await prismadb.seller.updateMany({
//           where: { id: { in: sellerIds } },
//           data: { soldCount: { increment: 1 } },
//         });
//         // console.log("updatedSeller", updatedSeller);

//         const userEmail = session.customer_details?.email || "";
//         const userName = session.customer_details?.name || "";
//         let klaviyoProfileId = "";
//         // create a promo code for first time buyers
//         const promoCode = userEmail
//           .split("@")[0]
//           .replace(/[^a-zA-Z0-9]/g, "")
//           .toUpperCase();

//         // Create and check for user in our db and Klaviyo
//         try {
//           // Find the user in our db
//           const existingUser = await prismadb.user.findUnique({
//             where: { email: userEmail },
//           });
//           // Find the user in our Klaviyo
//           const klaviyoProfile = await findProfileInKlaviyo(userEmail);

//           if (!existingUser) {
//             // Create a new user in our db (Un-registered with us but bought something)
//             const hashedPassword = await bcrypt.hash(
//               session.customer_details?.email || "anondrobe",
//               12
//             );
//             const user = await prismadb.user.create({
//               data: {
//                 email: session.customer_details?.email || "",
//                 name: session.customer_details?.name || "",
//                 hashedPassword: hashedPassword,
//               },
//             });
//             // Create a promotion code in Stripe linked to a coupon
//             const stripe = require('stripe')(process.env.STRIPE_API_KEY);
//             const promotionCode = await stripe.promotionCodes.create({
//               coupon: '2FkJJiek',
//               code: `${promoCode}`,
//               max_redemptions: 1,
//             });
//             console.log("Created a new user", user + "promotionCode", promotionCode);

//             if (!klaviyoProfile.data || klaviyoProfile.data.length === 0) {
//               // Create a new profile in Klaviyo
//               const newProfile = await createProfileInKlaviyo(
//                 userName,
//                 userEmail,
//                 promoCode
//               );
//               klaviyoProfileId = newProfile.data.id;
//               // Add the user to the welcome list
//               await postUserToKlaviyoWelcomeList(
//                 userName,
//                 userEmail,
//                 klaviyoProfileId,
//                 "WPxyeH"
//               );

//               console.log("newProfile", newProfile );
//             } else {
//               // (Registered to anondrobe and Klaviyo (because they have gone through the register api))
//               klaviyoProfileId = klaviyoProfile.data[0].id;
//               console.log("existing klaviyo", klaviyoProfile.data[0]?.email);
//             }
//           } else {
//             // If we find the user in our db check if they are in Klaviyo, if not add them.
//             if (!klaviyoProfile.data || klaviyoProfile.data.length === 0) {
//               const newProfile = await createProfileInKlaviyo(                userName,
//                 userEmail,
//                 promoCode
//               );
//               klaviyoProfileId = newProfile.data[0].id;
//             } else {
//               // If user exists in both our db and Klaviyo, just send them an order confirmation. (Registered user and has bought before)
//               klaviyoProfileId = klaviyoProfile.data[0].id;
//             }
//           }
//         } catch (error) {
//           console.error("Error creating or checking user:", error);
//         }

//         // TODO: Put function to send an email confirmation once to the user

//         const orderConfirmationEmail = await postOrderConfirmationEmail(
//           orderId,
//           session.customer_details?.email,
//           session.customer_details?.name,
//           JSON.stringify(session.customer_details?.address),
//           klaviyoProfileId,
//           products
//         );
//         console.log("orderConfirmationEmail", orderConfirmationEmail);

//         // console.log("SUCCESSFULL ORDER", {
//         //   success: true,
//         //   productIds,
//         //   orderId,
//         // });
//         return NextResponse.json({ success: true, productIds, orderId });
//       } else {
//         return NextResponse.json(
//           { success: false, message: "Order ID not found in session metadata" },
//           { status: 400 }
//         );
//       }
//     } else {
//       return NextResponse.json(
//         { success: false, message: "Payment not completed" },
//         { status: 400 }
//       );
//     }
//   } catch (error) {
//     console.error("Error verifying payment:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
