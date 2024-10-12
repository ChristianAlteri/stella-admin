"use client";

import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Product, Designer, Seller, Category } from "@prisma/client";
import { RiErrorWarningLine } from "react-icons/ri";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type ProductWithRelations = Product & {
  designer?: Designer;
  seller?: Seller;
  category?: Category;
};

export default function StockCard({
  liveStock,
  soldStock,
  averagePrice,
  products,
}: {
  liveStock: number;
  soldStock: number;
  averagePrice: number;
  products: ProductWithRelations[];
}) {
  const router = useRouter();
  const params = useParams();

  const [isOldestFirst, setIsOldestFirst] = useState(true);

  const filteredProducts = products.filter(
    (product) =>
      new Date(product.createdAt) <
        new Date(new Date().setMonth(new Date().getMonth() - 3)) &&
      !product.isArchived
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (isOldestFirst) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Stock</CardTitle>
        <Package className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent className="flex-grow grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Live
            </span>
            <span className="text-2xl font-bold text-green-600">
              {liveStock}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Sold
            </span>
            <span className="text-2xl font-bold text-red-600">{soldStock}</span>
          </div>
          <div className="col-span-2">
            <span className="text-sm font-medium text-muted-foreground">
              Average price point
            </span>
            <span className="block text-2xl font-bold">
              £
              {averagePrice.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex-grow flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-md font-bold flex items-center gap-2">
              Live Stock Older Than 3 Months:
              <RiErrorWarningLine className="text-orange-300 h-5 w-5" />
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOldestFirst(!isOldestFirst)}
            >
              {isOldestFirst ? "Show Oldest First" : "Show Latest First"}
            </Button>
          </div>
          <ScrollArea className="flex-grow w-full flex-col h-[200px]">
            {sortedProducts.length === 0 ? (
              <div className="text-sm text-muted-foreground w-full">
                No products older than 3 months found
              </div>
            ) : (
              <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs uppercase bg-gray-50 sticky top-0 rounded-md">
                  <tr className="rounded-md">
                    <th className="px-4 py-2">Product Name</th>
                    <th className="px-4 py-2">Designer</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-100 rounded-md hover:cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/${params.storeId}/products/${product.id}/details`
                        )
                      }
                    >
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">
                        {product.designer?.name ?? "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {product.category?.name ?? "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        £{product.ourPrice.toString()}
                      </td>
                      {/* <td className="px-4 py-2">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td> */}
                      <td className="px-4 py-2">
                        {Math.floor(
                          (Number(new Date()) -
                            Number(new Date(product.createdAt))) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days ago
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

// "use client";

// import { Package } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Product, Designer, Seller, Category } from "@prisma/client";
// import { RiErrorWarningLine } from "react-icons/ri";
// import { useParams, useRouter } from "next/navigation";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";

// type ProductWithRelations = Product & {
//   designer?: Designer;
//   seller?: Seller;
//   category?: Category;
// };

// export default function StockCard({
//   liveStock,
//   soldStock,
//   averagePrice,
//   products,
// }: {
//   liveStock: number;
//   soldStock: number;
//   averagePrice: number;
//   products: ProductWithRelations[];
// }) {
//   const router = useRouter();
//   const params = useParams();

//   const [isOldestFirst, setIsOldestFirst] = useState(true);

//   const filteredProducts = products.filter(
//     (product) =>
//       new Date(product.createdAt) <
//         new Date(new Date().setMonth(new Date().getMonth() - 1)) &&
//       !product.isArchived
//   );

//   const sortedProducts = [...filteredProducts].sort((a, b) => {
//     if (isOldestFirst) {
//       return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
//     } else {
//       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//     }
//   });

//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-2xl font-bold">Stock</CardTitle>
//         <Package className="h-6 w-6 text-primary" />
//       </CardHeader>
//       <CardContent className="flex-grow grid gap-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div className="flex flex-col">
//             <span className="text-sm font-medium text-muted-foreground">
//               Live
//             </span>
//             <span className="text-2xl font-bold text-green-600">
//               {liveStock}
//             </span>
//           </div>
//           <div className="flex flex-col">
//             <span className="text-sm font-medium text-muted-foreground">
//               Sold
//             </span>
//             <span className="text-2xl font-bold text-red-600">
//               {soldStock}
//             </span>
//           </div>
//           <div className="col-span-2">
//             <span className="text-sm font-medium text-muted-foreground">
//               Average price point
//             </span>
//             <span className="block text-2xl font-bold">
//               £
//               {averagePrice.toLocaleString(undefined, {
//                 minimumFractionDigits: 0,
//                 maximumFractionDigits: 0,
//               })}
//             </span>
//           </div>
//         </div>
//         <Separator />
//         <div className="flex-grow flex flex-col">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-md font-bold flex items-center gap-2">
//               Live Stock Older Than 3 Months:
//               <RiErrorWarningLine className="text-orange-300 h-5 w-5" />
//             </span>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setIsOldestFirst(!isOldestFirst)}
//             >
//               {isOldestFirst ? "Show Oldest First" : "Show Latest First"}
//             </Button>
//           </div>
//           <ScrollArea className="flex-grow w-full flex-col h-[200px]">
//             {products.length === 0 ? (
//               <div className="text-sm text-muted-foreground w-full">
//                 No products found
//               </div>
//             ) : sortedProducts.length === 0 ? (
//               <div className="text-sm text-muted-foreground w-full">
//                 No products older than 3 months found
//               </div>
//             ) : (
//               <div className="space-y-2 flex flex-col w-full">
//                 {sortedProducts.map((product) => (
//                   <div
//                     key={product.id}
//                     onClick={() =>
//                       router.push(
//                         `/${params.storeId}/products/${product.id}/details`
//                       )
//                     }
//                     className="text-sm text-muted-foreground hover:bg-muted p-2 rounded-md transition-colors cursor-pointer w-full"
//                   >
//                     <div className="flex justify-between items-center mt-1 w-full gap-2">
//                       <div className="font-medium hover:underline w-full">
//                         {product.name}:

//                       </div>
//                       <span className="text-xs justify-start items-start w-full">
//                         {product.designer?.name}
//                       </span>
//                       <span className="text-xs justify-start items-start w-full">
//                         {product.category?.name}
//                       </span>
//                       <span className="text-xs justify-start items-start w-full">
//                         £{product.ourPrice.toString()}
//                       </span>
//                       <span className="text-xs w-full text-right justify-end">
//                         Created:{" "}
//                         {new Date(product.createdAt).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </ScrollArea>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
