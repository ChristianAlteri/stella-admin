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
    where: {
      storeId: params.storeId,
    },
    // include: { orders: true }, // TODO: Make tab and staff and users display when switch
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
  // Cleaning up the data
  const plainOrders = convertDecimalsToNumbers(orders);
  const plainPayouts = convertDecimalsToNumbers(payouts);
  const latestPayouts = plainPayouts.slice(0, 10);
  const latestOrders = plainOrders.slice(0, 10);
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
  
  const grossRevenue = plainOrders.reduce((acc: any, order: { totalAmount: any; }) => acc + order.totalAmount, 0);
  const netRevenue = storePayoutSum;
  const payoutRevenue = sellerPayoutSum;
  const totalFees = grossRevenue - (storePayoutSum + sellerPayoutSum);

  const todaysOrders = plainOrders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  });
  const todaysPayouts = plainPayouts.filter((payout: any) => {
    const payoutDate = new Date(payout.createdAt);
    const today = new Date();
    return (
      payoutDate.getDate() === today.getDate() &&
      payoutDate.getMonth() === today.getMonth() &&
      payoutDate.getFullYear() === today.getFullYear()
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
    .filter((seller: any) => seller.soldCount && seller.id !== params.storeId) // Filter removes any seller wos sold count = 0 and the store
    .sort((a: any, b: any) => b.soldCount! - a.soldCount!)
    // .slice(0, 5);

  const topSellingColors = await getTopSellingColorCount(params.storeId);
  const topSellingSize = await getTopSellingSizeCount(params.storeId);
  const topSellingMaterial = await getTopSellingMaterialCount(params.storeId);
  const topSellingSubcategory = await getTopSellingSubcategoryCount(
    params.storeId
  );
  const topSellingGender = await getTopSellingGenderCount(params.storeId);
  const topSellingCondition = await getTopSellingConditionCount(params.storeId);
  return (
    <div className="flex-col bg-secondary md:w-full w-1/2">
      <div className="flex-1 space-y-4 p-3">

        <div className="grid gap-4 grid-cols-2">
          <RevenueSplits
            countryCode={store?.countryCode || "GB"}
            grossRevenue={grossRevenue}
            netRevenue={netRevenue}
            payoutRevenue={payoutRevenue}
            totalFees={totalFees}
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
            todaysPayouts={todaysPayouts}
          />

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
            <TopSellersCard countryCode={store?.countryCode || "GB"} sellers={topSellers} />
            <TopDesignersCard countryCode={store?.countryCode || "GB"} products={plainProducts} />
            <TopCategoriesCard countryCode={store?.countryCode || "GB"} products={plainProducts} />
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
        {/* <Heading title="Web site stuff" description="if site connected" />
        <div className="flex flex-row w-full gap-4 justify-between">
          <StoreClicksAndLikesChart products={plainProducts} />
        </div> */}
        <div className="flex flex-row gap-4">
          <div className="flex flex-row w-full gap-4 justify-between">
            <TopUsersCard users={users} sortBy={"totalPurchases"} />
            {/* <TopUsersCard users={users} sortBy={"totalItemsPurchased"} /> */}
            {/* <TopUsersCard users={users} sortBy={"totalTransactionCount"} /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
