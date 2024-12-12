"use client";

import Image from "next/image";
import {
  Heart,
  Star,
  Archive,
  Percent,
  Gift,
  EyeOff,
  Tag,
  Palette,
  Ruler,
  Shirt,
  Users,
  Layers,
  MousePointer,
  ChevronDown,
  ChevronUp,
  WifiIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiStatusOnline } from "react-icons/hi";
import ProductActions from "./product-cell-action";
import { ProductColumn } from "./columns";
import { useRouter } from "next/navigation";
import { currencyConvertor } from "@/lib/utils";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { TbFaceId, TbFaceIdError } from "react-icons/tb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProductDetailsComponentProps {
  data: ProductColumn;
}

// Custom Toast Error
const toastError = (message: string) => {
  toast.error(message, {
    style: {
      background: "white",
      color: "black",
    },
    icon: <TbFaceIdError size={30} />,
  });
};
// Custom Toast Success
const toastSuccess = (message: string) => {
  toast.error(message, {
    style: {
      background: "white",
      color: "green",
    },
    icon: <TbFaceId size={30} />,
  });
};

export default function ProductDetailsComponent({
  data,
}: ProductDetailsComponentProps) {
  const currencySymbol = currencyConvertor(data.countryCode);
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(true);
  const [discounts, setDiscounts] = useState<{ [key: string]: number }>({});
  // Helper function to handle discount change
  const handleDiscountChange = (productId: string, value: number) => {
    setDiscounts((prevDiscounts) => ({
      ...prevDiscounts,
      [productId]: value,
    }));
  };

  const applyDiscount = async (data: ProductColumn) => {
    try {
      const defaultDiscount = 50;
      const discountToApply = discounts[data.id] || defaultDiscount;
      const response = await axios.patch(
        `/api/${data.storeId}/products/${data.id}/discounts`,
        {
          productPrice: data.ourPrice,
          discountToApply: discountToApply,
        }
      );

      if (response.status === 200) {
        toastSuccess("Discount applied successfully");
      } else {
        toastError(`Error applying discount: ${response.data}`);
      }
    } catch (error: any) {
      toastError(`Failed to apply discount: ${error.data}`);
    }
  };

  const ProductBadge = ({
    condition,
    icon: Icon,
    trueText,
    falseText,
    invertColors = false,
  }: {
    condition: boolean;
    icon: React.ComponentType<{ className?: string }>;
    trueText: string;
    falseText: string;
    invertColors?: boolean;
  }) => {
    const baseClass =
      condition !== invertColors
        ? "bg-white border-black text-black"
        : "bg-gray-200 text-muted-foreground border-none";

    return (
      <Badge className={baseClass}>
        <Icon className="mr-1 h-3 w-3" />
        {condition ? trueText : falseText}
      </Badge>
    );
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        {isMinimized ? (
          <div className="flex flex-row items-center justify-between bg-white rounded-lg shadow-sm hover:shadow-md">
            <div className="grid grid-cols-6 w-full items-center ml-3">
              <h3 className="font-semibold text-xs col-span-1 truncate">
                {data.name}
              </h3>
              <div className="text-sm text-muted-foreground col-span-1 truncate">
                {data.designer}
              </div>
              <div className="flex flex-col col-span-1 gap-2 w-full">
                <div className="flex flex-row font-semibold text-xs text-left gap-1">
                  {currencySymbol} {data.ourPrice}
                  {data.isOnSale && (
                    <div className="flex flex-row text-super-small gap-1 justify-center items-center">
                      <h6 className="flex flex-row text-super-small text-muted-foreground">
                        WAS
                      </h6>
                      <h6 className="flex flex-row  text-super-small text-muted-foreground line-through">
                        {currencySymbol}
                        {data.originalPrice}
                      </h6>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="text-xs text-blue-600 hover:underline hover:cursor-pointer col-span-1 truncate"
                onClick={() =>
                  router.push(
                    `/${data.storeId}/sellers/${data.sellerId}/details`
                  )
                }
              >
                {data.sellerStoreName}
              </div>
              <div className="text-xs text-muted-foreground col-span-1 text-left truncate w-full">
                {data.id}
              </div>
              <div className="flex items-center justify-center p-2">
                <ProductActions data={data} />
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:cursor-pointer focus:outline-none focus:ring-2 m-2 p-1"
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <Card className="w-full">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-start space-x-4">
                  <div className="relative h-32 w-32">
                    {data.imageUrl.match(
                      /https:\/\/.*\.(video|mp4|MP4|mov).*/
                    ) ? (
                      <video
                        src={data.imageUrl}
                        className="rounded-md object-cover"
                        loop
                        muted
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <Image
                        src={data.imageUrl || "/placeholder.png"}
                        alt={data.name}
                        width={128}
                        height={128}
                        className="rounded-md object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {data.name}
                    </CardTitle>
                    <div className="text-muted-foreground">{data.designer}</div>
                    <div className="text-muted-foreground">{data.id}</div>
                    <div className="flex items-center">
                      <Tag className="mr-2 h-4 w-4" />
                      <span>{data.category}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <ProductBadge
                        condition={!data.isArchived}
                        icon={Archive}
                        trueText="Live"
                        falseText="Sold"
                      />
                      <ProductBadge
                        condition={data.isOnline}
                        icon={WifiIcon}
                        trueText="Online"
                        falseText="Not Online"
                      />
                      <ProductBadge
                        condition={data.isOnSale}
                        icon={Percent}
                        trueText="On Sale"
                        falseText="Not on Sale"
                      />
                      <ProductBadge
                        condition={data.isCharity}
                        icon={Gift}
                        trueText="Charity"
                        falseText="Not for Charity"
                      />
                      <ProductBadge
                        condition={data.isHidden}
                        icon={EyeOff}
                        trueText="Hidden"
                        falseText="Visible"
                        invertColors
                      />
                      <ProductBadge
                        condition={data.isFeatured}
                        icon={Star}
                        trueText="Featured"
                        falseText="Not Featured"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center ">
                  <ProductActions data={data} />
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="hover:cursor-pointer focus:outline-none focus:ring-2 m-2 p-1"
                  >
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-row gap-4">
                  <div className="flex flex-row w-full">
                    <div className="space-y-2 w-1/2 mt-3">
                      <div className="flex items-center">
                        <Tag className="mr-2 h-4 w-4" />
                        <span>{data.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="flex items-baseline space-x-1">
                            <span className="font-medium">
                              {currencySymbol}
                              {data.ourPrice}
                            </span>
                            {data.isOnSale && data.originalPrice && (
                              <span className="text-muted-foreground line-through">
                                {currencySymbol}
                                {data.originalPrice}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              placeholder="Discount %"
                              className="w-12 text-xs border rounded-md text-muted-foreground p-1"
                              value={discounts[data.id] || 50}
                              min={1}
                              max={99}
                              onChange={(e) => {
                                const value = Math.min(
                                  Math.max(
                                    parseInt(e.target.value, 10) || 0,
                                    1
                                  ),
                                  99
                                );
                                handleDiscountChange(data.id, value);
                              }}
                            />
                            <button
                            className="hover:underline hover:cursor-pointer"  
                              onClick={() => applyDiscount(data)}
                            >
                              Discount
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        onClick={() => {
                          router.push(
                            `/${data.storeId}/sellers/${data.sellerId}/details`
                          );
                        }}
                        className="flex items-center hover:underline hover:cursor-pointer"
                      >
                        <span>{data.sellerStoreName}</span>
                      </div>
                    </div>
                    <div className="flex flex-row gap-3 justify-end w-full items-end flex-wrap">
                      {data.consignmentRate !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Percent className="h-4 w-4" />
                          <span>{data.consignmentRate}</span>
                        </div>
                      )}
                      {data.likes !== undefined && data.likes !== 0 && (
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{data.likes}</span>
                        </div>
                      )}
                      {data.clicks !== undefined && data.likes !== 0 && (
                        <div className="flex items-center space-x-1">
                          <MousePointer className="h-4 w-4" />
                          <span>{data.clicks}</span>
                        </div>
                      )}
                      {data.color && (
                        <div className="flex items-center space-x-1">
                          <Palette className="h-4 w-4" />
                          <span>{data.color}</span>
                        </div>
                      )}
                      {data.size && (
                        <div className="flex items-center space-x-1">
                          <Ruler className="h-4 w-4" />
                          <span>{data.size}</span>
                        </div>
                      )}
                      {data.material && (
                        <div className="flex items-center space-x-1">
                          <Shirt className="h-4 w-4" />
                          <span>{data.material}</span>
                        </div>
                      )}
                      {data.gender && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{data.gender}</span>
                        </div>
                      )}
                      {data.subcategory && (
                        <div className="flex items-center space-x-1">
                          <Layers className="h-4 w-4" />
                          <span>{data.subcategory}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// "use client";

// import Image from "next/image";
// import {
//   Heart,
//   Star,
//   Archive,
//   Percent,
//   Gift,
//   EyeOff,
//   Tag,
//   Palette,
//   Ruler,
//   Shirt,
//   Users,
//   Layers,
//   MousePointer,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import ProductActions from "./product-cell-action";
// import { ProductColumn } from "./columns";
// import { useRouter } from "next/navigation";
// import { currencyConvertor } from "@/lib/utils";
// import { useState } from "react";

// interface ProductDetailsComponentProps {
//   data: ProductColumn;
// }

// export default function ProductDetailsComponent({
//   data,
// }: ProductDetailsComponentProps) {
//   const currencySymbol = currencyConvertor(data.countryCode)
//   const router = useRouter();
//   const [isMinimized, setIsMinimized] = useState(true);

//   const ProductBadge = ({
//     condition,
//     icon: Icon,
//     trueText,
//     falseText,
//     invertColors = false,
//   }: {
//     condition: boolean;
//     icon: React.ComponentType<{ className?: string }>;
//     trueText: string;
//     falseText: string;
//     invertColors?: boolean;
//   }) => {
//     const baseClass =
//       condition !== invertColors
//         ? "bg-white border-black text-black"
//         : "bg-gray-200 text-muted-foreground border-none";

//     return (
//       <Badge className={baseClass}>
//         <Icon className="mr-1 h-3 w-3" />
//         {condition ? trueText : falseText}
//       </Badge>
//     );
//   };

//   return (
//     <Card className="w-full">
//       <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
//         <div className="flex items-start space-x-4">
//           <div className="relative h-32 w-32">
//             {data.imageUrl.match(/https:\/\/.*\.(video|mp4|MP4|mov).*/) ? (
//               <video
//                 src={data.imageUrl}
//                 className="rounded-md object-cover"
//                 loop
//                 muted
//                 autoPlay
//                 playsInline
//               />
//             ) : (
//               <Image
//                 src={data.imageUrl || "/placeholder.png"}
//                 alt={data.name}
//                 width={128}
//                 height={128}
//                 className="rounded-md object-cover"
//               />
//             )}
//           </div>
//           <div>
//             <CardTitle className="text-2xl font-bold">{data.name}</CardTitle>
//             <p className="text-muted-foreground">{data.designer}</p>
//             <p className="text-muted-foreground">{data.id}</p>
//             <div className="flex items-center">
//               <Tag className="mr-2 h-4 w-4" />
//               <span>{data.category}</span>
//             </div>
//             <div className="flex flex-wrap gap-2 mt-2">
//               <ProductBadge
//                 condition={!data.isArchived}
//                 icon={Archive}
//                 trueText="Live"
//                 falseText="Sold"
//               />
//               <ProductBadge
//                 condition={data.isOnSale}
//                 icon={Percent}
//                 trueText="On Sale"
//                 falseText="Not on Sale"
//               />
//               <ProductBadge
//                 condition={data.isCharity}
//                 icon={Gift}
//                 trueText="Charity"
//                 falseText="Not for Charity"
//               />
//               <ProductBadge
//                 condition={data.isHidden}
//                 icon={EyeOff}
//                 trueText="Hidden"
//                 falseText="Visible"
//                 invertColors
//               />
//               <ProductBadge
//                 condition={data.isFeatured}
//                 icon={Star}
//                 trueText="Featured"
//                 falseText="Not Featured"
//               />
//             </div>
//           </div>
//         </div>
//         <ProductActions data={data} />
//       </CardHeader>
//       <CardContent>
//         <div className="flex flex-row gap-4">
//           <div className="flex flex-row w-full">
//             <div className="space-y-2 w-1/2 mt-3">
//               <div className="flex items-center">
//                 <Tag className="mr-2 h-4 w-4" />
//                 <span>{data.category}</span>
//               </div>
//               <div className="flex items-center">
//                 <span>{currencySymbol}{data.ourPrice}</span>
//               </div>
//               <div
//                 onClick={() => {
//                   router.push(
//                     `/${data.storeId}/sellers/${data.sellerId}/details`
//                   );
//                 }}
//                 className="flex items-center hover:underline hover:cursor-pointer"
//               >
//                 <span>{data.sellerStoreName}</span>
//               </div>
//             </div>
//             <div className="flex flex-row gap-3 justify-end w-full items-end flex-wrap">
//               {data.consignmentRate !== undefined && (
//                 <div className="flex items-center space-x-1">
//                   <Percent className="h-4 w-4" />
//                   <span>{data.consignmentRate}</span>
//                 </div>
//               )}
//               {data.likes !== undefined && data.likes !== 0 && (
//                 <div className="flex items-center space-x-1">
//                   <Heart className="h-4 w-4" />
//                   <span>{data.likes}</span>
//                 </div>
//               )}
//               {data.clicks !== undefined && data.likes !== 0 && (
//                 <div className="flex items-center space-x-1">
//                   <MousePointer className="h-4 w-4" />
//                   <span>{data.clicks}</span>
//                 </div>
//               )}
//               {data.color && (
//                 <div className="flex items-center space-x-1">
//                   <Palette className="h-4 w-4" />
//                   <span>{data.color}</span>
//                 </div>
//               )}
//               {data.size && (
//                 <div className="flex items-center space-x-1">
//                   <Ruler className="h-4 w-4" />
//                   <span>{data.size}</span>
//                 </div>
//               )}
//               {data.material && (
//                 <div className="flex items-center space-x-1">
//                   <Shirt className="h-4 w-4" />
//                   <span>{data.material}</span>
//                 </div>
//               )}
//               {data.gender && (
//                 <div className="flex items-center space-x-1">
//                   <Users className="h-4 w-4" />
//                   <span>{data.gender}</span>
//                 </div>
//               )}
//               {data.subcategory && (
//                 <div className="flex items-center space-x-1">
//                   <Layers className="h-4 w-4" />
//                   <span>{data.subcategory}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
