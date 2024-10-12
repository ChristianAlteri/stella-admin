"use client";

import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { BiCoinStack } from "react-icons/bi";

export default function RevenueSplits({
  revenue,
  ourRevenue,
  payoutRevenue,
  lastMonthRevenue,
  currentMonthRevenue,
}: {
  revenue: number;
  ourRevenue: number;
  payoutRevenue: number;
  lastMonthRevenue: number;
  currentMonthRevenue: number;
}) {
  // convert to fixed
  revenue = Number(revenue.toFixed(2));
  ourRevenue = Number(ourRevenue.toFixed(2));
  payoutRevenue = Number(payoutRevenue.toFixed(2));

  // calculate growth percentages
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
      sellerPayouts: payoutRevenue,
      ourRevenue: ourRevenue,
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.ourRevenue / revenue) * 100).toFixed(2);
      return (
        <div className="custom-tooltip bg-background p-2 rounded shadow-md border border-border">
          <p className="label text-sm">{`Our Revenue: ${percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-semibold">Revenue</CardTitle>
        <BiCoinStack className="h-6 w-6 text-green-500" />
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
            <span className="text-red-500">{growthPercentage.toFixed(2)}%</span>
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
              <Tooltip content={<CustomTooltip />} />
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

// import {
//   Label,
//   PolarRadiusAxis,
//   RadialBar,
//   RadialBarChart,
//   Tooltip,
// } from "recharts";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ChartConfig, ChartContainer } from "@/components/ui/chart";
// import { totalRevenue } from "@/lib/utils";
// import { Order } from "@prisma/client";
// import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
// import { BiCoinStack } from "react-icons/bi";

// export default function RevenueSplits({
//   revenue,
//   ourRevenue,
//   payoutRevenue,
//   lastMonthRevenue,

//   currentMonthRevenue,
// }: {
//   revenue: number;
//   ourRevenue: number;
//   payoutRevenue: number;
//   lastMonthRevenue: number;

//   currentMonthRevenue: number;
// }) {
//   // convert to fixed
//   revenue.toFixed(2);
//   ourRevenue.toFixed(2);
//   payoutRevenue.toFixed(2);
//   // calculate growth percentages
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
//       sellerPayouts: payoutRevenue,
//       ourRevenue: ourRevenue,
//     },
//   ];
//   const chartConfig = {
//     sellerPayouts: {
//       label: "Seller Payouts",
//       color: "hsl(var(--primary))",
//     },
//     ourRevenue: {
//       label: "Our Revenue",
//       color: "hsl(var(--accent))",
//     },
//   } satisfies ChartConfig;

//   return (
//     <Card className="w-full">
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-2xl font-semibold">Revenue</CardTitle>
//         <BiCoinStack className="h-6 w-6 text-green-500" />
//       </CardHeader>
//       <div className="ml-6 flex items-center justify-start text-sm">
//         <span className="mr-2 text-muted-foreground">Overall growth:</span>
//         {growthPercentage >= 0 ? (
//           <>
//             <MdTrendingUp className="mr-1 h-4 w-4 text-green-500" />
//             <span className="text-green-500">
//               {growthPercentage.toFixed(2)}%
//             </span>
//           </>
//         ) : (
//           <>
//             <MdTrendingDown className="mr-1 h-4 w-4 text-red-500" />
//             <span className="text-red-500">{growthPercentage.toFixed(2)}%</span>
//           </>
//         )}
//       </div>
//       <CardContent>
//         <div className="flex w-full gap-4 justify-center items-center">
//           <ChartContainer
//             config={chartConfig}
//             className="mx-auto aspect-square w-full max-w-[250px]"
//           >
//             <RadialBarChart
//               data={chartData}
//               endAngle={180}
//               innerRadius={80}
//               outerRadius={130}
//             >
//               <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
//                 <Label
//                   content={({ viewBox }) => {
//                     if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                       return (
//                         <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
//                           <tspan
//                             x={viewBox.cx}
//                             y={(viewBox.cy || 0) - 16}
//                             className="fill-foreground text-2xl font-bold"
//                           >
//                             £
//                             {revenue.toLocaleString(undefined, {
//                               minimumFractionDigits: 0,
//                               maximumFractionDigits: 0,
//                             })}
//                           </tspan>
//                           <tspan
//                             x={viewBox.cx}
//                             y={(viewBox.cy || 0) + 4}
//                             className="fill-muted-foreground"
//                           >
//                             Total Revenue
//                           </tspan>
//                         </text>
//                       );
//                     }
//                   }}
//                 />
//               </PolarRadiusAxis>
//               <RadialBar
//                 dataKey="sellerPayouts"
//                 stackId="a"
//                 cornerRadius={5}
//                 opacity={0.3}
//                 fill="var(--color-sellerPayouts)"
//                 className="stroke-transparent stroke-2"
//               />
//               <RadialBar
//                 dataKey="ourRevenue"
//                 fill="var(--color-ourRevenue)"
//                 stackId="a"
//                 cornerRadius={5}
//                 opacity={0.9}
//                 className="stroke-transparent stroke-2"
//               />
//               <Tooltip
//                 formatter={() => {
//                   const percentage = ((ourRevenue / revenue) * 100).toFixed(2);
//                   return `${percentage}%`; // Show the percentage for ourRevenue
//                 }}
//               />
//             </RadialBarChart>
//           </ChartContainer>
//         </div>
//         <div className="mt-6 grid grid-cols-2 gap-4">
//           <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-2">
//             <div className="text-md font-medium">Store Revenue</div>
//             <div className="mt-1 text-xl font-semibold">
//               £
//               {ourRevenue.toLocaleString(undefined, {
//                 minimumFractionDigits: 0,
//                 maximumFractionDigits: 0,
//               })}
//             </div>
//           </div>
//           <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-2">
//             <div className="text-md font-medium">Seller Payouts</div>
//             <div className="mt-1 text-xl font-semibold">
//               £
//               {payoutRevenue.toLocaleString(undefined, {
//                 minimumFractionDigits: 0,
//                 maximumFractionDigits: 0,
//               })}
//             </div>
//           </div>
//           <div className="flex flex-col justify-center">
//             <div className="mt-2 flex items-center text-sm">
//               {growthForMonthPeriodPercentage >= 0 ? (
//                 <>
//                   <MdTrendingUp className="mr-1 h-4 w-4 text-green-500" />
//                   <span className="text-green-500">
//                     {growthForMonthPeriodPercentage.toFixed(2)}% increase
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <MdTrendingDown className="mr-1 h-4 w-4 text-red-500" />
//                   <span className="text-red-500">
//                     {growthForMonthPeriodPercentage.toFixed(2)}% decrease
//                   </span>
//                 </>
//               )}
//               <span className="ml-1 text-muted-foreground">vs last month</span>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
