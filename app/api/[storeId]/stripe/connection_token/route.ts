import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const connectionToken = await stripe.terminal.connectionTokens.create();
    console.log("connectionToken", connectionToken);
    return NextResponse.json({ secret: connectionToken.secret });
  } catch (error) {
    console.error("Error creating connection token:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
