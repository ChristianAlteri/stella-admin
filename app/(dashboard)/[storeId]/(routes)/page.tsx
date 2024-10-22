import React from "react";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import prismadb from "@/lib/prismadb";
import {
  convertDecimalsToNumbers,
  filterLastMonthOrders,
  filterThisMonthOrders,
  getPayoutSums,
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
import StockCard from "./components/Cards/stock-card";
import PayoutsAndOrdersCard from "./components/Cards/payouts-and-orders-card";
import { CardHeader } from "@/components/ui/card";

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
  const store = await prismadb.store.findUnique({
    where: {
      id: params.storeId,
    }
  })

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

  const payouts = await prismadb.payout.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: { createdAt: "desc" },
    include: { seller: true },
  });
  const { storePayoutSum, sellerPayoutSum } = getPayoutSums(
    payouts,
    params.storeId
  );

  const revenue = storePayoutSum + sellerPayoutSum;
  const ourRevenue = storePayoutSum;
  const payoutRevenue = sellerPayoutSum;

  // Cleaning up the data
  const plainOrders = convertDecimalsToNumbers(orders);
  const plainPayouts = convertDecimalsToNumbers(payouts);
  const latestPayouts = plainPayouts.slice(0, 5);
  const latestOrders = plainOrders.slice(0, 5);
  const plainProducts = convertDecimalsToNumbers(products);
  const plainSellers = convertDecimalsToNumbers(sellers);
  const calculateAveragePrice = (products: { ourPrice: number }[]): number =>
    products.length
      ? +(
          products.reduce((acc, { ourPrice }) => acc + ourPrice, 0) /
          products.length
        ).toFixed(2)
      : 0;

  const lastMonthOrders = filterLastMonthOrders(plainOrders);
  const currentMonthOrders = filterThisMonthOrders(plainOrders);
  const lastMonthRevenue = totalRevenue(lastMonthOrders);
  const currentMonthRevenue = totalRevenue(currentMonthOrders);

  const todaysOrders = plainOrders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  });

  const soldStock = products.filter(
    (product: any) => product.isArchived === true
  ).length;
  const liveStock = products.filter(
    (product: any) => product.isArchived === false
  ).length;

  const liveStockData = plainProducts.filter(
    (product: any) => product.isArchived === false
  );

  const averagePrice = calculateAveragePrice(liveStockData);

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
    <div className="flex-col bg-secondary md:w-full w-1/2">
      <div className="flex-1 space-y-4 p-3">
        {/* <Heading title="Dashboard" description="Overview of your store" /> */}
        {/* <CardHeader className="text-2xl text-black font-bold flex items-start w-full text-start flex-col">
          Dashboard
          <span className="text-xs text-black">
          Overview of your store
          </span>
        </CardHeader> */}
        <Separator />


        <div className="grid gap-4 grid-cols-2">
          <RevenueSplits
            countryCode={store?.countryCode || "GB"}
            revenue={revenue}
            ourRevenue={ourRevenue}
            payoutRevenue={payoutRevenue}
            lastMonthRevenue={lastMonthRevenue}
            currentMonthRevenue={currentMonthRevenue}
          />

          <StockCard
            countryCode={store?.countryCode || "GB"}
            liveStock={liveStock}
            soldStock={soldStock}
            averagePrice={averagePrice}
            products={plainProducts}
            todaysOrders={todaysOrders}
          />

          {/* <Card className="overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-700">
                
              </CardTitle>
            </CardHeader>
          </Card> */}
        </div>

        <div className="flex flex-row w-full gap-4 justify-between">
          <PayoutsAndOrdersCard
            countryCode={store?.countryCode || "GB"}
            latestPayouts={latestPayouts}
            latestOrders={latestOrders}
          />
        </div>

        <div className="flex flex-row w-full gap-4 justify-between">
          <StoreRevenueVsOrderAreaChart countryCode={store?.countryCode || "GB"} orders={plainOrders} />
          <div className="flex flex-col w-1/3 h-full gap-4 justify-between">
            <TopSellersCard countryCode={store?.countryCode || "GB"} sellers={topSellers} />
            <TopDesignersCard countryCode={store?.countryCode || "GB"} products={plainProducts} />
            <TopCategoriesCard countryCode={store?.countryCode || "GB"} products={plainProducts} />
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
        <div className="mt-6"></div>
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
