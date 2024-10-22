import prismadb from "@/lib/prismadb";
import { stripe_connect } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";


export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {

  try {
    const store = await prismadb.store.findUnique({
      where: { id: params.storeId },
    })
    console.log("store?.countryCode?.toString()", store?.countryCode?.toString());
    const account = await stripe_connect.accounts.create({
      controller: {
        stripe_dashboard: {
          type: "none",
        },
        fees: {
          payer: "application",
        },
        losses: {
          payments: "application",
        },
        requirement_collection: "application",
      },
      capabilities: {
        transfers: { requested: true },
      },
      country: store?.countryCode?.toString() || "GB", 
    });

    console.log("STRIPE ACCOUNT CREATION", account);
    return NextResponse.json({ success: true, account: account });
  } catch (error: any) {
    console.error(
      "An error occurred when calling the Stripe API to create an account:",
      error.message
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}