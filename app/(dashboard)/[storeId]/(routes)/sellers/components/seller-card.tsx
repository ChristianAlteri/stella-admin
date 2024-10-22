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
} from "lucide-react";
import { TbPercentage } from "react-icons/tb";
import { IoAnalyticsSharp } from "react-icons/io5";
import SellerActions from "./seller-actions";

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
};

export default function SellerCard({ row }: { row: SellerColumn }) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/${row.storeId}/sellers/${row.sellerId}/details`);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage
            src={row.imageUrl ?? "/default-profile.png"}
            alt={`${row.storeName}`}
          />
          <AvatarFallback>
            {row.storeName[0]}
            {row.storeName[1]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-md text-primary underline">{row.storeName}</p>
        </div>
        <SellerActions data={row} />
        {/* <div className="flex flex-row gap-2">
          <Button variant="outline" size="sm" onClick={handleCardClick}>
            <IoAnalyticsSharp className="w-4 h-4" />
          </Button>
          <Link
            href={`/${row.storeId}/products?sellerId=${row.sellerId}`}
            passHref
          >
            <Button variant="outline" size="sm">
              <Package className="w-4 h-4 " />
            </Button>
          </Link>
        </div> */}
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
          <a
            href={`mailto:${row.email}`}
            className="text-primary hover:underline"
          >
            {row.email}
          </a>
        </div>
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
          <span>{row.country}</span>
        </div>
        {row.instagramHandle && (
          <div className="flex items-center text-xs text-gray-500">
            <Instagram className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span>{row.instagramHandle}</span>
          </div>
        )}
        {row.consignmentRate && (
          <div className="flex items-center text-xs text-gray-500">
            <TbPercentage className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span>{row.consignmentRate} Consignment Rate</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="default">{row.sellerType}</Badge>
      </CardFooter>
    </Card>
  );
}
// "use client";

// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardDescription,
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
//   ExternalLink,
//   Info,
//   ShoppingBag,
// } from "lucide-react";
// import { TbPercentage } from "react-icons/tb";

// export type SellerColumn = {
//   id: string;
//   instagramHandle: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   shippingAddress: string;
//   country: string;
//   createdAt: string;
//   productsUrl: string;
//   storeId: string;
//   sellerId: string;
//   imageUrl: string | undefined;
//   charityName: string;
//   charityUrl: string;
//   shoeSizeEU: string;
//   topSize: string;
//   bottomSize: string;
//   sellerType: string;
//   description: string;
//   storeName: string;
//   consignmentRate: number | undefined;
// };

// export default function SellerCard({ row }: { row: SellerColumn }) {
//   const router = useRouter();

//   const handleCardClick = () => {
//     router.push(`/${row.storeId}/sellers/${row.sellerId}/details`);
//   };

//   return (
//     <Card className="w-full hover:shadow-lg transition-shadow duration-300">
//       <CardHeader className="flex flex-row items-center gap-4 w-full">
//         <Avatar className="w-16 h-16">
//           <AvatarImage
//             src={row.imageUrl ?? "/default-profile.png"}
//             alt={`${row.firstName} ${row.lastName}`}
//           />
//           <AvatarFallback>
//             {row.firstName[0]}
//             {row.lastName[0]}
//           </AvatarFallback>
//         </Avatar>
//         <div className="w-full flex">
//           <div className="flex flex-row gap-2 justify-between w-full">
//             <CardTitle className="text-xl w-full ">
//               {row.firstName} {row.lastName}
//             </CardTitle>
//           </div>

//           <Button variant="outline" size="sm" onClick={handleCardClick}>
//             <ShoppingBag className="w-4 h-4 mr-2" />
//             Details
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <CardDescription className="flex items-center">
//           <Instagram className="w-4 h-4 mr-1" />
//           {row.instagramHandle}
//         </CardDescription>
//         <div className="flex items-center">
//           <Mail className="w-4 h-4 mr-2" />
//           <a
//             href={`mailto:${row.email}`}
//             className="text-blue-500 hover:underline"
//           >
//             {row.email}
//           </a>
//         </div>
//         <div className="flex items-center">
//           <Phone className="w-4 h-4 mr-2" />
//           <span>{row.phoneNumber}</span>
//         </div>
//         <div className="flex items-center">
//           <MapPin className="w-4 h-4 mr-2" />
//           <span>
//             {row.shippingAddress}, {row.country}
//           </span>
//         </div>
//         <div className="flex items-center">
//           <Store className="w-4 h-4 mr-2" />
//           <span>{row.storeName}</span>
//         </div>
//         {row.consignmentRate ?? (
//           <div className="flex items-center">
//             <TbPercentage className="w-4 h-4 mr-2" />
//             <span>{row.consignmentRate}</span>
//           </div>
//         )}
//         <div className="space-y-2">
//           <h4 className="font-semibold">Sizes:</h4>
//           <div className="flex gap-2">
//             <Badge variant="secondary">Shoe: EU {row.shoeSizeEU}</Badge>
//             <Badge variant="secondary">Top: {row.topSize}</Badge>
//             <Badge variant="secondary">Bottom: {row.bottomSize}</Badge>
//           </div>
//         </div>
//         <div>
//           <h4 className="font-semibold mb-2">Charity:</h4>
//           <a
//             href={row.charityUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center text-blue-500 hover:underline"
//           >
//             {row.charityName}
//             <ExternalLink className="w-4 h-4 ml-1" />
//           </a>
//         </div>
//       </CardContent>
//       <CardFooter className="flex justify-between items-center">
//         <Badge>{row.sellerType}</Badge>
//         <div className="flex gap-2">
//           <Link
//             href={`/${row.storeId}/products?sellerId=${row.sellerId}`}
//             passHref
//           >
//             <Button variant="outline" size="sm">
//               <ShoppingBag className="w-4 h-4 mr-2" />
//               View Products
//             </Button>
//           </Link>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }
