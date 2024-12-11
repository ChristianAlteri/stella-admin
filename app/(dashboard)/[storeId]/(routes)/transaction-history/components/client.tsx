"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from "lucide-react";
import { columns, TransactionHistoryColumn } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TbReceipt, TbTag } from "react-icons/tb";
import { Order, OrderItem, Payout, Product, Seller } from "@prisma/client";

type OrderWithItemsAndSeller = Order & {
  orderItems: (OrderItem & {
    product: Product & {
      images: { url: string }[];
      designer: { name: string };
      seller: {
        storeName: string;
        id: string;
        name: string;
      };
      category: { name: string };
      size: { name: string };
      color: { name: string };
    };
  })[];
  soldByStaff: { name: string; id: string } | null;
  Payout: {
    id: string;
    amount: number;
    transferGroupId: string | null;
    stripeTransferId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

interface TransactionHistoryClientProps {
  orders: OrderWithItemsAndSeller[];
  countryCode: string;
}

export const TransactionHistoryClient: React.FC<
  TransactionHistoryClientProps
> = ({ orders, countryCode }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDispatchedOrders, setShowDispatchedOrders] = useState<
    boolean | null
  >(null);
  const [showOnlineSales, setShowOnlineSales] = useState<boolean | null>(null);

  const transformedOrders = useMemo(() => {
    return orders.map((order) => ({
      order,
      countryCode,
    }));
  }, [orders, countryCode]);

  // TODO: Add the filter here to sort cash payments marked as unpaid vs paid

  const handleClearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setShowDispatchedOrders(null);
    setShowOnlineSales(null);
  };

  const filteredOrders = useMemo(() => {
    return transformedOrders.filter((data) => {
      const lowercasedSearchTerm = searchTerm.toLowerCase();

      // Strip time from `createdAt` to get only the date
      const orderDate = new Date(data.order.createdAt);
      const normalizedOrderDate = new Date(
        orderDate.getFullYear(),
        orderDate.getMonth(),
        orderDate.getDate()
      );

      // Normalize startDate and endDate to remove time
      const startDateObj = startDate
        ? new Date(
            new Date(startDate).getFullYear(),
            new Date(startDate).getMonth(),
            new Date(startDate).getDate()
          )
        : null;
      const endDateObj = endDate
        ? new Date(
            new Date(endDate).getFullYear(),
            new Date(endDate).getMonth(),
            new Date(endDate).getDate()
          )
        : null;

      const matchesSearchTerm =
        data.order.id.toLowerCase().includes(lowercasedSearchTerm) ||
        data.order.orderItems.some((item) =>
          item.product.seller.storeName
            .toLowerCase()
            .includes(lowercasedSearchTerm)
        ) ||
        data.order.orderItems.some((item) =>
          item.product.name.toLowerCase().includes(lowercasedSearchTerm)
        );

      const matchesDateRange =
        (!startDateObj || normalizedOrderDate >= startDateObj) &&
        (!endDateObj || normalizedOrderDate <= endDateObj);

      // const matchesDispatchedFilter =
      //   showDispatchedOrders === null ||
      //   (!data.order.inStoreSale &&
      //     data.order.hasBeenDispatched === showDispatchedOrders);

      const matchesDispatchedFilter =
        showDispatchedOrders === null ||
        (data.order.inStoreSale !== true &&
          data.order.hasBeenDispatched === showDispatchedOrders);

      const matchesOnlineFilter =
        showOnlineSales === null || data.order.inStoreSale === !showOnlineSales;

      return (
        matchesSearchTerm &&
        matchesDateRange &&
        matchesDispatchedFilter &&
        matchesOnlineFilter
      );
    });
  }, [
    searchTerm,
    startDate,
    endDate,
    transformedOrders,
    showDispatchedOrders,
    showOnlineSales,
  ]);

  // Calculate the average payout
  const averagePayout = useMemo(() => {
    const totalPayout = orders.reduce(
      (sum, order) =>
        sum +
        order.Payout.reduce(
          (payoutSum, payout) => payoutSum + payout.amount,
          0
        ),
      0
    );
    const totalPayoutCount = orders.reduce(
      (count, order) => count + order.Payout.length,
      0
    );
    return totalPayoutCount > 0 ? totalPayout / totalPayoutCount : 0;
  }, [orders]);

  // Calculate the average order amount
  const averageOrderAmount = useMemo(() => {
    const totalOrderAmount = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    return orders.length > 0 ? totalOrderAmount / orders.length : 0;
  }, [orders]);

  return (
    <Card className="w-full ">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <TbReceipt className="mr-2 h-6 w-6" />
            Transaction History ({filteredOrders.length})
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search any transaction"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto"
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto"
                placeholder="End Date"
              />
              <Button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Clear Dates
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2 ">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDispatchedOrders((prev) =>
                    prev === null ? false : !prev
                  );
                }}
              >
                {showDispatchedOrders === null || showDispatchedOrders
                  ? "Unfulfilled Orders"
                  : "Dispatched"}
              </Button> */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${
                    showDispatchedOrders === false ||
                    showDispatchedOrders === null
                      ? "text-white bg-red-500"
                      : "text-white bg-gray-500"
                  }`}
                  onClick={() => setShowDispatchedOrders(false)}
                >
                  Unfulfilled Orders
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={`${
                    showDispatchedOrders === true
                      ? "text-white bg-green-500"
                      : "text-white bg-gray-500"
                  }`}
                  onClick={() => setShowDispatchedOrders(true)}
                >
                  Dispatched
                </Button>
              </div>
              {/* <Button
                variant="outline"
                size="sm"
                className={`${
                  showDispatchedOrders === null || showDispatchedOrders
                    ? "text-white bg-red-500"
                    : "text-white bg-green-500"
                }`}
                onClick={() => {
                  setShowDispatchedOrders((prev) =>
                    prev === null ? false : !prev
                  );
                }}
              >
                {showDispatchedOrders === null || showDispatchedOrders
                  ? "Unfulfilled Orders"
                  : "Dispatched"}
              </Button> */}

              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowOnlineSales((prev) => (prev === true ? false : true));
                }}
              >
                {showOnlineSales === true
                  ? "Show In-Store Sales"
                  : "Show Online Sales"}
              </Button> */}

              <Button
                onClick={handleClearFilters}
                size="icon"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-row w-full gap-2">
            {/* TODO: add these to dashboard not necessary here */}
            {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Payout
              </CardTitle>
              <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                £{averagePayout.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order
              </CardTitle>
              <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                £{averageOrderAmount.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Payouts
              </CardTitle>
              <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Average Payout</p>
              <p className="text-lg font-semibold">
                £{averagePayout.toFixed(2)}
              </p>
            </CardContent>
          </Card> */}
          </div>
        </div>
        <Separator className="my-6" />
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="inStore">Store</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="flex mt-4">
              <Heading
                title={`All Orders (${filteredOrders.length})`}
                description="See All"
              />
            </div>
            {/* TABLE */}
            <DataTable columns={columns} data={filteredOrders} />
          </TabsContent>

          <TabsContent value="inStore">
            <div className="flex mt-4">
              <Heading
                title={`In Store Sales (${
                  filteredOrders.filter(
                    (data) => data.order.inStoreSale === true
                  ).length
                })`}
                description="See orders"
              />
            </div>
            {/* TABLE */}
            <DataTable
              columns={columns}
              data={filteredOrders.filter(
                (data) => data.order.inStoreSale === true
              )}
            />
          </TabsContent>

          <TabsContent value="online">
            <div className="flex mt-4">
              <Heading
                title={`Online Orders (${
                  filteredOrders.filter(
                    (data) => data.order.inStoreSale === false
                  ).length
                })`}
                description="See orders"
              />
            </div>
            {/* TABLE */}
            <DataTable
              columns={columns}
              data={filteredOrders.filter(
                (data) => data.order.inStoreSale === false
              )}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
