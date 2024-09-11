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
import TopSellersChart from "./components/top-sellers-card";
import { calculateTopSellersByMonth, convertDecimalsToNumbers } from "@/lib/utils";
import TopSellersCard from "./components/top-sellers-card";
import MostPopularDesignerCard from "./components/top-designers-card";
import MostPopularCategoryCard from "./components/top-categories-card";
import StoreRevenueByMonthChart from "./components/store-revenue-by-month";

interface DashboardPageProps {
  params: {
    storeId: string;
  };
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  const totalRevenue = await getTotalRevenue(params.storeId);
  const graphRevenue = await getGraphRevenue(params.storeId);
  const salesCount = await getSalesCount(params.storeId);
  const stockCount = await getStockCount(params.storeId);
  const outstandingOrders = await getoutStandingOrders(params.storeId);
  // const topSellers = await getGraphTopSeller(params.storeId);

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      seller: { include: { payouts: true } },
      designer: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const sellers = await prismadb.seller.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      payouts: {
        // where: { sellerId: params.sellerId },
        orderBy: { createdAt: "desc" },
      },
      products: {
        include: {
          images: true,
          designer: true,
          seller: true,
          category: true,
          size: true,
          color: true,
        },
      },
      orderedItems: { include: { order: true } },
    },

    orderBy: { createdAt: "desc" },
  });

  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
    include: { orderItems: true },
    orderBy: { createdAt: "desc" },
  });


  // console.log("SELLERS: ", sellers);
  // console.log("PRODUCTS: ", products);
  // console.log("ORDERS: ", orders);

  const plainOrders = convertDecimalsToNumbers(orders);
  const plainProducts = convertDecimalsToNumbers(products);
  const plainSellers = convertDecimalsToNumbers(sellers);
  // console.log("plainOrders", plainOrders);

  const topSellers = plainSellers
    .filter((seller: any) => seller.soldCount)
    .sort((a: any, b: any) => b.soldCount! - a.soldCount!)
    .slice(0, 3);

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
              <div className="text-2xl font-bold">£ {totalRevenue}</div>
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
              <CardTitle className="text-sm font-medium">
                Products In Stock
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockCount}</div>
            </CardContent>
          </Card>
        </div>
        <Separator />

        <div className="flex flex-row">
          <div className="flex flex-row w-2/3 gap-2 justify-between">
            <TopSellersCard sellers={topSellers} />
            <MostPopularDesignerCard products={plainProducts} />
            <MostPopularCategoryCard products={plainProducts} />
          </div>
          <div className="flex flex-row w-2/3 gap-2 justify-between">
            <div className="flex w-full items-center justify-center text-center h-full">What can go here?</div>
          </div>
        </div>
        <Separator />
        <div className="flex flex-row w-1/2 gap-2 justify-between">
          <StoreRevenueByMonthChart orders={plainOrders} />
          {/* <StoreRevenueByMonthChart orders={orders} /> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

{/* TODO: Move outstanding orders to the orders page */}