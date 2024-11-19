"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Instagram,
  Mail,
  Phone,
  MapPin,
  Store,
  ShoppingBag,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TbPercentage } from "react-icons/tb";
import { IoAnalyticsSharp } from "react-icons/io5";
import SellerActions from "./seller-actions";
import { useState } from "react";

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
  const [isMinimized, setIsMinimized] = useState(true);

  const handleCardClick = () => {
    router.push(`/${row.storeId}/sellers/${row.sellerId}/details`);
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
            <p className="flex justify-start items-center col-span-1 truncate text-left">
              {row.stripe_connect_unique_id ? (
                <Badge className="truncate" variant="default">Connected to stripe</Badge>
              ) : (
                <Badge variant="destructive">Not Connected to stripe</Badge>
              )}
            </p>
            <div className="flex justify-end col-span-1 truncate w-full p-2">
              <SellerActions data={row} />
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:cursor-pointer focus:outline-none p-1"
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
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
                {row.storeName[0].toUpperCase()}
                {row.storeName[1].toUpperCase()}
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
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
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
          </CardContent>
          <CardFooter className="flex justify-between items-center w-full gap-2">
            <Badge className="flex justify-between items-center col-span-1 truncate text-left" variant="default">{row.sellerType}</Badge>
            <p className="flex justify-between items-center col-span-1 truncate w-full text-left">
              {row.stripe_connect_unique_id ? (
                <Badge variant="default">Connected to stripe</Badge>
              ) : (
                <Badge variant="destructive">Not Connected to stripe</Badge>
              )}
            </p>
          </CardFooter>
        </CardContent>
      )}
    </Card>
  );
}

// "use client";

// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Instagram,
//   Mail,
//   Phone,
//   MapPin,
//   Store,
//   ShoppingBag,
//   Package,
// } from "lucide-react";
// import { TbPercentage } from "react-icons/tb";
// import { IoAnalyticsSharp } from "react-icons/io5";
// import SellerActions from "./seller-actions";
// import { useState } from "react";

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
// };

// export default function SellerCard({ row }: { row: SellerColumn }) {
//   const router = useRouter();
//   const [isMinimized, setIsMinimized] = useState(true);

//   const handleCardClick = () => {
//     router.push(`/${row.storeId}/sellers/${row.sellerId}/details`);
//   };

//   return (
//     <Card className="w-full hover:shadow-md transition-shadow duration-300">
//       <CardHeader className="flex flex-row items-center gap-4">
//         <Avatar className="w-16 h-16">
//           <AvatarImage
//             src={row.imageUrl ?? "/default-profile.png"}
//             alt={`${row.storeName}`}
//           />
//           <AvatarFallback>
//             {row.storeName[0]}
//             {row.storeName[1]}
//           </AvatarFallback>
//         </Avatar>
//         <div className="flex-1">
//           <p className="text-md text-primary underline">{row.storeName}</p>
//         </div>
//         <SellerActions data={row} />
//       </CardHeader>
//       <CardContent className="grid gap-2 text-sm">
//         <div className="flex items-center">
//           <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
//           <a
//             href={`mailto:${row.email}`}
//             className="text-primary hover:underline"
//           >
//             {row.email}
//           </a>
//         </div>
//         <div className="flex items-center">
//           <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
//           <span>{row.country}</span>
//         </div>
//         {row.instagramHandle && (
//           <div className="flex items-center text-xs text-gray-500">
//             <Instagram className="w-4 h-4 mr-2 text-xs text-gray-500" />
//             <span>{row.instagramHandle}</span>
//           </div>
//         )}
//         {row.consignmentRate && (
//           <div className="flex items-center text-xs text-gray-500">
//             <TbPercentage className="w-4 h-4 mr-2 text-xs text-gray-500" />
//             <span>{row.consignmentRate} Consignment Rate</span>
//           </div>
//         )}
//       </CardContent>
//       <CardFooter className="flex justify-between items-center">
//         <Badge variant="default">{row.sellerType}</Badge>
//       </CardFooter>
//     </Card>
//   );
// }
