import React from "react";
import { Package, BadgeDollarSign } from "lucide-react";

import { Separator } from "@/components/ui/separator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";

import prismadb from "@/lib/prismadb";
import {
  convertDecimalsToNumbers,
  filterLastMonthOrders,
  filterThisMonthOrders,
  totalRevenue,
} from "@/lib/utils";
import TopSellersCard from "./components/Cards/top-sellers-card";
import TopDesignersCard from "./components/Cards/top-designers-card";
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
import RevenueSplits from "./components/RadialCharts/revenue-splits";
import TopCategoriesCard from "./components/Cards/top-categories-card";

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
  const ourRevenue = revenue * 0.3;
  const payoutRevenue = revenue - ourRevenue; // TODO: Fetch all the payouts and calculate the total payouts. Our revenue is actually just totalRevenueForAllOrders - totalPayouts

  const lastMonthOrders = filterLastMonthOrders(plainOrders);
  const currentMonthOrders = filterThisMonthOrders(plainOrders);
  const lastMonthRevenue = totalRevenue(lastMonthOrders);
  const currentMonthRevenue = totalRevenue(currentMonthOrders);

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

        <div className="grid gap-4 grid-cols-2">
          <RevenueSplits
            plainOrders={plainOrders}
            revenue={revenue}
            ourRevenue={ourRevenue}
            payoutRevenue={payoutRevenue}
            lastMonthOrders={lastMonthOrders}
            lastMonthRevenue={lastMonthRevenue}
            currentMonthRevenue={currentMonthRevenue}
            currentMonthOrders={currentMonthOrders}
          />

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
            <CardContent className="mb-4">
              <div className="text-md font-bold text-gray-700 mb-4">
                Average price point: £
                {averagePrice.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <CardContent className="flex flex-col items-start pb-4">
                <Separator className="" />
                <div className="text-md font-bold text-gray-700 mt-4">
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
            </CardContent>
          </Card>

          {/* <Card className="overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-700">
                What goes here?
              </CardTitle>
            </CardHeader>
          </Card> */}
        </div>

        <div className="flex flex-row w-full gap-4 justify-between">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Payouts and Orders</CardTitle>
              <CardDescription>
                Put a live orders and payouts here like in stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>like stripe</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-row w-full gap-4 justify-between">
          <StoreRevenueVsOrderAreaChart orders={plainOrders} />
          <div className="flex flex-col w-1/3 h-full gap-4 justify-between">
            <TopSellersCard sellers={topSellers} />
            <TopDesignersCard products={plainProducts} />
            <TopCategoriesCard products={plainProducts} />
          </div>
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
