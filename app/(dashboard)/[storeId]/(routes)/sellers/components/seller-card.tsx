"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Instagram, Mail, Phone, MapPin, Store, ExternalLink, Info, ShoppingBag } from "lucide-react"

export type SellerColumn = {
  id: string
  instagramHandle: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  shippingAddress: string
  country: string
  createdAt: string
  productsUrl: string
  storeId: string
  sellerId: string
  imageUrl: string | undefined
  charityName: string
  charityUrl: string
  shoeSizeEU: string
  topSize: string
  bottomSize: string
  sellerType: string
  description: string
  storeName: string
}

export default function SellerCard({ row }: { row: SellerColumn }) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/${row.storeId}/sellers/${row.sellerId}/details`)
  }

  return (
    <Card className="w-full max-w-md mx-auto hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={row.imageUrl ?? "/default-profile.png"} alt={`${row.firstName} ${row.lastName}`} />
          <AvatarFallback>{row.firstName[0]}{row.lastName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex flex-row gap-2 justify-between w-full">
            <CardTitle className="text-xl">{row.firstName} {row.lastName}
            </CardTitle>
              <div onClick={handleCardClick} className="hover:underline">
                Details
              </div>
          </div>
          <CardDescription className="flex items-center">
            <Instagram className="w-4 h-4 mr-1" />
            {row.instagramHandle}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          <a href={`mailto:${row.email}`} className="text-blue-500 hover:underline">{row.email}</a>
        </div>
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          <span>{row.phoneNumber}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{row.shippingAddress}, {row.country}</span>
        </div>
        <div className="flex items-center">
          <Store className="w-4 h-4 mr-2" />
          <span>{row.storeName}</span>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Sizes:</h4>
          <div className="flex gap-2">
            <Badge variant="secondary">Shoe: EU {row.shoeSizeEU}</Badge>
            <Badge variant="secondary">Top: {row.topSize}</Badge>
            <Badge variant="secondary">Bottom: {row.bottomSize}</Badge>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Charity:</h4>
          <a href={row.charityUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:underline">
            {row.charityName}
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge>{row.sellerType}</Badge>
        <div className="flex gap-2">
          <Link href={`/${row.storeId}/products?sellerId=${row.sellerId}`} passHref>
            <Button variant="outline" size="sm" >
              <ShoppingBag className="w-4 h-4 mr-2" />
              View Products
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

// "use client";

// import { ColumnDef } from "@tanstack/react-table";

// import {
//   Card,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";
// import { useRouter } from "next/navigation";

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
// };

// const SellerCard = ({ row }: { row: SellerColumn }) => {
//   const router = useRouter();

//   return (
//     <Card
//       onClick={() =>
//         router.push(
//           `/${row.storeId}/sellers/${row.sellerId}/details`
//         )
//       }
//     >
//       <CardHeader className="flex flex-row justify-between hover:cursor-pointer">
//         <CardTitle className="flex flex-row gap-2">
//           <>
//             <a
//               className="hover:underline"
//               href={row.imageUrl ?? "#"}
//             >
//               <img
//                 src={row.imageUrl ?? "/default-profile.png"}
//                 alt="Profile Image"
//                 style={{
//                   width: "100px",
//                   height: "auto",
//                   borderRadius: "10px",
//                 }}
//               />
//             </a>
//             <CardContent>
//               {row.instagramHandle}
//               <CardDescription>
//                 {row.firstName} {row.lastName}
//               </CardDescription>
//               <CardDescription
//                 className="flex flex-row justify-between"
//                 title="Email"
//               >
//                 {row.email}
//               </CardDescription>
//             </CardContent>
//           </>
//         </CardTitle>
//         <a
//           className="hover:underline"
//           href={`/${row.storeId}/sellers/${row.sellerId}/details`}
//         >
//           Details
//         </a>
//       </CardHeader>
//     </Card>
//   );
// };

// export default SellerCard;
