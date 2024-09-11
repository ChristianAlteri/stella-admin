import React from "react";
import { CreditCard, DollarSign, Package } from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";

import axios from "axios";
import OrderStatus from "@/components/ui/order-status";
import { RevenueGraph } from "@/components/ui/revenue-graph";
import { TopSellerGraph } from "@/components/ui/top-seller-graph";

import { getSalesCount } from "@/actions/get-sales-count";
import { getTotalRevenue } from "@/actions/get-total-revenue";
import { getGraphRevenue } from "@/actions/get-graph-revenue";
import { getStockCount } from "@/actions/get-stock-count";
import { getoutStandingOrders } from "@/actions/get-outstanding-orders";
import { getGraphTopSeller } from "@/actions/get-graph-top-sellers";
import prismadb from "@/lib/prismadb";


interface DashboardPageProps {
  params: {
    storeId: string;
  };
};

const DashboardPage: React.FC<DashboardPageProps> = async ({ 
  params
}) => {
  const totalRevenue = await getTotalRevenue(params.storeId);
  const graphRevenue = await getGraphRevenue(params.storeId);
  const salesCount = await getSalesCount(params.storeId);
  const stockCount = await getStockCount(params.storeId);
  const outstandingOrders = await getoutStandingOrders(params.storeId);
  const topSellers = await getGraphTopSeller(params.storeId);

  const products = await prismadb.product.findMany({
    where: {
      id: params.storeId,
    },
  });

  console.log("PRODUCTS: ", products);

  // console.log(topSellers.map((seller) =>  seller.sellers));

    


  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Overview of your store" />
        <Separator />
        <div className="grid gap-4 grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              £
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                £ {totalRevenue}
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{salesCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products In Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockCount}</div>
            </CardContent>
          </Card>
                </div>
        <Separator />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Outstanding orders</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
            {/* Order status */}
                {outstandingOrders.map((order) => (
                    <OrderStatus key={order.id} order={order} />
                ))}
            </CardContent>
          </Card>
          <div className="">
            {/* Graph revenue by month */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Revenue by Month</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <RevenueGraph data={graphRevenue} />
            </CardContent>
          </Card> 
          <br />
          <br />
              {/* Graph top seller by month */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Top Sellers</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <TopSellerGraph data={topSellers} />
            </CardContent>
          </Card>
          </div>
      </div>
    </div>
  );
};

export default DashboardPage;