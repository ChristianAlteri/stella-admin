"use client";

import { Company } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CompanyStockCard from "@/components/analytic-components/Cards/company-stock-card";
import { TbDeviceDesktopAnalytics } from "react-icons/tb";

interface DashboardProps {
  company: Company;
  countryCode: string;
}

export const DashboardClient: React.FC<DashboardProps> = ({
  company,
  countryCode,
}) => {
  return (
    <div className="flex-col bg-secondary md:w-full w-1/2">
      <div className="flex-1 space-y-4 ">
        <div className="grid gap-4 grid-cols-2">
          <CompanyStockCard company={company} countryCode={countryCode} />
          <CompanyStockCard company={company} countryCode={countryCode} />
        </div>
      </div>
    </div>
  );
};
