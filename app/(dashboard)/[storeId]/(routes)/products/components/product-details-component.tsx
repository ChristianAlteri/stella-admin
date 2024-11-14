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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductActions from "./product-cell-action";
import { ProductColumn } from "./columns";
import { useRouter } from "next/navigation";
import { currencyConvertor } from "@/lib/utils";
import { useState } from "react";

interface ProductDetailsComponentProps {
  data: ProductColumn;
}

export default function ProductDetailsComponent({
  data,
}: ProductDetailsComponentProps) {
  const currencySymbol = currencyConvertor(data.countryCode);
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(true);

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
              <p className="text-sm text-muted-foreground col-span-1 truncate">
                {data.designer}
              </p>
              <p className="font-semibold text-xs col-span-1 text-left">
                {currencySymbol} {data.ourPrice}
              </p>
              <p
                className="text-xs text-blue-600 hover:underline hover:cursor-pointer col-span-1 truncate"
                onClick={() =>
                  router.push(
                    `/${data.storeId}/sellers/${data.sellerId}/details`
                  )
                }
              >
                {data.sellerStoreName}
              </p>
              <p className="text-xs text-muted-foreground col-span-1 text-left truncate w-full">
                {data.id}
              </p>
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
                    <p className="text-muted-foreground">{data.designer}</p>
                    <p className="text-muted-foreground">{data.id}</p>
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
                      <div className="flex items-center">
                        <span>
                          {currencySymbol}
                          {data.ourPrice}
                        </span>
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
