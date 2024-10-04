"use client";
import React, { useState } from "react";
import { useStripeConnect } from "@/hooks/use-stripe-connect";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { Button } from "@/components/ui/button";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const StripeConnect = () => {
  const router = useRouter();
  const params = useParams(); // Use params to get storeId
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("sellerId"); // Use searchParams to get sellerId
  // const storeId = searchParams.get("storeId"); //can we also get storeId from searchParams?
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [onboardingExited, setOnboardingExited] = useState(false);
  const [error, setError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState("");
  const stripeConnectInstance = useStripeConnect(connectedAccountId);


  const handleCreateStripeAccount = async () => {
    setAccountCreatePending(true);
    setError(false);

    try {
      // Create Stripe Connect account via API
      const stripeAccount = await fetch(
        `/api/${params.storeId}/stripe/account`,
        {
          method: "POST",
        }
      );
      const json = await stripeAccount.json();
      const { account, error } = json;
      if (account) {
        // Connect Stripe account to Seller
        setConnectedAccountId(account.id);
        const updatedSeller = await axios.patch(
          `/api/${params.storeId}/sellers/${sellerId}`,
          { connectedAccountId: account.id }
        );
      } else {
        console.error("Failed to update seller with Stripe account");
        setError(true);
      }
    } catch (err) {
      console.error("Error creating Stripe account:", err);
      setError(true);
    } finally {
      setAccountCreatePending(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      {!accountCreatePending && !connectedAccountId && (
        <div>
          <Button onClick={handleCreateStripeAccount}>
            Create a stripe connect account
          </Button>
        </div>
      )}
      {stripeConnectInstance && (
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
          <ConnectAccountOnboarding
            onExit={() => {
              setOnboardingExited(true);
              router.push(`/${params.storeId}/sellers`); // Redirect to sellers page on exit
            }}
          />
        </ConnectComponentsProvider>
      )}
      {error && (
        <p className="error flex w-full h-full">Something went wrong!</p>
      )}
      {(connectedAccountId || accountCreatePending || onboardingExited) && (
        <div className="dev-callout">
          {accountCreatePending && <p>Creating a connected account...</p>}
          {onboardingExited && (
            <p>The Seller now has an account you can payout</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StripeConnect;
