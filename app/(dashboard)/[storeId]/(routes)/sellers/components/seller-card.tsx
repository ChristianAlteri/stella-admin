"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Instagram, Mail, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { TbPercentage } from "react-icons/tb";
import SellerActions from "./seller-actions";
import { useState } from "react";
import axios from "axios";

export type SellerColumn = {
  id: string;
  instagramHandle: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  shippingAddress: string;
  country: string;
  storeId: string;
  sellerId: string;
  imageUrl: string | undefined;
  sellerType: string;
  storeName: string;
  consignmentRate: number | undefined;
  stripe_connect_unique_id: string;
};

export default function SellerCard({ row }: { row: SellerColumn }) {
  const router = useRouter();
  const params = useParams();
  const [isMinimized, setIsMinimized] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<string | null>(
    row.stripe_connect_unique_id ? "Connected" : "Not Connected"
  );
  const [error, setError] = useState<string | null>(null);

  const handleStripeConnectedCheck = async (stripe_connect_unique_id: string) => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await axios.post(
        `/api/${params.storeId}/stripe/account/account_status`,
        {
          stripe_connect_unique_id,
        }
      );
      // TODO: Database update here

      console.log("Stripe account status:", response.data);
    } catch (err: any) {
      console.error("Error checking Stripe account status:", err);
      setError("Failed to check Stripe account status. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-300">
      {isMinimized ? (
        <div className="flex flex-row items-center justify-between bg-white rounded-lg shadow-sm hover:shadow-md ml-2">
          <div className="grid grid-cols-5 w-full items-center">
            <p className="font-semibold text-sm col-span-1 truncate w-full text-left">
              {row.storeName}
            </p>
            <p className="font-semibold text-sm col-span-1 truncate w-full text-left">
              {row.email || "No Email"}
            </p>
            <p className="flex justify-between items-start col-span-1 truncate w-full text-left">
              <Badge variant="default">{row.sellerType}</Badge>
            </p>
            <p
              className="flex justify-start items-center col-span-1 truncate text-left cursor-pointer"
              onClick={() =>
                handleStripeConnectedCheck(row.stripe_connect_unique_id)
              }
            >
              {isChecking ? (
                <span className="text-sm text-gray-500">Checking...</span>
              ) : stripeStatus === "Connected" ? (
                <Badge className="truncate" variant="default">
                  Connected to Stripe
                </Badge>
              ) : (
                <Badge variant="destructive">Not Connected to Stripe</Badge>
              )}
            </p>
            <div className="flex justify-end col-span-1 truncate w-full p-2">
              <SellerActions data={row} />
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:cursor-pointer focus:outline-none p-1"
              >
                {isMinimized ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="col-span-5 mt-2 text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <CardContent>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={row.imageUrl ?? "/default-profile.png"}
                alt={`${row.storeName}`}
              />
              <AvatarFallback>
                {row.storeName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-md text-primary underline">{row.storeName}</p>
            </div>
            <SellerActions data={row} />
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:cursor-pointer focus:outline-none m-2 p-1"
            >
              {isMinimized ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {row.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                <a
                  href={`mailto:${row.email}`}
                  className="text-primary hover:underline"
                >
                  {row.email}
                </a>
              </div>
            )}
            {row.country && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{row.country}</span>
              </div>
            )}
            {row.instagramHandle && (
              <div className="flex items-center text-xs text-gray-500">
                <Instagram className="w-4 h-4 mr-2 text-gray-500" />
                <span>{row.instagramHandle}</span>
              </div>
            )}
            {row.consignmentRate && (
              <div className="flex items-center text-xs text-gray-500">
                <TbPercentage className="w-4 h-4 mr-2 text-gray-500" />
                <span>{row.consignmentRate}% Consignment Rate</span>
              </div>
            )}
            {/* Display Stripe Status in Detailed View */}
            <div className="flex items-center mt-2">
              <span className="font-semibold mr-2">Stripe Status:</span>
              {isChecking ? (
                <span className="text-sm text-gray-500">Checking...</span>
              ) : stripeStatus === "Connected" ? (
                <Badge variant="default">Connected to Stripe</Badge>
              ) : (
                <Badge variant="destructive">Not Connected to Stripe</Badge>
              )}
            </div>
            {error && (
              <div className="text-red-500 text-sm mt-1">{error}</div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center w-full gap-2">
            <Badge
              className="flex justify-between items-center col-span-1 truncate text-left"
              variant="default"
            >
              {row.sellerType}
            </Badge>
            <p
              className="flex justify-between items-center col-span-1 truncate w-full text-left cursor-pointer"
              onClick={() =>
                handleStripeConnectedCheck(row.stripe_connect_unique_id)
              }
            >
              {isChecking ? (
                <span className="text-sm text-gray-500">Checking...</span>
              ) : stripeStatus === "Connected" ? (
                <Badge variant="default">Connected to Stripe</Badge>
              ) : (
                <Badge variant="destructive">Not Connected to Stripe</Badge>
              )}
            </p>
          </CardFooter>
        </CardContent>
      )}
    </Card>
  );
}


// "use client";

// import { useParams, useRouter } from "next/navigation";

// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
// } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// import { Badge } from "@/components/ui/badge";
// import { Instagram, Mail, MapPin, ChevronDown, ChevronUp } from "lucide-react";
// import { TbPercentage } from "react-icons/tb";

// import SellerActions from "./seller-actions";
// import { useState } from "react";
// import axios from "axios";

// export type SellerColumn = {
//   id: string;
//   instagramHandle: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   shippingAddress: string;
//   country: string;
//   storeId: string;
//   sellerId: string;
//   imageUrl: string | undefined;
//   sellerType: string;
//   storeName: string;
//   consignmentRate: number | undefined;
//   stripe_connect_unique_id: string;
// };

// export default function SellerCard({ row }: { row: SellerColumn }) {
//   const router = useRouter();
//   const params = useParams();
//   const [isMinimized, setIsMinimized] = useState(true);

//   const handleStripeConnectedCheck = (stripe_connect_unique_id: string) => {
//     const response = axios.post(`/api/${params.storeId}/stripe/account/account_status`, {
//       stripe_connect_unique_id,
//     });
//     console.log("response", response);
//     //TODO: here you wanna handle a database update to reflect the status of the stripe account
//   };

//   return (
//     <Card className="w-full hover:shadow-md transition-shadow duration-300">
//       {isMinimized ? (
//         <div className="flex flex-row items-center justify-between bg-white rounded-lg shadow-sm hover:shadow-md ml-2">
//           <div className="grid grid-cols-5 w-full items-center">
//             <p className="font-semibold text-sm col-span-1 truncate w-full text-left">
//               {row.storeName}
//             </p>
//             <p className="font-semibold text-sm col-span-1 truncate w-full text-left">
//               {row.email || "No Email"}
//             </p>
//             <p className="flex justify-between items-start col-span-1 truncate w-full text-left">
//               <Badge variant="default">{row.sellerType}</Badge>
//             </p>
//             <p
//               className="flex justify-start items-center col-span-1 truncate text-left"
//               onClick={() =>
//                 handleStripeConnectedCheck(row.stripe_connect_unique_id)
//               }
//             >
//               {row.stripe_connect_unique_id ? (
//                 <Badge className="truncate" variant="default">
//                   Connected to stripe
//                 </Badge>
//               ) : (
//                 <Badge variant="destructive">Not Connected to stripe</Badge>
//               )}
//             </p>
//             <div className="flex justify-end col-span-1 truncate w-full p-2">
//               <SellerActions data={row} />
//               <button
//                 onClick={() => setIsMinimized(!isMinimized)}
//                 className="hover:cursor-pointer focus:outline-none p-1"
//               >
//                 <ChevronDown className="h-4 w-4 text-muted-foreground" />
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <CardContent>
//           <CardHeader className="flex flex-row items-center gap-4">
//             <Avatar className="w-16 h-16">
//               <AvatarImage
//                 src={row.imageUrl ?? "/default-profile.png"}
//                 alt={`${row.storeName}`}
//               />
//               <AvatarFallback>
//                 {row.storeName[0].toUpperCase()}
//                 {row.storeName[1].toUpperCase()}
//               </AvatarFallback>
//             </Avatar>
//             <div className="flex-1">
//               <p className="text-md text-primary underline">{row.storeName}</p>
//             </div>
//             <SellerActions data={row} />
//             <button
//               onClick={() => setIsMinimized(!isMinimized)}
//               className="hover:cursor-pointer focus:outline-none m-2 p-1"
//             >
//               <ChevronUp className="h-4 w-4 text-muted-foreground" />
//             </button>
//           </CardHeader>
//           <CardContent className="grid gap-2 text-sm">
//             {row.email && (
//               <div className="flex items-center">
//                 <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
//                 <a
//                   href={`mailto:${row.email}`}
//                   className="text-primary hover:underline"
//                 >
//                   {row.email}
//                 </a>
//               </div>
//             )}
//             {row.country && (
//               <div className="flex items-center">
//                 <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
//                 <span>{row.country}</span>
//               </div>
//             )}
//             {row.instagramHandle && (
//               <div className="flex items-center text-xs text-gray-500">
//                 <Instagram className="w-4 h-4 mr-2 text-gray-500" />
//                 <span>{row.instagramHandle}</span>
//               </div>
//             )}
//             {row.consignmentRate && (
//               <div className="flex items-center text-xs text-gray-500">
//                 <TbPercentage className="w-4 h-4 mr-2 text-gray-500" />
//                 <span>{row.consignmentRate}% Consignment Rate</span>
//               </div>
//             )}
//           </CardContent>
//           <CardFooter className="flex justify-between items-center w-full gap-2">
//             <Badge
//               className="flex justify-between items-center col-span-1 truncate text-left"
//               variant="default"
//             >
//               {row.sellerType}
//             </Badge>
//             <p className="flex justify-between items-center col-span-1 truncate w-full text-left"
//             onClick={() =>
//               handleStripeConnectedCheck(row.stripe_connect_unique_id)
//             }
//             >
//               {row.stripe_connect_unique_id ? (
//                 <Badge variant="default">Connected to stripe</Badge>
//               ) : (
//                 <Badge variant="destructive">Not Connected to stripe</Badge>
//               )}
//             </p>
//           </CardFooter>
//         </CardContent>
//       )}
//     </Card>
//   );
// }
