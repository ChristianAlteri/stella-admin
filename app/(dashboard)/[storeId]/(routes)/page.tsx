import React from "react";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import prismadb from "@/lib/prismadb";
import OldStockTable from "@/components/analytic-components/Tables/old-stock-table";
import {
  convertDecimalsToNumbers,
  convertSpecificDecimals,
  filterLastMonthOrders,
  filterThisMonthOrders,
  getPayoutSums,
  totalRevenue,
} from "@/lib/utils";
import TopSellersCard from "@/components/analytic-components/Cards/top-sellers-card";
import TopDesignersCard from "@/components/analytic-components/Cards/top-designers-card";
import TopUsersCard from "@/components/analytic-components/Cards/top-users-card";
import { StoreRevenueVsOrderAreaChart } from "@/components/analytic-components/AreaCharts/store-revenue-vs-orders-area-chart";
import StoreClicksAndLikesChart from "@/components/analytic-components/LineCharts/clicks-and-likes-by-month-line-chart";
import TopColorBarChart from "@/components/analytic-components/BarCharts/top-attribute-bar-chart";
import {
  getTopSellingSizeCount,
  getTopSellingColorCount,
  getTopSellingMaterialCount,
  getTopSellingGenderCount,
  getTopSellingSubcategoryCount,
  getTopSellingConditionCount,
} from "@/actions/TopSelling/get-top-selling-attribute";
import RevenueSplits from "@/components/analytic-components/RadialCharts/revenue-splits";
import TopCategoriesCard from "@/components/analytic-components/Cards/top-categories-card";
import StockCard from "@/components/analytic-components/Cards/stock-card";
import PayoutsAndOrdersCard from "@/components/analytic-components/Cards/payouts-and-orders-card";
import { CardHeader } from "@/components/ui/card";

interface DashboardPageProps {
  params: {
    storeId: string;
  };
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  const [
    products,
    store,
    sellers,
    orders,
    users,
    payouts,
    topSellingColors,
    topSellingSize,
    topSellingMaterial,
    topSellingSubcategory,
    topSellingGender,
    topSellingCondition,
  ] = await Promise.all([
    prismadb.product.findMany({
      where: { storeId: params.storeId },
      include: {
        seller: { include: { payouts: true } },
        designer: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prismadb.store.findUnique({ where: { id: params.storeId } }),
    prismadb.seller.findMany({
      where: { storeId: params.storeId },
      include: {
        payouts: { orderBy: { createdAt: "desc" } },
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
    }),
    prismadb.order.findMany({
      where: { storeId: params.storeId },
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    }),
    prismadb.user.findMany({
      where: { storeId: params.storeId },
      orderBy: { name: "desc" },
    }),
    prismadb.payout.findMany({
      where: { storeId: params.storeId },
      orderBy: { createdAt: "desc" },
      include: { seller: true },
    }),
    getTopSellingColorCount(params.storeId),
    getTopSellingSizeCount(params.storeId),
    getTopSellingMaterialCount(params.storeId),
    getTopSellingSubcategoryCount(params.storeId),
    getTopSellingGenderCount(params.storeId),
    getTopSellingConditionCount(params.storeId),
  ]);

  // const products = await prismadb.product.findMany({
  //   where: {
  //     storeId: params.storeId,
  //   },
  //   include: {
  //     seller: { include: { payouts: true } },
  //     designer: true,
  //     category: true,
  //   },
  //   orderBy: { createdAt: "desc" },
  // });
  // const store = await prismadb.store.findUnique({
  //   where: {
  //     id: params.storeId,
  //   }
  // })

  // const sellers = await prismadb.seller.findMany({
  //   where: {
  //     storeId: params.storeId,
  //   },
  //   include: {
  //     payouts: {
  //       // where: { sellerId: params.sellerId },
  //       orderBy: { createdAt: "desc" },
  //     },
  //     products: {
  //       include: {
  //         images: true,
  //         designer: true,
  //         seller: true,
  //         category: true,
  //         size: true,
  //         color: true,
  //       },
  //     },
  //     orderedItems: { include: { order: true } },
  //   },

  //   orderBy: { createdAt: "desc" },
  // });

  // const orders = await prismadb.order.findMany({
  //   where: {
  //     storeId: params.storeId,
  //   },
  //   include: { orderItems: true },
  //   orderBy: { createdAt: "desc" },
  // });

  // const users = await prismadb.user.findMany({
  //   where: {
  //     storeId: params.storeId,
  //   },
  //   // include: { orders: true }, // TODO: Make tab and staff and users display when switch
  //   orderBy: { name: "desc" },
  // });

  // const payouts = await prismadb.payout.findMany({
  //   where: {
  //     storeId: params.storeId,
  //   },
  //   orderBy: { createdAt: "desc" },
  //   include: { seller: true },
  // });
  const { storePayoutSum, sellerPayoutSum } = getPayoutSums(
    payouts,
    params.storeId
  );
  // Cleaning up the data
  const plainOrders = convertDecimalsToNumbers(orders);

  const lastMonthOrders = filterLastMonthOrders(plainOrders);
  const currentMonthOrders = filterThisMonthOrders(plainOrders);
  const lastMonthRevenue = totalRevenue(lastMonthOrders);
  const currentMonthRevenue = totalRevenue(currentMonthOrders);

  const grossRevenue = plainOrders.reduce(
    (acc: any, order: { totalAmount: any }) => acc + order.totalAmount,
    0
  );
  const netRevenue = storePayoutSum;
  const payoutRevenue = sellerPayoutSum;
  const totalFees = grossRevenue - (storePayoutSum + sellerPayoutSum);

  // const topSellingColors = await getTopSellingColorCount(params.storeId);
  // const topSellingSize = await getTopSellingSizeCount(params.storeId);
  // const topSellingMaterial = await getTopSellingMaterialCount(params.storeId);
  // const topSellingSubcategory = await getTopSellingSubcategoryCount(
  //   params.storeId
  // );
  // const topSellingGender = await getTopSellingGenderCount(params.storeId);
  // const topSellingCondition = await getTopSellingConditionCount(params.storeId);
  return (
    <div className="flex-col bg-secondary md:w-full w-1/2 p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <RevenueSplits
          countryCode={store?.countryCode || "GB"}
          grossRevenue={grossRevenue}
          netRevenue={netRevenue}
          payoutRevenue={payoutRevenue}
          totalFees={totalFees}
          lastMonthRevenue={lastMonthRevenue}
          currentMonthRevenue={currentMonthRevenue}
        />

        <StockCard countryCode={store?.countryCode || "GB"} />

        {/* <Card className="overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-700">
                
              </CardTitle>
            </CardHeader>
          </Card> */}
      </div>

      <div className="flex flex-row w-full gap-4 justify-between">
        {/* <StoreRevenueVsOrderAreaChart countryCode={store?.countryCode || "GB"} orders={plainOrders} /> */}
        <div className="flex flex-row w-full h-full gap-4 justify-between">
          <TopSellersCard countryCode={store?.countryCode || "GB"} />
          <OldStockTable countryCode={store?.countryCode || "GB"} />
          {/* <TopDesignersCard countryCode={store?.countryCode || "GB"} /> */}
          {/* <TopCategoriesCard countryCode={store?.countryCode || "GB"} /> */}
        </div>
      </div>

      {/* <div className="flex flex-row w-full gap-4 justify-between">
          <PayoutsAndOrdersCard
            countryCode={store?.countryCode || "GB"}
            latestPayouts={latestPayouts}
            latestOrders={latestOrders}
          />
        </div> */}

      <div className="flex flex-row w-full gap-4 justify-between">
        
        {/* <TopColorBarChart
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
          /> */}
      </div>

      <Separator />
      <div className="mt-6"></div>
      {/* <Heading title="Web site stuff" description="if site connected" />
        <div className="flex flex-row w-full gap-4 justify-between">
          <StoreClicksAndLikesChart products={plainProducts} />
        </div> */}
      <div className="flex flex-row gap-4">
        <div className="flex flex-row w-full gap-4 justify-between">
          {/* <TopUsersCard users={users} sortBy={"totalPurchases"} /> */}
          {/* <TopUsersCard users={users} sortBy={"totalItemsPurchased"} /> */}
          {/* <TopUsersCard users={users} sortBy={"totalTransactionCount"} /> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
