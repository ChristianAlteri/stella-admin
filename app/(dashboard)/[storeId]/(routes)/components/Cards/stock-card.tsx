"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Product,
  Designer,
  Seller,
  Category,
  OrderItem,
  Order,
} from "@prisma/client";
import { RiErrorWarningLine } from "react-icons/ri";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Badge,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

type ProductWithRelations = Product & {
  designer?: Designer;
  seller?: Seller;
  category?: Category;
};

type OrderWithItems = Order & {
  orderItems: OrderItem[];
};

type StockCardProps = {
  liveStock: number;
  soldStock: number;
  averagePrice: number;
  products: ProductWithRelations[];
  todaysOrders: OrderWithItems[];
};

export default function StockCard({
  liveStock,
  soldStock,
  averagePrice,
  products,
  todaysOrders,
}: StockCardProps) {
  const router = useRouter();
  const params = useParams();

  const [isOldestFirst, setIsOldestFirst] = useState(true);

  const filteredProducts = products.filter(
    (product) =>
      new Date(product.createdAt) <
        new Date(new Date().setMonth(new Date().getMonth() - 1)) &&
      !product.isArchived
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (isOldestFirst) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const totalStockWorth = products.reduce((total, product) => {
    if (!product.isArchived) {
      return total + (Number(product.ourPrice) || 0);
    }
    return total;
  }, 0);

  const todaysRevenue = todaysOrders.reduce((total, order) => {
    return total + (Number(order.totalAmount) || 0);
  }, 0);

  const averageItemsSoldPerOrder = todaysOrders.map((order) => {
    const totalAmount = order.totalAmount;
    const itemsCount = order.orderItems.length;

    const averagePerOrder = Number(totalAmount) / Number(itemsCount);
    console.log(`Order ${order.id} - Average: ${averagePerOrder}`);

    return averagePerOrder;
  });

  const totalAverageForOneUnitToday =
    averageItemsSoldPerOrder.reduce((sum, avg) => sum + avg, 0) /
    averageItemsSoldPerOrder.length;

  // const averageTransactionValue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0) / todaysOrders.length;
  const averageTransactionValue = todaysRevenue / todaysOrders.length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"></CardHeader>
      <CardContent className="flex-grow grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Today&apos;s Overview</CardTitle>
              <Package className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Revenue
                  </div>
                  <div className="text-2xl font-bold">
                    {todaysRevenue > 0 ? (
                      formatCurrency(todaysRevenue)
                    ) : (
                      <span className="flex text-xs text-muted-foreground">
                        No sales today
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Orders
                  </div>
                  {todaysOrders.length > 0 ? (
                    <div className="text-2xl font-bold">
                      {todaysOrders.length}
                    </div>
                  ) : (
                    <div className="flex text-xs text-muted-foreground">
                      No orders yet today
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Avg Transaction
                  </div>
                  {todaysOrders.length > 0 ? (
                    <div className="text-2xl font-bold">
                      {formatCurrency(averageTransactionValue)}
                    </div>
                  ) : (
                    <div className="flex text-xs text-muted-foreground">
                      No transactions today
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Avg price of unit
                  </div>
                  {todaysOrders.length > 0 ? (
                    <div className="text-2xl font-bold">
                      {formatCurrency(totalAverageForOneUnitToday)}
                    </div>
                  ) : (
                    <div className="flex text-xs text-muted-foreground">
                      No units sold today
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStock}</div>
              <p className="text-xs text-muted-foreground">Available items</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold Stock</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{soldStock}</div>
              <p className="text-xs text-muted-foreground">Items sold</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Price
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(averagePrice)}
              </div>
              <p className="text-xs text-muted-foreground">Per item</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Stock Worth
              </CardTitle>
              <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalStockWorth)}
              </div>
              <p className="text-xs text-muted-foreground">Total value</p>
            </CardContent>
          </Card>
        </div>
        <Separator />
        <div className="flex-grow flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-md font-bold flex items-center gap-2">
              Stock Older Than 4 weeks:
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
                    <th className="px-4 py-2">Seller</th>
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
                        {product.seller?.storeName ??
                          product.seller?.instagramHandle}
                      </td>
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

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Product, Designer, Seller, Category, Order } from "@prisma/client";
// import { RiErrorWarningLine } from "react-icons/ri";
// import { useParams, useRouter } from "next/navigation";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton"
// import { Badge, DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react"
// import { formatCurrency } from "@/lib/utils";

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
//   todaysOrders,
// }:
// {
//   liveStock: number;
//   soldStock: number;
//   averagePrice: number;
//   products: ProductWithRelations[];
//   todaysOrders: Order[];
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

//   const totalStockWorth = products.reduce((total, product) => {
//     if (!product.isArchived) {
//       return total + (Number(product.ourPrice) || 0);
//     }
//     return total;
//   }, 0);

//   const todaysRevenue = todaysOrders.reduce((total, order) => {
//     return total + (Number(order.totalAmount) || 0);
//   }, 0);

//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         {/* <CardTitle className="text-2xl font-bold">Stock</CardTitle> */}
//       </CardHeader>
//       <CardContent className="flex-grow grid gap-4">
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card className="col-span-full">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle>Today&apos;s Overview</CardTitle>
//         <Package className="h-6 w-6 text-primary" />
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 md:grid-cols-2">
//                 <div>
//                   <div className="text-sm font-medium text-muted-foreground">
//                     Revenue
//                   </div>
//                   <div className="text-2xl font-bold">
//                     {todaysRevenue > 0 ? (
//                       formatCurrency(todaysRevenue)
//                     ) : (
//                       <span className="flex text-xs text-muted-foreground">No sales today</span>
//                     )}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-sm font-medium text-muted-foreground">
//                     Orders
//                   </div>
//                   {todaysOrders.length > 0 ? (
//                     <div className="text-2xl font-bold">
//                       {todaysOrders.length}
//                     </div>
//                   ) : (
//                     <div className="flex text-xs text-muted-foreground">
//                       No orders yet today
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Live Stock</CardTitle>
//               <Package className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{liveStock}</div>
//               <p className="text-xs text-muted-foreground">Available items</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Sold Stock</CardTitle>
//               <ShoppingCart className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{soldStock}</div>
//               <p className="text-xs text-muted-foreground">Items sold</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 Average Price
//               </CardTitle>
//               <TrendingUp className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {formatCurrency(averagePrice)}
//               </div>
//               <p className="text-xs text-muted-foreground">Per item</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 Total Stock Worth
//               </CardTitle>
//               <Badge className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {formatCurrency(totalStockWorth)}
//               </div>
//               <p className="text-xs text-muted-foreground">Total value</p>
//             </CardContent>
//           </Card>

//         </div>
//         <Separator />
//         <div className="flex-grow flex flex-col">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-md font-bold flex items-center gap-2">
//               Stock Older Than 4 weeks:
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
//             {sortedProducts.length === 0 ? (
//               <div className="text-sm text-muted-foreground w-full">
//                 No products older than 3 months found
//               </div>
//             ) : (
//               <table className="w-full text-sm text-left text-muted-foreground">
//                 <thead className="text-xs uppercase bg-gray-50 sticky top-0 rounded-md">
//                   <tr className="rounded-md">
//                     <th className="px-4 py-2">Product Name</th>
//                     <th className="px-4 py-2">Seller</th>
//                     <th className="px-4 py-2">Designer</th>
//                     <th className="px-4 py-2">Category</th>
//                     <th className="px-4 py-2">Price</th>
//                     <th className="px-4 py-2">Date Created</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {sortedProducts.map((product) => (
//                     <tr
//                       key={product.id}
//                       className="hover:bg-gray-100 rounded-md hover:cursor-pointer"
//                       onClick={() =>
//                         router.push(
//                           `/${params.storeId}/products/${product.id}/details`
//                         )
//                       }
//                     >
//                       <td className="px-4 py-2">{product.name}</td>
//                       <td className="px-4 py-2">{product.seller?.storeName ?? product.seller?.instagramHandle}</td>
//                       <td className="px-4 py-2">
//                         {product.designer?.name ?? "N/A"}
//                       </td>
//                       <td className="px-4 py-2">
//                         {product.category?.name ?? "N/A"}
//                       </td>
//                       <td className="px-4 py-2">
//                         £{product.ourPrice.toString()}
//                       </td>
//                       {/* <td className="px-4 py-2">
//                         {new Date(product.createdAt).toLocaleDateString()}
//                       </td> */}
//                       <td className="px-4 py-2">
//                         {Math.floor(
//                           (Number(new Date()) -
//                             Number(new Date(product.createdAt))) /
//                             (1000 * 60 * 60 * 24)
//                         )}{" "}
//                         days ago
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </ScrollArea>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
