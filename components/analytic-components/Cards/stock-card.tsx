"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { currencyConvertor } from "@/lib/utils";
import { TbTag } from "react-icons/tb";
import OldStockTable from "../Tables/old-stock-table";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/modal";
import { Order, OrderItem, Payout, Product } from "@prisma/client";
import EndOfDayTable from "../Tables/end-of-day-report-table";

type StockCardProps = {
  countryCode: string;
};

export default function StockCard({ countryCode }: StockCardProps) {
  const currencySymbol = currencyConvertor(countryCode);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<
    (Order & { orderItems: OrderItem[] })[]
  >([]);
  const [payoutData, setPayoutData] = useState<Payout[]>([]);
  const [productData, setProductData] = useState<Product[]>([]);
  const router = useRouter();
  const params = useParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDateChanged, setIsDateChanged] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // useEffect(() => {
  //   fetchData(currentDate);
  //   console.log("filteredOrders updated:", filteredOrders);
  // }, [currentDate]);
  useEffect(() => {
    //   console.log("filteredOrders updated:", filteredOrders);
    fetchData(currentDate);
  }, []);

  // const handleDateChange = (date: Date | undefined) => {
  //   if (date) {
  //     setCurrentDate(date);
  //     fetchData(date);
  //   }
  // };

  const fetchData = useCallback(
    async (date = new Date()) => {
      try {
        setIsLoading(true);
        const fetchedData = await axios.get(
          `/api/${params.storeId}/orders/stock-card`,
          {
            params: {
              storeId: params.storeId,
              date: date.toISOString(),
            },
          }
        );

        const fetchedProductData = await axios.get(
          `/api/${params.storeId}/products/analytics`,
          {
            params: {
              storeId: params.storeId,
              date: date.toISOString(),
            },
          }
        );
        // destructure both objects from the response
        const { orders, payouts } = fetchedData.data;
        setOrderData(orders);
        setPayoutData(payouts);
        setProductData(fetchedProductData.data);
      } catch (error) {
        console.error("Failed to fetch stock card data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [params.storeId]
  );

  const liveStock = productData.filter(
    (product: { isArchived: any }) => !product.isArchived
  ).length;
  const soldStock = productData.filter(
    (product: { isArchived: any }) => product.isArchived
  ).length;

  const filteredOrders = orderData.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getDate() === currentDate.getDate() &&
      orderDate.getMonth() === currentDate.getMonth() &&
      orderDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const filteredPayouts = payoutData.filter((payout: any) => {
    const payoutDate = new Date(payout.createdAt);
    return (
      payoutDate.getDate() === currentDate.getDate() &&
      payoutDate.getMonth() === currentDate.getMonth() &&
      payoutDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const todaysGrossRevenue = filteredOrders.reduce((total, order) => {
    return total + (Number(order.totalAmount) || 0);
  }, 0);

  // if payout is to the store then thats our net revenue
  const todaysNetRevenue = filteredPayouts.reduce((total, payout) => {
    if (payout.sellerId === params.storeId) {
      return total + (Number(payout.amount) || 0);
    } else {
      return total;
    }
  }, 0);

  const todaysSellerPayouts = filteredPayouts.reduce((total, payout) => {
    if (payout.sellerId !== params.storeId) {
      return total + (Number(payout.amount) || 0);
    } else {
      return total;
    }
  }, 0);

  const averageItemsSoldPerOrder = filteredOrders.map((order) => {
    const totalAmount = order.totalAmount;
    const itemsCount = order.orderItems.length;

    const averagePerOrder = Number(totalAmount) / Number(itemsCount);

    return averagePerOrder;
  });

  const totalAverageForOneUnitToday =
    averageItemsSoldPerOrder.reduce((sum, avg) => sum + avg, 0) /
    averageItemsSoldPerOrder.length;

  const averageTransactionValue = todaysGrossRevenue / filteredOrders.length;

  const totalStockWorth = productData.reduce((total, product) => {
    if (!product.isArchived) {
      return total + (Number(product.ourPrice) || 0);
    }
    return total;
  }, 0);

  const calculateAveragePrice = (products: { ourPrice: number }[]): number =>
    products.length
      ? +(
          products.reduce((acc, { ourPrice }) => acc + ourPrice, 0) /
          products.length
        ).toFixed(2)
      : 0;

  const averagePrice = calculateAveragePrice(
    productData
      .filter(({ isArchived }) => !isArchived)
      .map((product) => ({
        ...product,
        ourPrice: Number(product.ourPrice),
      }))
  );

  const cashOrderRevenue = filteredOrders
  .filter(order => order.isCash === true)
  .reduce((total, order) => total + (Number(order.totalAmount ?? 0)), 0);


  console.log("cashOrderRevenue", cashOrderRevenue);
  console.log("orderData", orderData);

  return (
    <Card className="h-full flex flex-col w-full flex-grow gap-4 p-6">
      <div className="space-x-4 space-y-4 ">
        <div className="gap-4 flex flex-col">
          <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
              <CardTitle className="w-full">
                <div className="flex items-center gap-2">
                  Sales Overview
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "hover:cursor-pointer hover:underline text-super-small justify-start text-left",
                          !currentDate && "text-muted-foreground"
                        )}
                      >
                        {currentDate ? (
                          format(currentDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={currentDate}
                        // onSelect={(date) => date && handleDateChange(date)}
                        onSelect={(date) => {
                          if (date) {
                            setCurrentDate(date);
                            setIsDateChanged(true);
                            fetchData(date);
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("2023-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardTitle>
              <div className="flex flex-row items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  disabled={isLoading}
                  onClick={openModal}
                  className="hover:cursor-pointer hover:underline"
                >
                  End of Day Report
                </Button>
                <Package className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-[75px] w-full" />
                    <Skeleton className="h-[75px] w-full" />
                    <Skeleton className="h-[75px] w-full" />
                    <Skeleton className="h-[75px] w-full" />
                    <Skeleton className="h-[25px] w-1/2" />
                    <Skeleton className="h-[25px] w-1/2" />
                    <Skeleton className="h-[25px] w-1/2" />
                    <Skeleton className="h-[25px] w-1/2" />
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Gross Revenue
                      </div>
                      <div className="text-2xl font-bold">
                        {todaysGrossRevenue > 0 ? (
                          <>
                            {`${currencySymbol}${todaysGrossRevenue.toFixed(
                              2
                            )}`}
                            <div className="flex flex-col justify-start">
                              <p className="text-xs text-green-500 underline">
                                Net:{" "}
                                {`${currencySymbol}${todaysNetRevenue.toFixed(
                                  2
                                )}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Payout:{" "}
                                {`${currencySymbol}${todaysSellerPayouts.toFixed(
                                  2
                                )}`}
                              </p>
                              <p className="text-xs text-gray-400">
                                Fees:{" "}
                                {`${currencySymbol}${(
                                  todaysGrossRevenue -
                                  (todaysNetRevenue + todaysSellerPayouts)
                                ).toFixed(2)}`}
                              </p>
                              <p className="text-xs text-gray-400">
                                Cash:{" "}
                                {`${currencySymbol}${(
                                  cashOrderRevenue
                                ).toFixed(2)}`}
                              </p>
                            </div>
                          </>
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
                      {filteredOrders.length > 0 ? (
                        <div className="text-2xl font-bold">
                          {filteredOrders.length}
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
                      {filteredOrders.length > 0 ? (
                        <div className="text-2xl font-bold">
                          {currencySymbol}
                          {averageTransactionValue.toFixed(2)}
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
                      {filteredOrders.length > 0 ? (
                        <div className="text-2xl font-bold">
                          {currencySymbol}
                          {totalAverageForOneUnitToday.toFixed(2)}
                        </div>
                      ) : (
                        <div className="flex text-xs text-muted-foreground">
                          No units sold today
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          {isLoading ? (
            <>
              <Skeleton className="h-[75px] w-full" />
            </>
          ) : (
            <>
              <Card className="col-span-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      Stock Overview
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Live Stock
                      </CardTitle>
                      <TbTag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{liveStock}</div>
                      <p className="text-xs text-muted-foreground">
                        Available items
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Sold Stock
                      </CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{soldStock}</div>
                      <p className="text-xs text-muted-foreground">
                        Items sold
                      </p>
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
                        {currencySymbol}
                        {averagePrice.toFixed(2)}
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
                        {currencySymbol}
                        {totalStockWorth.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total value
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {isModalOpen && (
          <EndOfDayTable
            countryCode={countryCode}
            orderData={orderData}
            isModalOpen={isModalOpen} // pass parent's state
            onClose={closeModal} // pass parent's close handler
            todaysGrossRevenue={todaysGrossRevenue}
            todaysNetRevenue={todaysNetRevenue}
            todaysSellerPayouts={todaysSellerPayouts}
            cashOrderRevenue={cashOrderRevenue}
          />
        )}
      </div>
    </Card>
  );
}

// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { useParams, useRouter } from "next/navigation";
// import { useCallback, useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Badge,
//   Package,
//   ShoppingCart,
//   TrendingUp,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { currencyConvertor } from "@/lib/utils";
// import { TbTag } from "react-icons/tb";
// import OldStockTable from "../Tables/old-stock-table";
// import axios from "axios";
// import { Skeleton } from "@/components/ui/skeleton";

// type StockCardProps = {
//   countryCode: string;
// };

// export default function StockCard({ countryCode }: StockCardProps) {
//   const currencySymbol = currencyConvertor(countryCode);
//   const [isLoading, setIsLoading] = useState(false);
//   const [orderData, setOrderData] = useState<any[]>([]);
//   const [payoutData, setPayoutData] = useState<any[]>([]);
//   const [productData, setProductData] = useState<any[]>([]);
//   const router = useRouter();
//   const params = useParams();
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [isDateChanged, setIsDateChanged] = useState(false);

//   useEffect(() => {
//     fetchData(currentDate);
//   }, [currentDate]);

//   const fetchData = useCallback(
//     async (date = new Date()) => {
//       try {
//         setIsLoading(true);
//         const fetchedData = await axios.get(
//           `/api/${params.storeId}/orders/stock-card`,
//           {
//             params: {
//               storeId: params.storeId,
//               date: date.toISOString(),
//             },
//           }
//         );

//         const fetchedProductData = await axios.get(
//           `/api/${params.storeId}/products/analytics`,
//           {
//             params: {
//               storeId: params.storeId,
//               date: date.toISOString(),
//             },
//           }
//         );
//         // destructure both objects from the response
//         const { orders, payouts } = fetchedData.data;
//         setOrderData(orders);
//         setPayoutData(payouts);
//         setProductData(fetchedProductData.data);
//       } catch (error) {
//         console.error("Failed to fetch stock card data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [params.storeId]
//   );

//   const handleDateChange = async (direction: "back" | "forward") => {
//     const newDate = new Date(currentDate);
//     if (direction === "back") {
//       newDate.setDate(newDate.getDate() - 1);
//     } else {
//       newDate.setDate(newDate.getDate() + 1);
//     }
//     setCurrentDate(newDate);
//     setIsDateChanged(true);
//     await fetchData(newDate);
//   };

//   const liveStock = productData.filter(
//     (product: { isArchived: any }) => !product.isArchived
//   ).length;
//   const soldStock = productData.filter(
//     (product: { isArchived: any }) => product.isArchived
//   ).length;

//   const filteredOrders = orderData.filter((order: any) => {
//     const orderDate = new Date(order.createdAt);
//     return (
//       orderDate.getDate() === currentDate.getDate() &&
//       orderDate.getMonth() === currentDate.getMonth() &&
//       orderDate.getFullYear() === currentDate.getFullYear()
//     );
//   });

//   const filteredPayouts = payoutData.filter((payout: any) => {
//     const payoutDate = new Date(payout.createdAt);
//     return (
//       payoutDate.getDate() === currentDate.getDate() &&
//       payoutDate.getMonth() === currentDate.getMonth() &&
//       payoutDate.getFullYear() === currentDate.getFullYear()
//     );
//   });

//   const todaysGrossRevenue = filteredOrders.reduce((total, order) => {
//     return total + (Number(order.totalAmount) || 0);
//   }, 0);

//   const todaysSellerPayouts = filteredPayouts.reduce((total, payout) => {
//     if (payout.sellerId === params.storeId) {
//       return total + (Number(payout.amount) || 0);
//     } else {
//       return total;
//     }
//   }, 0);

//   const averageItemsSoldPerOrder = filteredOrders.map((order) => {
//     const totalAmount = order.totalAmount;
//     const itemsCount = order.orderItems.length;

//     const averagePerOrder = Number(totalAmount) / Number(itemsCount);

//     return averagePerOrder;
//   });

//   const totalAverageForOneUnitToday =
//     averageItemsSoldPerOrder.reduce((sum, avg) => sum + avg, 0) /
//     averageItemsSoldPerOrder.length;

//   const averageTransactionValue = todaysGrossRevenue / filteredOrders.length;

//   const totalStockWorth = productData.reduce((total, product) => {
//     if (!product.isArchived) {
//       return total + (Number(product.ourPrice) || 0);
//     }
//     return total;
//   }, 0);

//   const calculateAveragePrice = (products: { ourPrice: number }[]): number =>
//     products.length
//       ? +(
//           products.reduce((acc, { ourPrice }) => acc + ourPrice, 0) /
//           products.length
//         ).toFixed(2)
//       : 0;

//   const averagePrice = calculateAveragePrice(
//     productData.filter(({ isArchived }) => !isArchived)
//   );

//   return (
//     <Card className="h-full flex flex-col">
//       <CardContent className="flex-grow grid gap-4">
//         <div className="">
//           <Card className="col-span-full">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle>
//                 <div className="flex items-center gap-2">
//                   Sales Overview
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => handleDateChange("back")}
//                     disabled={isLoading}
//                   >
//                     <ChevronLeft className="h-4 w-4" />
//                   </Button>
//                   <span className="text-sm">
//                     {isDateChanged ? currentDate.toLocaleDateString() : "Today"}
//                   </span>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => handleDateChange("forward")}
//                     disabled={isLoading || currentDate >= new Date()}
//                   >
//                     <ChevronRight className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </CardTitle>
//               <div className="flex flex-row items-center gap-2">
//                 <Button variant="outline" size="sm" disabled={isLoading}>
//                   EOD
//                 </Button>
//                 <Package className="h-6 w-6 text-primary" />
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                 {isLoading ? (
//                   <>
//                     <Skeleton className="h-[75px] w-full" />
//                     <Skeleton className="h-[75px] w-full" />
//                     <Skeleton className="h-[75px] w-full" />
//                     <Skeleton className="h-[75px] w-full" />
//                     <Skeleton className="h-[25px] w-1/2" />
//                     <Skeleton className="h-[25px] w-1/2" />
//                     <Skeleton className="h-[25px] w-1/2" />
//                     <Skeleton className="h-[25px] w-1/2" />
//                   </>
//                 ) : (
//                   <>
//                     <div>
//                       <div className="text-sm font-medium text-muted-foreground">
//                         Gross Revenue
//                       </div>
//                       <div className="text-2xl font-bold">
//                         {todaysGrossRevenue > 0 ? (
//                           <>
//                             {`${currencySymbol}${todaysGrossRevenue.toFixed(
//                               2
//                             )}`}
//                             <div className="flex flex-col justify-start">
//                               <p className="text-xs text-muted-foreground">
//                                 Payout:{" "}
//                                 {`${currencySymbol}${todaysSellerPayouts.toFixed(
//                                   2
//                                 )}`}
//                               </p>
//                               <p className="text-super-small text-muted-foreground">
//                                 Fees:{" "}
//                                 {`${currencySymbol}${(
//                                   todaysGrossRevenue - todaysSellerPayouts
//                                 ).toFixed(2)}`}
//                               </p>
//                             </div>
//                           </>
//                         ) : (
//                           <span className="flex text-xs text-muted-foreground">
//                             No sales today
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                     <div>
//                       <div className="text-sm font-medium text-muted-foreground">
//                         Orders
//                       </div>
//                       {filteredOrders.length > 0 ? (
//                         <div className="text-2xl font-bold">
//                           {filteredOrders.length}
//                         </div>
//                       ) : (
//                         <div className="flex text-xs text-muted-foreground">
//                           No orders yet today
//                         </div>
//                       )}
//                     </div>
//                     <div>
//                       <div className="text-sm font-medium text-muted-foreground">
//                         Avg Transaction
//                       </div>
//                       {filteredOrders.length > 0 ? (
//                         <div className="text-2xl font-bold">
//                           {currencySymbol}
//                           {averageTransactionValue.toFixed(2)}
//                         </div>
//                       ) : (
//                         <div className="flex text-xs text-muted-foreground">
//                           No transactions today
//                         </div>
//                       )}
//                     </div>
//                     <div>
//                       <div className="text-sm font-medium text-muted-foreground">
//                         Avg price of unit
//                       </div>
//                       {filteredOrders.length > 0 ? (
//                         <div className="text-2xl font-bold">
//                           {currencySymbol}
//                           {totalAverageForOneUnitToday.toFixed(2)}
//                         </div>
//                       ) : (
//                         <div className="flex text-xs text-muted-foreground">
//                           No units sold today
//                         </div>
//                       )}
//                     </div>
//                   </>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//           {isLoading ? (
//             <>
//               <Skeleton className="h-[75px] w-full" />
//               <Skeleton className="h-[75px] w-full" />
//               <Skeleton className="h-[75px] w-full" />
//               <Skeleton className="h-[75px] w-full" />
//               <Skeleton className="h-[25px] w-1/2" />
//               <Skeleton className="h-[25px] w-1/2" />
//               <Skeleton className="h-[25px] w-1/2" />
//               <Skeleton className="h-[25px] w-1/2" />
//             </>
//           ) : (
//             <>
//               <Card className="col-span-full">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle>
//                     <div className="flex items-center gap-2">
//                       Stock Overview
//                     </div>
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                   <Card className="">
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">
//                         Live Stock
//                       </CardTitle>
//                       <TbTag className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">{liveStock}</div>
//                       <p className="text-xs text-muted-foreground">
//                         Available items
//                       </p>
//                     </CardContent>
//                   </Card>
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">
//                         Sold Stock
//                       </CardTitle>
//                       <ShoppingCart className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">{soldStock}</div>
//                       <p className="text-xs text-muted-foreground">
//                         Items sold
//                       </p>
//                     </CardContent>
//                   </Card>
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">
//                         Average Price
//                       </CardTitle>
//                       <TrendingUp className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">
//                         {currencySymbol}
//                         {averagePrice.toFixed(2)}
//                       </div>
//                       <p className="text-xs text-muted-foreground">Per item</p>
//                     </CardContent>
//                   </Card>
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-sm font-medium">
//                         Total Stock Worth
//                       </CardTitle>
//                       <Badge className="h-4 w-4 text-muted-foreground" />
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-2xl font-bold">
//                         {currencySymbol}
//                         {totalStockWorth.toFixed(2)}
//                       </div>
//                       <p className="text-xs text-muted-foreground">
//                         Total value
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </CardContent>
//               </Card>
//             </>
//           )}
//         </div>
//         <Separator />

//         <OldStockTable countryCode={countryCode} />

//       </CardContent>
//     </Card>
//   );
// }
