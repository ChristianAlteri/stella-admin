import React from "react";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import prismadb from "@/lib/prismadb";
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

interface TheGrandExchangePageProps {
  params: {
    storeId: string;
  };
}

const TheGrandExchangePage: React.FC<TheGrandExchangePageProps> = async ({ params }) => {
  
  return (
    <div className="flex-col bg-secondary md:w-full w-1/2">
      HELLO GRAND EXCHANGE
    </div>
  );
};

export default TheGrandExchangePage;
