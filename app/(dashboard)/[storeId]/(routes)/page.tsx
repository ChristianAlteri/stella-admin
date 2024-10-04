import React from "react";
import { Package, BadgeDollarSign } from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";

import prismadb from "@/lib/prismadb";
import { convertDecimalsToNumbers, totalRevenue } from "@/lib/utils";
import TopSellersCard from "./components/Cards/top-sellers-card";
import MostPopularDesignerCard from "./components/Cards/top-designers-card";
import MostPopularCategoryCard from "./components/Cards/top-categories-card";
import TopUsersCard from "./components/Cards/top-users-card";
import { StoreRevenueVsOrderAreaChart } from "./components/AreaCharts/store-revenue-vs-orders-area-chart";
import StoreClicksAndLikesChart from "./components/LineCharts/clicks-and-likes-by-month-line-chart";
import TopColorBarChart from "./components/BarCharts/top-attribute-bar-chart";
import {
  getTopSellingSizeCount,
  getTopSellingColorCount,
  getTopSellingMaterialCount,
  getTopSellingGenderCount,
  getTopSellingSubcategoryCount,
  getTopSellingConditionCount,
} from "@/actions/TopSelling/get-top-selling-attribute";

interface DashboardPageProps {
  params: {
    storeId: string;
  };
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
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

  const users = await prismadb.user.findMany({
    include: { orders: true },
    orderBy: { name: "desc" },
  });

  // Cleaning up the data
  const plainOrders = convertDecimalsToNumbers(orders);
  const plainProducts = convertDecimalsToNumbers(products);
  const plainSellers = convertDecimalsToNumbers(sellers);
  const calculateAveragePrice = (products: { ourPrice: number }[]): number =>
    products.length
      ? +(
          products.reduce((acc, { ourPrice }) => acc + ourPrice, 0) /
          products.length
        ).toFixed(2)
      : 0;
  const averagePrice = calculateAveragePrice(plainProducts);

  const revenue = totalRevenue(plainOrders);
  const ouRevenue = revenue * 0.3;
  const payouts = revenue - ouRevenue;

  const soldStock = products.filter(
    (product: any) => product.isArchived === true
  ).length;
  const liveStock = products.filter(
    (product: any) => product.isArchived === false
  ).length;

  const topSellers = plainSellers
    .filter((seller: any) => seller.soldCount)
    .sort((a: any, b: any) => b.soldCount! - a.soldCount!)
    .slice(0, 5);

  const topSellingColors = await getTopSellingColorCount(params.storeId);
  const topSellingSize = await getTopSellingSizeCount(params.storeId);
  const topSellingMaterial = await getTopSellingMaterialCount(params.storeId);
  const topSellingSubcategory = await getTopSellingSubcategoryCount(
    params.storeId
  );
  const topSellingCondition = await getTopSellingGenderCount(params.storeId);
  const topSellingGender = await getTopSellingConditionCount(params.storeId);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Overview of your store" />
        <Separator />
        <div className="flex flex-row w-full gap-4 justify-between">
          <StoreRevenueVsOrderAreaChart orders={plainOrders} />
          <div className="flex flex-col w-1/3 h-full gap-4 justify-between">
            <TopSellersCard sellers={topSellers} />
            <MostPopularDesignerCard products={plainProducts} />
            <MostPopularCategoryCard products={plainProducts} />
          </div>
        </div>

        <div className="grid gap-4 grid-cols-3">
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-2xl font-semibold text-black">
                Revenue
              </CardTitle>
              <BadgeDollarSign className="h-6 w-6 text-pink-600" />
            </CardHeader>
            <div className="flex flex-col items-starts gap-2 text-gray-700 pl-6">
              <span className="">Total Sales £{revenue.toLocaleString()}</span>
              <span className="">
                Our Revenue £{ouRevenue.toLocaleString()}
              </span>
              <span className="">
                Total Payouts £{payouts.toLocaleString()}
              </span>
            </div>
          </Card>

          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-2xl font-semibold text-black">
                Stock
              </CardTitle>
              <Package className="h-6 w-6 text-amber-600" />
            </CardHeader>
            <CardContent className="">
              <div className="text-md font-bold text-green-600">
                Live: {liveStock}
              </div>
              <div className="text-md font-bold text-red-600">
                Sold: {soldStock}
              </div>
            </CardContent>
            <CardContent className="">
              <div className="text-md font-bold text-gray-700">
                Average price point: £{averagePrice.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-700">
                Old Stock
              </CardTitle>
              <Package className="h-6 w-6 text-amber-600" />
            </CardHeader>
            <CardContent className="flex flex-col items-start">
              <div className="text-md font-bold text-gray-700">
                Live Stock Older Than 3 Months:
              </div>
              <div>
                {products
                  .filter(
                    (product: any) =>
                      new Date(product.createdAt) <
                        new Date(
                          new Date().setMonth(new Date().getMonth() - 3)
                        ) && !product.isArchived
                  )
                  .map((product: any) => (
                    <div key={product.id} className="text-gray-700">
                      {product.name} - Created on:{" "}
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-row w-full gap-4 justify-between">
          <TopColorBarChart
            topSellingData={topSellingColors}
            attribute="Color"
          />
          <TopColorBarChart topSellingData={topSellingSize} attribute="Size" />
          <TopColorBarChart
            topSellingData={topSellingMaterial}
            attribute="Material"
          />
        </div>
        <div className="flex flex-row w-full gap-4 justify-between">
          <TopColorBarChart
            topSellingData={topSellingSubcategory}
            attribute="SubCategory"
          />
          <TopColorBarChart
            topSellingData={topSellingCondition}
            attribute="Condition"
          />
          <TopColorBarChart
            topSellingData={topSellingGender}
            attribute="Gender"
          />
        </div>

        <Separator />
        <Heading title="Web site stuff" description="if site connected" />
        <div className="flex flex-row w-full gap-4 justify-between">
          <StoreClicksAndLikesChart products={plainProducts} />
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex flex-row w-full gap-4 justify-between">
            <TopUsersCard users={users} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
