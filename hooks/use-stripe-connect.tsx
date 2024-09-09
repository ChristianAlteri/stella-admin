import { useState, useEffect } from "react";
import { loadConnectAndInitialize, StripeConnectInstance } from "@stripe/connect-js";
import { useParams } from "next/navigation";

export const useStripeConnect = (connectedAccountId: string) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState<StripeConnectInstance | undefined>(undefined);
  const params = useParams();

  useEffect(() => {
    if (typeof window === "undefined" || !connectedAccountId) return; // Ensure it only runs on the client-side

    const fetchClientSecret = async () => {
      try {
        const response = await fetch(`/api/${params.storeId}/stripe/account_session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account: connectedAccountId,
          }),
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error("An error occurred: " + error);
        }

        const { client_secret: clientSecret } = await response.json();
        return clientSecret;
      } catch (error: any) {
        console.error("Error fetching client secret:", error.message);
        throw error;
      }
    };

    const initializeStripeConnect = async () => {
      try {
        const instance = await loadConnectAndInitialize({
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
          fetchClientSecret,
          appearance: {
            overlays: "dialog",
            variables: {
              colorPrimary: "#635BFF",
            },
          },
        });
        setStripeConnectInstance(instance);
      } catch (error: any) {
        console.error("Stripe initialization failed:", error.message);
      }
    };

    initializeStripeConnect();
  }, [connectedAccountId]);

  return stripeConnectInstance;
};
