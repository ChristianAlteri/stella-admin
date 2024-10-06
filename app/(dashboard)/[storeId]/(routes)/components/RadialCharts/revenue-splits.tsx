"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BadgeDollarSign,
  LucideBadgeCheck,
} from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { totalRevenue } from "@/lib/utils";
import { Order } from "@prisma/client";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";

export default function RevenueSplits({
  plainOrders,
  revenue,
  ourRevenue,
  payoutRevenue,
  lastMonthRevenue,
  lastMonthOrders,
  currentMonthRevenue,
  currentMonthOrders,
}: {
  plainOrders: Order[];
  revenue: number;
  ourRevenue: number;
  payoutRevenue: number;
  lastMonthRevenue: number;
  lastMonthOrders: Order[];
  currentMonthRevenue: number;
  currentMonthOrders: Order[];
}) {
  const growthPercentage =
    lastMonthRevenue === 0
      ? 0
      : ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  const growthForMonthPeriodPercentage =
    lastMonthRevenue === 0
      ? 0
      : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  const chartData = [
    {
      sellerPayouts: payoutRevenue.toFixed(),
      ourRevenue: ourRevenue.toFixed(),
    },
  ];
  const chartConfig = {
    sellerPayouts: {
      label: "Seller Payouts",
      color: "hsl(var(--primary))",
    },
    ourRevenue: {
      label: "Our Revenue",
      color: "hsl(var(--accent))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-semibold">Revenue</CardTitle>
        <BadgeDollarSign className="h-6 w-6 text-green-500" />
      </CardHeader>
        <div className="ml-6 flex items-center justify-start text-sm">
          <span className="mr-2 text-muted-foreground">Overall growth:</span>
          {growthPercentage >= 0 ? (
            <>
              <MdTrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-500">
                {growthPercentage.toFixed(2)}%
              </span>
            </>
          ) : (
            <>
              <MdTrendingDown className="mr-1 h-4 w-4 text-red-500" />
              <span className="text-red-500">
                {growthPercentage.toFixed(2)}%
              </span>
            </>
          )}
        </div>
      <CardContent>
        <div className="flex w-full gap-4 justify-center items-center">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[250px]"
          >
            <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          £
                          {revenue.toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Total Revenue
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="sellerPayouts"
              stackId="a"
              cornerRadius={5}
              opacity={0.3}
              fill="var(--color-sellerPayouts)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="ourRevenue"
              fill="var(--color-ourRevenue)"
              stackId="a"
              cornerRadius={5}
              opacity={0.9}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
          </ChartContainer>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-2">
            <div className="text-md font-medium">Store Revenue</div>
            <div className="mt-1 text-xl font-semibold">
              £
              {ourRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-2">
            <div className="text-md font-medium">Seller Payouts</div>
            <div className="mt-1 text-xl font-semibold">
              £
              {payoutRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="mt-2 flex items-center text-sm">
              {growthForMonthPeriodPercentage >= 0 ? (
                <>
                  <MdTrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">
                    {growthForMonthPeriodPercentage.toFixed(2)}% increase
                  </span>
                </>
              ) : (
                <>
                  <MdTrendingDown className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">
                    {growthForMonthPeriodPercentage.toFixed(2)}% decrease
                  </span>
                </>
              )}
              <span className="ml-1 text-muted-foreground">vs last month</span>
            </div>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
}
// "use client";

// import { useEffect, useState } from "react";
// import { ArrowDownIcon, ArrowUpIcon, BadgeDollarSign, LucideBadgeCheck } from "lucide-react";
// import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import { totalRevenue } from "@/lib/utils";
// import { Order } from "@prisma/client";
// import { MdTrendingUp, MdTrendingDown } from "react-icons/md";

// export default function RevenueSplits({
//   plainOrders,
//   revenue,
//   ourRevenue,
//   payoutRevenue,
//   lastMonthRevenue,
//   lastMonthOrders,
//   currentMonthRevenue,
//   currentMonthOrders,
// }: {
//   plainOrders: Order[];
//   revenue: number;
//   ourRevenue: number;
//   payoutRevenue: number;
//   lastMonthRevenue: number;
//   lastMonthOrders: Order[];
//   currentMonthRevenue: number;
//   currentMonthOrders: Order[];
// }) {
//   console.log("revenue", revenue);
//   console.log("lastMonthRevenue", lastMonthRevenue);
//   console.log("currentMonthRevenue", currentMonthRevenue);

//   // const totalRevenueForAllOrders = totalRevenue(plainOrders);
//   // const lastMonthRevenue = totalRevenue(lastMonthOrders);
//   // const ourRevenue = totalRevenueForAllOrders * 0.3; // TODO: Fetch all the payouts and calculate the total payouts. Our revenue is actually just totalRevenueForAllOrders - totalPayouts
//   // const payoutRevenue = totalRevenueForAllOrders - ourRevenue;

//   const growthPercentage =
//     lastMonthRevenue === 0
//       ? 0
//       : ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100;

//   const growthForMonthPeriodPercentage =
//     lastMonthRevenue === 0
//       ? 0
//       : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

//   const chartData = [
//     {
//       sellerPayouts: payoutRevenue.toFixed(),
//       ourRevenue: ourRevenue.toFixed(),
//     },
//   ];
//   const chartConfig = {
//     sellerPayouts: {
//       label: "SellerPayouts",
//       color: "hsl(var(--primary))",
//     },
//     ourRevenue: {
//       label: "OurRevenue",
//       color: "hsl(var(--accent))",
//     },
//   } satisfies ChartConfig;

//   return (
//     <Card className="w-full">
//       <CardHeader className="flex flex-row items-center text-center justify-between space-y-0 pb-2 ">
//         <CardTitle className=" font-normal text-xl">Revenue</CardTitle>
//         <LucideBadgeCheck className="h-6 w-6 text-green-500" />
//       </CardHeader>

//       <CardContent>
//         <div className="flex flex-col justify-center">

//         </div>

//         <p className="text-xs text-muted-foreground">
//           {growthForMonthPeriodPercentage >= 0 ? (
//             <div className="flex flex-row gap-1">
//               <MdTrendingUp className="h-4 w-4 text-green-500" />
//               <div className="text-green-500">
//                 {growthForMonthPeriodPercentage.toLocaleString()}%
//               </div>
//               <div className="text-gray-400">vs this time last month</div>
//             </div>
//           ) : (
//             <div className="flex flex-row gap-1">
//               <MdTrendingDown className="h-4 w-4 text-red-500" />
//               <div className="text-red-500">
//                 {growthForMonthPeriodPercentage.toLocaleString()}%
//               </div>
//               <div className="text-gray-400">vs this time last month</div>
//             </div>
//           )}
//         </p>
//         {/* </div> */}
//         <div className="h-4" />
//         <ChartContainer
//           config={chartConfig}
//           className="mx-auto aspect-square w-full max-w-[250px]"
//         >
//           <RadialBarChart
//             data={chartData}
//             endAngle={180}
//             innerRadius={80}
//             outerRadius={130}
//           >
//             <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
//               <Label
//                 content={({ viewBox }) => {
//                   if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                     return (
//                       <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
//                         <tspan
//                           x={viewBox.cx}
//                           y={(viewBox.cy || 0) - 16}
//                           className="fill-foreground text-2xl font-bold"
//                         >
//                           £
//                           {revenue.toLocaleString(undefined, {
//                             minimumFractionDigits: 0,
//                             maximumFractionDigits: 0,
//                           })}
//                         </tspan>
//                         <tspan
//                           x={viewBox.cx}
//                           y={(viewBox.cy || 0) + 4}
//                           className="fill-muted-foreground"
//                         >
//                           Total Revenue
//                         </tspan>
//                       </text>
//                     );
//                   }
//                 }}
//               />
//             </PolarRadiusAxis>
//             <RadialBar
//               dataKey="sellerPayouts"
//               stackId="a"
//               cornerRadius={5}
//               opacity={0.3}
//               fill="var(--color-sellerPayouts)"
//               className="stroke-transparent stroke-2"
//             />
//             <RadialBar
//               dataKey="ourRevenue"
//               fill="var(--color-ourRevenue)"
//               stackId="a"
//               cornerRadius={5}
//               opacity={0.9}
//               className="stroke-transparent stroke-2"
//             />
//           </RadialBarChart>
//         </ChartContainer>
//         <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
//           <div className="flex flex-row gap-2 justify-center items-center text-center">
//             <div className="font-bold text-md">Store</div>
//             <span className="text-md">
//               £
//               {ourRevenue.toLocaleString(undefined, {
//                 minimumFractionDigits: 0,
//                 maximumFractionDigits: 0,
//               })}
//             </span>
//           </div>
//           <div className="flex flex-row gap-2 justify-center items-center text-center">
//             <div className="font-bold text-md">Payouts</div>
//             <span className="text-md">
//               £
//               {payoutRevenue.toLocaleString(undefined, {
//                 minimumFractionDigits: 0,
//                 maximumFractionDigits: 0,
//               })}
//             </span>
//           </div>
//           <p className="text-xs text-muted-foreground">
//             <div className="flex flex-row gap-1">
//               {growthPercentage >= 0 ? (
//                 <div className="flex flex-row gap-1">
//                   <MdTrendingUp className="h-4 w-4 text-green-500" />
//                   <div className="text-green-500">
//                     {growthPercentage.toLocaleString()}%
//                   </div>
//                   <div className="text-gray-400">overall growth</div>
//                 </div>
//               ) : (
//                 <div className="flex flex-row gap-1">
//                   <MdTrendingDown className="h-4 w-4 text-red-500" />
//                   <div className="text-red-500">
//                     {growthPercentage.toLocaleString()}%
//                   </div>
//                   <div className="text-gray-400">overall growth</div>
//                 </div>
//               )}
//             </div>
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
