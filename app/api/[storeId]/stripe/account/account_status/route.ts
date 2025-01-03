import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const { stripe_connect_unique_id } = await req.json();

    // Validate the presence of stripe_connect_unique_id
    if (!stripe_connect_unique_id) {
      return NextResponse.json(
        { connected: false, error: "Missing Stripe account ID." },
        { status: 400 }
      );
    }

    // Retrieve the Stripe account
    const account: Stripe.Account = await stripe.accounts.retrieve(
      stripe_connect_unique_id
    );

    console.log("[API_STRIPE_ACCOUNT_GET]", account);

    // Perform connection checks
    const isChargesEnabled = account.charges_enabled;
    const isPayoutsEnabled = account.payouts_enabled;
    const areDetailsSubmitted = account.details_submitted;
    const hasConnectedAccount = account.requirements?.pending_verification?.includes(
        "currently_due"
    );
    const disabled_reason = account.requirements?.disabled_reason

    // Check all required capabilities are active
    const capabilities = account.capabilities || {};

    // Define the required capabilities explicitly using keyof to ensure type safety
    const requiredCapabilities: Array<keyof Stripe.Account.Capabilities> = [
      "transfers", // Add more capabilities as needed, e.g., "card_payments"
    ];

    const areCapabilitiesActive = requiredCapabilities.every(
      (cap) => capabilities[cap] === "active"
    );

    // Check that all requirement arrays are empty or null
    const requirements: Stripe.Account.Requirements = account.requirements || {
      alternatives: null,
      current_deadline: null,
      currently_due: [],
      disabled_reason: null,
      errors: [],
      eventually_due: [],
      past_due: [],
      pending_verification: [],
    };
    const requirementFields: Array<keyof Stripe.Account.Requirements> = [
      "currently_due",
      "eventually_due",
      "past_due",
      "pending_verification",
      "errors",
      "alternatives",
    ];

    const areRequirementsFulfilled = requirementFields.every((field) => {
      const value = requirements[field];
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      return value === null;
    });

    // Determine if the account is fully connected
    const isConnected =
      isChargesEnabled &&
      isPayoutsEnabled &&
      areDetailsSubmitted &&
      areCapabilitiesActive &&
      areRequirementsFulfilled;

    console.log("isConnected", { connected: isConnected });
    return NextResponse.json({ connected: isConnected, account: account, disabled_reason: disabled_reason });
  } catch (error: any) {
    console.error("Error retrieving seller's Stripe account:", error);

    // Handle specific Stripe errors if needed
    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { connected: false, error: "Invalid Stripe account ID." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { connected: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}

// import { stripe } from "@/lib/stripe";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const { stripe_connect_unique_id } = await req.json();

//   try {
//     const account = await stripe.accounts.retrieve(stripe_connect_unique_id);
//     console.log("[API_STRIPE_ACCOUNT_GET]", account);
//     return NextResponse.json(account);
//   } catch (error) {
//     console.error("Error retrieving sellers stripe account", error);
//     return NextResponse.json({ error: error }, { status: 500 });
//   }
// }
