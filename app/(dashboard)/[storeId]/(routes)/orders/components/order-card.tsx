"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  PackageIcon,
  PrinterIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { OrderColumn } from "./columns";

const ImageModal = ({
  imageUrl,
  isOpen,
  onClose,
}: {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white p-4 rounded-lg shadow-lg  w-full">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          Close
        </button>
        <img
          src={imageUrl}
          alt="Enlarged product"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>
    </div>
  );
};

export default function OrderCard({ row }: { row: OrderColumn }) {
  // const [clientCreatedAt, setClientCreatedAt] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // useEffect(() => {
  //   return setClientCreatedAt(row.createdAt)
  // }, [row.createdAt])

  const parsedAddress = typeof row.address === 'string' 
    ? JSON.parse(row.address || '{}') 
    : row.address || {};

  const handleImageClick = (imageUrl: string) => {
    setModalImageUrl(imageUrl);
    setIsModalOpen(true);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="w-full mx-auto mb-4">
      <CardHeader className="">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
              <CardDescription>
                {new Date(row.createdAt).toLocaleString("en-GB", {
                  year: "2-digit",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </CardDescription>
            <p>
              <a
                href={`mailto:${row.email}`}
                className="text-blue-500 hover:underline"
              >
                {row.email}
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={row.isPaid ? "default" : "destructive"}>
              {row.isPaid ? "Paid" : "Unpaid"}
            </Badge>
            <Badge variant={row.hasBeenDispatched ? "default" : "secondary"}>
              {row.hasBeenDispatched ? "Dispatched" : "Pending"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={toggleExpand}>
              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Customer Information</h3>

            <p>{row.phone}</p>
            <p className="text-sm text-muted-foreground">
              {`${parsedAddress.line1}, ${parsedAddress.city}, ${parsedAddress.country}, ${parsedAddress.postal_code}`}
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Order Details</h3>
            <p className="font-bold">Total Price: {row.totalPrice}</p>

            <div className="flex flex-row gap-2">
              Sellers:{" "}
              {row.sellerIds.map((sellerId, index) => (
                <div key={sellerId} className="flex flex-col items-center">
                  {" "}
                  <Link
                    href={`sellers/${sellerId}/details`}
                    className="text-center"
                  >
                    <span className="text-sm text-blue-500 hover:underline">
                      {row.sellers[index]}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Order ID: {row.id}</p>
            <p className="flex flex-row text-sm text-muted-foreground gap-2">
              Stripe ID:{" "}
              {row.stripe_connect_unique_id.map((stripeId, index) => (
                <span key={index} className="gap-2">
                  {stripeId}
                </span> // Add key here, you can use index if no other unique identifier
              ))}
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {row.productIds.map((productId, index) => (
                <div key={productId} className="flex flex-col items-center">
                  {" "}
                  <img
                    src={row.productImageUrls[index]}
                    alt={row.products[index]}
                    className="w-full h-32 object-cover rounded-md shadow-md mb-2 cursor-pointer"
                    onClick={() =>
                      handleImageClick(row.productImageUrls[index])
                    }
                  />
                  <Link
                    href={`products/${productId}/details`}
                    className="text-center"
                  >
                    <span className="text-sm text-blue-500 hover:underline">
                      {row.products[index]}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              <PrinterIcon className="mr-2 h-4 w-4" />
              Print Barcode
            </Button>
            <Button variant="default" size="sm">
              <PackageIcon className="mr-2 h-4 w-4" />
              Dispatch Order
            </Button>
          </div>
        </CardContent>
      )}

      <ImageModal
        imageUrl={modalImageUrl}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Card>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { PackageIcon, PrinterIcon } from "lucide-react";
// import { OrderColumn } from "./columns";

// // Modal component for image enlargement
// const ImageModal = ({ imageUrl, isOpen, onClose }: { imageUrl: string; isOpen: boolean; onClose: () => void }) => {
//   if (!isOpen) return null;

//   // Close the modal when clicking outside the content
//   const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//       onClick={handleOverlayClick} // Close modal if clicked outside the content
//     >
//       <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full">
//         <button
//           className="absolute top-2 right-2 text-gray-500 hover:text-black"
//           onClick={onClose} // Close modal on button click
//         >
//           Close
//         </button>
//         <img src={imageUrl} alt="Enlarged product" className="w-full h-auto object-cover rounded-lg" />
//       </div>
//     </div>
//   );
// };

// export default function OrderCard({ row }: { row: OrderColumn }) {
//   const [clientCreatedAt, setClientCreatedAt] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
//   const [modalImageUrl, setModalImageUrl] = useState(""); // Image URL for the modal

//   useEffect(() => {
//     setClientCreatedAt(row.createdAt);
//   }, [row.createdAt]);

//   const parsedAddress = JSON.parse(row.address);

//   // Function to open the modal with the clicked image
//   const handleImageClick = (imageUrl: string) => {
//     setModalImageUrl(imageUrl);
//     setIsModalOpen(true);
//   };

//   return (
//     <Card className="w-full max-w-3xl mx-auto">
//       <CardHeader>
//         <div className="flex justify-between items-start">
//           <div>
//             <CardTitle className="text-2xl font-bold">Order #{row.id}</CardTitle>
//             <CardDescription>{clientCreatedAt}</CardDescription>
//           </div>
//           <div className="flex gap-2">
//             <Badge variant={row.isPaid ? "default" : "destructive"}>{row.isPaid ? "Paid" : "Unpaid"}</Badge>
//             <Badge variant={row.hasBeenDispatched ? "default" : "secondary"}>
//               {row.hasBeenDispatched ? "Dispatched" : "Pending"}
//             </Badge>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="space-y-2">
//           <h3 className="text-lg font-semibold">Customer Information</h3>
//           <p>
//             <a href={`mailto:${row.email}`} className="text-blue-500 hover:underline">
//               {row.email}
//             </a>
//           </p>
//           <p>{row.phone}</p>
//           <p className="text-sm text-muted-foreground">
//             {`${parsedAddress.line1}, ${parsedAddress.city}, ${parsedAddress.country}, ${parsedAddress.postal_code}`}
//           </p>
//         </div>
//         <Separator />
//         <div className="space-y-2">
//           <h3 className="text-lg font-semibold">Order Details</h3>
//           <p className="font-bold">Total Price: {row.totalPrice}</p>
//           <p>Stripe ID: {row.stripe_connect_unique_id}</p>
//           <p>Sellers: {row.sellers}</p>
//         </div>
//         <Separator />
//         <div className="space-y-2">
//           <h3 className="text-lg font-semibold">Products</h3>
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//             {row.productIds.map((productId, index) => (
//               <div key={productId} className="flex flex-col items-center">
//                 <img
//                   src={row.productImageUrls[index]}
//                   alt={row.products[index]}
//                   className="w-full h-32 object-cover rounded-md shadow-md mb-2 cursor-pointer"
//                   onClick={() => handleImageClick(row.productImageUrls[index])} // Open modal on click
//                 />
//                 <Link href={`products/${productId}/details`} className="text-center">
//                   <span className="text-sm text-blue-500 hover:underline">{row.products[index]}</span>
//                 </Link>
//               </div>
//             ))}
//           </div>
//         </div>
//         <Separator />
//         <div className="flex justify-end space-x-2">
//           <Button variant="outline" size="sm">
//             <PrinterIcon className="mr-2 h-4 w-4" />
//             Print Barcode
//           </Button>
//           <Button variant="default" size="sm">
//             <PackageIcon className="mr-2 h-4 w-4" />
//             Dispatch Order
//           </Button>
//         </div>
//       </CardContent>

//       {/* Modal for showing enlarged image */}
//       <ImageModal
//         imageUrl={modalImageUrl}
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)} // Close modal
//       />
//     </Card>
//   );
// }
