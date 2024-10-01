import { stripe_connect } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (req.method === 'POST') {
    try {
      const { account } = await req.json();
      console.log("account from session", account);  

      if (!account) {
        return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
      }

      const accountSession = await stripe_connect.accountSessions.create({
        account: account,
        components: {
          account_onboarding: { enabled: true },
        },
      });
      console.log('In account session', accountSession);
      return NextResponse.json({
        client_secret: accountSession.client_secret,
      });
    } catch (error: any) {
      console.error(
        "An error occurred when calling the Stripe API to create an account session:",
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}
