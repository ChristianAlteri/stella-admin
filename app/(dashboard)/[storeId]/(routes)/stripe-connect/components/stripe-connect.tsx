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
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";

const StripeConnect = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("sellerId");
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
    <Card className="w-full">
      <div className="w-full ">
        {!accountCreatePending && !connectedAccountId && (
          <div className=" rounded-lg shadow-xl overflow-hidden w-full justify-center items-center flex flex-col">
            <div className="p-8 flex flex-col justify-center items-center">
              <div className="flex justify-center items-center mb-6">
                <CreditCard className="w-16 h-16 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">
                Connect Your Seller to Stripe
              </h2>
              <Button
                onClick={handleCreateStripeAccount}
                className="w-full  text-white font-bold py-3 px-4 rounded-lg transition duration-300"
              >
                Connect a seller to Stripe
              </Button>
            </div>
          </div>
        )}
        {stripeConnectInstance && (
          <div className="flex h-full">
            <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
              <ConnectAccountOnboarding
              
                onExit={() => {
                  setOnboardingExited(true);
                  router.push(`/${params.storeId}/sellers`); // Redirect to sellers page on exit
                }}
              />
            </ConnectComponentsProvider>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mt-4"
            role="alert"
          >
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" />
              <p>Oops! Something went wrong. Please try again later.</p>
            </div>
          </div>
        )}
        {(connectedAccountId || accountCreatePending || onboardingExited) && (
          <div className="rounded-lg shadow-md p-6 mt-4">
            {accountCreatePending && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-700">
                  Creating your Stripe account...
                </p>
              </div>
            )}
            {onboardingExited && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-6 h-6 mr-2" />
                <p>
                  Great! Your Seller is now connected to Stripe for seamless
                  payouts.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StripeConnect;
