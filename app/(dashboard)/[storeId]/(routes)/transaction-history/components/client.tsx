"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
} from "lucide-react";
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
  // sellers: Seller[];
  countryCode: string;
}

export const TransactionHistoryClient: React.FC<
  TransactionHistoryClientProps
> = ({ orders, countryCode }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const transformedOrders = useMemo(() => {
    return orders.map((order) => ({
      order,
      countryCode,
    }));
  }, [orders, countryCode]);

  const filteredOrders = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return transformedOrders.filter((data) => {
      const orderIdMatch = data.order.id
        .toLowerCase()
        .includes(lowercasedSearchTerm);
      const sellerNameMatch = data.order.orderItems.some((item) =>
        item.product.seller.storeName
          .toLowerCase()
          .includes(lowercasedSearchTerm)
      );
      const productNameMatch = data.order.orderItems.some((item) =>
        item.product.name.toLowerCase().includes(lowercasedSearchTerm)
      );

      return orderIdMatch || sellerNameMatch || productNameMatch;
    });
  }, [searchTerm, transformedOrders]);

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
            Transaction History ({orders.length})
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
              {/* TODO: Give me some good tools to zero in on an order */}
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
        <Tabs defaultValue="orders" className="w-full">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            {/* <TabsTrigger value="payouts">Payouts</TabsTrigger> */}
          </TabsList>
          <TabsContent value="orders">
            <div className="flex mt-4">
              <Heading
                title={`Orders (${orders.length})`}
                description="See orders"
              />
            </div>
            {/* TABLE */}
            <DataTable columns={columns} data={filteredOrders} />
          </TabsContent>
          <TabsContent value="payouts">
            <div className="flex mt-4">
              <Heading
                // title={`Payouts (${payouts.length})`}
                title={`Payouts `}
                description="See payouts"
              />
            </div>
            {/* <DataTable columns={columns} data={payouts}  /> */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
