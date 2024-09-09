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

// import { stripe_connect } from "@/lib/stripe";

// export default async function handler(req: any, res: any) {
//   if (req.method === 'POST') {
//     try {
//       const accountSession = await stripe_connect.accountSessions.create({
//         account: req.body.account,
//         components: {
//           account_onboarding: { enabled: true },
//         }
//       });

//       res.json({
//         client_secret: accountSession.client_secret,
//       });
//     } catch (error) {
//       console.error(
//         "An error occurred when calling the Stripe API to create an account session",
//         error
//       );
//       res.status(500);
//       res.json({error: error as any});
//     }
//   }
// }