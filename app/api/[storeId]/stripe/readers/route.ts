import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const readers = await stripe.terminal.readers.list();
    console.log("readers", readers.data);
    return NextResponse.json({ readers: readers.data });
  } catch (error) {
    console.error("Error creating listing readers:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
