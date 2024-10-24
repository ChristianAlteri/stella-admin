"use client";

import { useMemo, useEffect, useState } from "react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns, PayoutColumn } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ArrowUpDown, Calendar, Badge } from "lucide-react";
import { currencyConvertor } from "@/lib/utils";

interface PayoutClientProps {
  data: PayoutColumn[];
  countryCode: string;
}

export const PayoutClient: React.FC<PayoutClientProps> = ({ data ,countryCode }) => {
  const [analytics, setAnalytics] = useState({
    totalPayouts: 0,
    payoutCount: 0,
    averagePayout: 0,
    latestPayout: new Date(),
  });
  const currencySymbol = currencyConvertor(countryCode)

  useEffect(() => {
    const totalPayouts = data.reduce((sum, payout) => sum + Number(payout.amount), 0);
    const averagePayout = totalPayouts / data.length;
    const latestPayout = new Date(Math.max(...data.map(payout => new Date(payout.createdAt).getTime())));

    setAnalytics({
      totalPayouts,
      payoutCount: data.length,
      averagePayout,
      latestPayout,
    });
  }, [data]);

  return (
    <>
      <Heading
        title={`Payouts (${data.length})`}
        description="Manage your payouts and view analytics"
      />
      <Separator className="my-4" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol}{analytics.totalPayouts.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Payout</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol}{analytics.averagePayout.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Payout</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{analytics.latestPayout.toLocaleDateString()}</div> */}
            <div className="text-2xl font-bold">{new Date(analytics.latestPayout).toLocaleString("en-GB", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}</div>
          </CardContent>
        </Card>
      </div>
      
      <DataTable columns={columns} data={data} />
      <Separator className="my-4" />
    </>
  );
};


// "use client";

// import { useState } from "react";
// import { Heading } from "@/components/ui/heading";
// import { Separator } from "@/components/ui/separator";
// import { columns, PayoutColumn } from "./columns";
// import { DataTable } from "@/components/ui/data-table";
// import { Button } from "@/components/ui/button";

// interface PayoutClientProps {
//   data: PayoutColumn[];
// }

// export const PayoutClient: React.FC<PayoutClientProps> = ({ data }) => {

//   return (
//     <>
//       <Heading
//         title={`Payouts (${data.length})`}
//         description="Manage your orders"
//       />
//       <Separator />
      
//       <div className="flex justify-end items-center">

//       </div>
      
//       <Separator />
      
//       <DataTable columns={columns} data={data}  />
//       <Separator />
//     </>
//   );
// };
