'use client'

import React, { useState } from 'react'
import { useStripeConnect } from '@/hooks/use-stripe-connect'
import { ConnectAccountOnboarding, ConnectComponentsProvider } from '@stripe/react-connect-js'
import { Button } from '@/components/ui/button'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'

const StoreStripeConnect = () => {
  const router = useRouter()
  const params = useParams()

  const [accountCreatePending, setAccountCreatePending] = useState(false)
  const [onboardingExited, setOnboardingExited] = useState(false)
  const [error, setError] = useState(false)
  const [connectedAccountId, setConnectedAccountId] = useState('')
  const stripeConnectInstance = useStripeConnect(connectedAccountId)

  const handleCreateStripeAccount = async () => {
    setAccountCreatePending(true)
    setError(false)

    try {
      const stripeAccount = await fetch(`/api/${params.storeId}/stripe/account`, {
        method: 'POST',
      })
      const json = await stripeAccount.json()
      const { account, error } = json
      if (account) {
        setConnectedAccountId(account.id)
        await axios.patch(`/api/stores/${params.storeId}`, { stripe_connect_unique_id: account.id })
        await axios.patch(`/api/${params.storeId}/sellers/${params.storeId}`, { connectedAccountId: account.id })
      } else {
        console.error('Failed to update seller with Stripe account')
        setError(true)
      }
    } catch (err) {
      console.error('Error creating Stripe account:', err)
      setError(true)
    } finally {
      setAccountCreatePending(false)
    }
  }

  return (
    <Card className="w-full">
      <div className="w-full ">
        {!accountCreatePending && !connectedAccountId && (
          <div className=" rounded-lg shadow-xl overflow-hidden w-full">
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <CreditCard className="w-16 h-16 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">Connect Your Store to Stripe</h2>
              <p className="text-gray-600 text-center mb-6">
                We&apos;ve partnered with Stripe to ensure your payouts are streamlined and secure. Get started in just a few clicks!
              </p>
              <ul className="text-sm text-gray-600 mb-8">
                <li className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Fast and secure payouts
                </li>
                <li className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Easy integration with your store
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  24/7 support from Stripe
                </li>
              </ul>
              <Button
                onClick={handleCreateStripeAccount}
                className="w-full  text-white font-bold py-3 px-4 rounded-lg transition duration-300"
              >
                Connect with Stripe
              </Button>
            </div>
          </div>
        )}

        {stripeConnectInstance && (
        <div className='flex h-full'>
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <ConnectAccountOnboarding
              onExit={() => {
                setOnboardingExited(true)
                router.push(`/${params.storeId}/settings`)
              }}
            />
          </ConnectComponentsProvider>
        </div>
        )}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mt-4" role="alert">
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
                <p className="ml-3 text-gray-700">Creating your Stripe account...</p>
              </div>
            )}
            {onboardingExited && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-6 h-6 mr-2" />
                <p>Great! Your store is now connected to Stripe for seamless payouts.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default StoreStripeConnect

// "use client";
// import React, { useState } from "react";
// import { useStripeConnect } from "@/hooks/use-stripe-connect";
// import {
//   ConnectAccountOnboarding,
//   ConnectComponentsProvider,
// } from "@stripe/react-connect-js";
// import { Button } from "@/components/ui/button";
// import { useParams, useRouter, useSearchParams } from "next/navigation";
// import axios from "axios";

// const StoreStripeConnect = () => {
//   const router = useRouter();
//   const params = useParams(); // Use params to get storeId
//   const searchParams = useSearchParams();

//   const storeId = searchParams.get("storeId"); 
//   const [accountCreatePending, setAccountCreatePending] = useState(false);
//   const [onboardingExited, setOnboardingExited] = useState(false);
//   const [error, setError] = useState(false);
//   const [connectedAccountId, setConnectedAccountId] = useState("");
//   const stripeConnectInstance = useStripeConnect(connectedAccountId);


//   const handleCreateStripeAccount = async () => {
//     setAccountCreatePending(true);
//     setError(false);

//     try {
//       // Create Stripe Connect account via API
//       const stripeAccount = await fetch(
//         `/api/${params.storeId}/stripe/account`,
//         {
//           method: "POST",
//         }
//       );
//       const json = await stripeAccount.json();
//       const { account, error } = json;
//       if (account) {
//         // Connect Stripe account to Seller
//         setConnectedAccountId(account.id);
//         const updatedStore = await axios.patch(
//           `/api/stores/${params.storeId}`,
//           { stripe_connect_unique_id: account.id }
//         );
//       } else {
//         console.error("Failed to update seller with Stripe account");
//         setError(true);
//       }
//     } catch (err) {
//       console.error("Error creating Stripe account:", err);
//       setError(true);
//     } finally {
//       setAccountCreatePending(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center w-full h-full">
//       {!accountCreatePending && !connectedAccountId && (
//         <div>
//           <Button onClick={handleCreateStripeAccount}>
//             Connect your store to Stripe
//           </Button>
//         </div>
//       )}
//       {stripeConnectInstance && (
//         <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
//           <ConnectAccountOnboarding
//             onExit={() => {
//               setOnboardingExited(true);
//               router.push(`/${params.storeId}/settings`); // Redirect to settings page on exit
//             }}
//           />
//         </ConnectComponentsProvider>
//       )}
//       {error && (
//         <p className="error flex w-full h-full">Something went wrong!</p>
//       )}
//       {(connectedAccountId || accountCreatePending || onboardingExited) && (
//         <div className="dev-callout">
//           {accountCreatePending && <p>Creating a connected account...</p>}
//           {onboardingExited && (
//             <p>The Store now has an account you can payout</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default StoreStripeConnect;
