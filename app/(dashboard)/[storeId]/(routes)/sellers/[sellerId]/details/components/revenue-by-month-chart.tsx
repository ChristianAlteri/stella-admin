"use client";

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const RevenueByMonthChart = ({ monthlyRevenue }: { monthlyRevenue: { [key: string]: string } | null }) => {
  
  if (!monthlyRevenue) {
    return (
      <Card className="w-2/3">
        <CardHeader>
          <CardTitle>Revenue by Month</CardTitle>
          <CardDescription>No revenue data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div>No data to display</div>
        </CardContent>
      </Card>
    );
  }

  // Transform monthlyRevenue to chartData
  const chartData = Object.keys(monthlyRevenue).map((key) => {
    const [year, month] = key.split("-");
    const formattedMonth = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "long" });
    return { month: formattedMonth, revenue: parseFloat(monthlyRevenue[key]) };
  });

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--secondary-foreground))",
    },
    label: {
      color: "hsl(var(--primary-foreground))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Revenue by Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{ right: 16 }}
            width={500}
            height={300}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => `£${value}`}
            />
            <Tooltip
              content={<ChartTooltipContent indicator="line" />}
              formatter={(value) => `£${value}`}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing revenue for the last 12 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default RevenueByMonthChart;
