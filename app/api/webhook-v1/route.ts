// Not live yet go to  https://dashboard.stripe.com/webhooks/create?endpoint_location=hosted and setup the webhook
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const address = session?.customer_details?.address;

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ];

  const addressString = addressComponents.filter((c) => c !== null).join(", ");

  if (event.type === "checkout.session.completed") {
    // Step 1: Update the order to mark it as paid
    const order = await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId,
      },
      data: {
        isPaid: true,
        address: addressString,
        phone: session?.customer_details?.phone || "",
        email: session?.customer_details?.email || "",
      },
      include: {
        orderItems: true,
      },
    });

    console.log("Order at webhook", order);

    const productIds = order.orderItems.map((orderItem) => orderItem.productId);

    // Step 2: Archive the products that were sold
    await prismadb.product.updateMany({
      where: {
        id: {
          in: [...productIds],
        },
      },
      data: {
        isArchived: true,
      },
    });

    // Step 3: Fetch order items with product and seller details
    const orderItems = await prismadb.orderItem.findMany({
      where: { orderId: order.id },
      include: {
        product: {
          include: {
            seller: true,
          },
        },
      },
    });

    // Step 4: Group the order items by seller (stripe_connect_unique_id)
    const sellerPayouts = orderItems.reduce<{ [key: string]: number }>(
      (acc, item) => {
        const sellerStripeConnectId = item.product.seller.stripe_connect_unique_id;
        if (!acc[sellerStripeConnectId!]) {
          acc[sellerStripeConnectId!] = 0;
        }
        acc[sellerStripeConnectId!] += item.productAmount!.toNumber();
        return acc;
      },
      {}
    );

    // Step 5: Iterate over the sellerPayouts and create Stripe transfers for each seller
    for (const [stripeConnectId, totalAmount] of Object.entries(sellerPayouts)) {
      const stripeTransfer = await stripe.transfers.create({
        amount: Math.round(totalAmount * 0.70), // 70% to sellers
        currency: 'GBP',
        destination: stripeConnectId,
        transfer_group: `order_${order.id}`, // Use the order ID as the transfer group
      });

      // Step 6: Record the payout in the database
      await prismadb.payout.create({
        data: {
          sellerId: stripeConnectId,
          amount: new Prisma.Decimal(totalAmount * 0.70), // 70% of the total sale amount
          transferGroupId: `order_${order.id}`,
          stripeTransferId: stripeTransfer.id,
        },
      });
    }

    console.log("Order and payouts processed successfully.");
  }

  return new NextResponse(null, { status: 200 });
}
