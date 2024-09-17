import Stripe from "stripe";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';


import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function OPTIONS(request: Request) {
  // Just return a simple OK response without setting any CORS headers.
  return new NextResponse(null, { status: 200 });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { productIds } = await req.json();

  if (!productIds || productIds.length === 0) {
    return new NextResponse("CHECKOUT Product ids are required", {
      status: 400,
    });
  }

  // Fetch products and their associated seller
  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    include: {
      seller: true,
    },
  });

  // TODO: I want to be able to add a userId to the order
  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,

      isPaid: false,
      orderItems: {
        create: products.map((product) => ({
          stripe_connect_unique_id: product.seller.stripe_connect_unique_id,
          productAmount: product.ourPrice,
          product: {
            connect: {
              id: product.id, // Connect the product to the orderItem
            },
          },
          seller: {
            connect: {
              id: product.seller.id, // Connect the seller to the orderItem
            },
          },
        })),
      },
    },
  });

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  products.forEach((product) => {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "GBP",
        product_data: {
          name: product.name,
        },
        unit_amount: product.ourPrice.toNumber() * 100,
      },
    });
  });
  console.log(`order at checkout order_${order.id}`);

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true,
    },
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "IT"],
    },
    shipping_options: [
      { shipping_rate: "shr_1Oor5xBvscKKdpTG4Z2tIKyI" },
      // Add more shipping rates as needed
    ],
    allow_promotion_codes: true,
    success_url: `${process.env.FRONTEND_STORE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id,
    },
    payment_intent_data: {
    transfer_group: `order_${order.id}`,
    },
  });

  return NextResponse.json({ url: session.url }, { status: 200 });
}
