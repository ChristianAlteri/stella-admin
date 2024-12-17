import Stripe from "stripe";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { Prisma, Store } from "@prisma/client";

const logKey = "CHECKOUT";

export async function OPTIONS(request: Request) {
  // Just return a simple OK response without setting any CORS headers.
  return new NextResponse(null, { status: 200 });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { productIds } = await req.json();
  console.log(`[ENTERING_${logKey}] productIds:`, productIds);
  console.log(`[DEBUG_${logKey}] params.storeId:`, params.storeId);

  if (!productIds || productIds.length === 0) {
    return NextResponse.json(
      { success: false, message: "Product IDs are required" },
      { status: 400 }
    );
  }

  let store: Store | null;
  try {
    store = await prismadb.store.findUnique({ where: { id: params.storeId } });
    if (!store) {
      throw new Error("Store not found");
    }
    console.log(`[INFO API_${logKey}] store:`, store);
  } catch (error) {
    console.error(`[ERROR API_${logKey}] Error fetching store:`, error);
    return NextResponse.json(
      { success: false, message: "Error fetching store data" },
      { status: 404 }
    );
  }

  let products;
  try {
    products = await prismadb.product.findMany({
      where: { id: { in: productIds } },
      include: { seller: true },
    });
    if (products.length === 0) {
      throw new Error("No products found for the provided IDs");
    }
    console.log(`[INFO API_${logKey}] products:`, JSON.stringify(products));
  } catch (error) {
    console.error(`[ERROR API_${logKey}] Error fetching products:`, error);
    return NextResponse.json(
      { success: false, message: "Error fetching products data" },
      { status: 404 }
    );
  }

  const totalSales = products.reduce(
    (acc, product) => acc + product.ourPrice.toNumber(),
    0
  );
  console.log(`[INFO API_${logKey}] totalSales:`, totalSales);

  let newOrder;
  try {
    newOrder = await prismadb.order.create({
      data: {
        store: { connect: { id: store.id } },
        isPaid: false, // Not paid until the payment is successful and that happens in /success
        inStoreSale: false,
        totalAmount: new Prisma.Decimal(totalSales),
        soldByStaff: {
          connect: { id: store.id },
        },
        orderItems: {
          create: products.map((product) => ({
            stripe_connect_unique_id: product.seller.stripe_connect_unique_id,
            soldByStaff: {
              connect: { id: store?.id || "" },
            },
            productAmount: new Prisma.Decimal(product.ourPrice),
            product: {
              connect: {
                id: product.id,
              },
            },
            seller: {
              connect: {
                id: product.seller.id,
              },
            },
            store: {
              connect: {
                id: params.storeId,
              },
            },
          })),
        },
        // ...(userId && { userId: userId }),
      },
    });
    console.log(`[INFO API_${logKey}] newOrder created:`, newOrder);
  } catch (error) {
    console.error(`[ERROR API_${logKey}] Error creating order:`, error);
    return NextResponse.json(
      { success: false, message: "Error creating order" },
      { status: 500 }
    );
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  try {
    products.forEach((product) => {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: store?.currency || "GBP",
          product_data: { name: product.name },
          unit_amount: product.ourPrice.toNumber() * 100,
        },
      });
    });
  } catch (error) {
    console.error(`[ERROR API_${logKey}] Error creating line items:`, error);
    return NextResponse.json(
      { success: false, message: "Error preparing checkout session items" },
      { status: 500 }
    );
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["AU"] },
      shipping_options: [
        // { shipping_rate: "shr_1QSammKCnSe3p09QJslPWBG3" }, // Dev
        { shipping_rate: "shr_1QUPUpKCnSe3p09QMK1xShGT" }, // Prod
      ],
      // allow_promotion_codes: true,
      success_url: `${process.env.FRONTEND_STORE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
      metadata: {
        orderId: newOrder.id,
        storeId: store.id,
        productIds: productIds.join(","),
      },
      payment_intent_data: {
        transfer_group: `order_${newOrder.id}`,
      },
    });
    console.log(`[INFO API_${logKey}] Checkout session created:`, session);
  } catch (error) {
    console.error(
      `[ERROR API_${logKey}] Error creating Stripe session:`,
      error
    );
    return NextResponse.json(
      { success: false, message: "Error creating payment session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url }, { status: 200 });
}

// import Stripe from "stripe";
// import { NextResponse } from "next/server";
// import { v4 as uuidv4 } from "uuid";

// import { stripe } from "@/lib/stripe";
// import prismadb from "@/lib/prismadb";
// import { Prisma, Store } from "@prisma/client";

// const logKey = "CHECKOUT";

// export async function OPTIONS(request: Request) {
//   // Just return a simple OK response without setting any CORS headers.
//   return new NextResponse(null, { status: 200 });
// }

// export async function POST(
//   req: Request,
//   { params }: { params: { storeId: string } }
// ) {
//   // This route creates them order and sends to stripe then back to our front end which sends it to the verify-online-payment route
//   let store: Store | null;
//   // TODO: Grab user id from front end
//   // const { productIds, userId } = await req.json();
//   const { productIds } = await req.json();
//   console.log(`[ENTERING_${logKey}] and product ids`, productIds);
//   console.log(`[DEBUG_${logKey}] params.storeId`, params.storeId);

//   try {
//     store = await prismadb.store.findUnique({
//       where: { id: params.storeId },
//     });
//     console.log(`[INFO API_${logKey}] store`, store);

//     if (!store) {
//       return NextResponse.json(
//         { success: false, message: "Store not found" },
//         { status: 404 }
//       );
//     }
//   } catch (error) {
//     console.error(`[ERROR] Store not found: `, error);
//     return NextResponse.json(
//       { success: false, message: "Store not found" },
//       { status: 404 }
//     );
//   }

//   if (!productIds || productIds.length === 0) {
//     return new NextResponse("[ERROR API_${logKey}] Product ids are required", {
//       status: 400,
//     });
//   }

//   // Fetch products and their associated seller
//   const products = await prismadb.product.findMany({
//     where: { id: { in: productIds } },
//     include: { seller: true },
//   });
//   console.log(`[INFO] ${logKey} products`, JSON.stringify(products));

//   // Calculate the total amount of the order (all products combined)
//   const totalSales = products.reduce(
//     (acc, product) => acc + product.ourPrice.toNumber(),
//     0
//   );

//   console.log(`[INFO] ${logKey} totalSales`, JSON.stringify(totalSales));

//   // TODO: When users can actually log in, we will need to get the userId from the session
//   let newOrder: any = null;
//   try {
//     // Create a new Order
//     newOrder = await prismadb.order.create({
//       data: {
//         store: { connect: { id: store.id } },
//         isPaid: false, // Not paid until the payment is successful and that happens in /success
//         inStoreSale: false,
//         totalAmount: new Prisma.Decimal(totalSales),
//         soldByStaff: {
//           connect: { id: store.id },
//         },
//         orderItems: {
//           create: products.map((product) => ({
//             stripe_connect_unique_id: product.seller.stripe_connect_unique_id,
//             soldByStaff: {
//               connect: { id: store?.id || "" },
//             },
//             productAmount: new Prisma.Decimal(product.ourPrice),
//             product: {
//               connect: {
//                 id: product.id,
//               },
//             },
//             seller: {
//               connect: {
//                 id: product.seller.id,
//               },
//             },
//             store: {
//               connect: {
//                 id: params.storeId,
//               },
//             },
//           })),
//         },
//         // ...(userId && { userId: userId }),
//       },
//     });
//     console.log(`[INFO] ${logKey} orderItems`, newOrder.orderItems);
//   } catch (error) {
//     console.error(`[ERROR] ${logKey} Error creating new order: `, error);
//     return NextResponse.json(
//       { success: false, message: "Error creating new order" },
//       { status: 500 }
//     );
//   }
//   console.log(`[INFO] ${logKey} newOrder`, JSON.stringify(newOrder));

//   const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

//   console.log(`[DEBUG] Store currency before line items: ${store.currency}`);

//   const itemCurrency = store?.currency || "GBP";
//   products.forEach((product) => {
//     line_items.push({
//       quantity: 1,
//       price_data: {
//         currency: itemCurrency,
//         product_data: {
//           name: product.name,
//         },
//         unit_amount: product.ourPrice.toNumber() * 100,
//       },
//     });
//   });
//   console.log(`[INFO API_${logKey}] order at checkout order_${newOrder.id}`);

//   const session = await stripe.checkout.sessions.create({
//     line_items,
//     mode: "payment",
//     billing_address_collection: "required",
//     phone_number_collection: {
//       enabled: true,
//     },
//     shipping_address_collection: {
//       allowed_countries: ["AU"],
//     },
//     shipping_options: [
//       // { shipping_rate: "shr_1QSammKCnSe3p09QJslPWBG3" }, // Dev
//       { shipping_rate: "shr_1QUPUpKCnSe3p09QMK1xShGT" }, // Prod
//     ],
//     allow_promotion_codes: true,
//     success_url: `${process.env.FRONTEND_STORE_URL}/${store.id}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${process.env.FRONTEND_STORE_URL}/${store.id}/cart?canceled=1`,
//     metadata: {
//       orderId: newOrder.id,
//       storeId: store.id,
//       productIds: productIds.join(","),
//     },
//     payment_intent_data: {
//       transfer_group: `order_${newOrder.id}`,
//     },
//   });

//   console.log(`[INFO API_${logKey}] Session sent to front end `, session);

//   return NextResponse.json({ url: session.url }, { status: 200 });
// }
