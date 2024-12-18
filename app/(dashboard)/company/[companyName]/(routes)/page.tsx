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
import { auth } from "@clerk/nextjs/server";
import { useRouter } from "next/navigation";
import CompanyStoreTiles from "../../../../../components/main-components/company-store-tiles";

interface CompanyHomePageProps {
  params: {
    companyName: string;
  };
}

const CompanyHomePage: React.FC<CompanyHomePageProps> = async ({ params }) => {
  
  const { userId } = auth();
  console.log("HELLO COMPANY HOMEPAGE params", params);
  const stores = userId ? await prismadb.store.findMany({
    where: {
      userId: userId,
    },
    include: {
      address: true,
    },
  }) : [];

  // TODO: This should be company
  const store = await prismadb.store.findFirst({
    where: {
      name: params.companyName,
    },
  });
  // console.log("store", store);
  return (
    <div className="flex flex-col bg-secondary md:w-full w-1/2 p-4">
      {store && <CompanyStoreTiles stores={stores} singleStore={store}/>}
    </div>
  );
};

export default CompanyHomePage;
