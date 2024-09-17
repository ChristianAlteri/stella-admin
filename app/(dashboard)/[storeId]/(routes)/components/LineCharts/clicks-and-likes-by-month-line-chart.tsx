"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";

// Helper function to get month and year from a date
const getMonthYear = (date: Date | string): string => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return "Invalid Date";
  }
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

// Calculate total clicks or likes by month
const calculateMetricByMonth = (products: any[], metric: "clicks" | "likes"): Record<string, number> => {
  const metricByMonth: Record<string, number> = {};

  products.forEach((product) => {
    const monthYear = getMonthYear(product.createdAt);

    if (monthYear === "Invalid Date") return;

    const productMetric = product[metric] || 0;

    if (!metricByMonth[monthYear]) {
      metricByMonth[monthYear] = 0;
    }

    metricByMonth[monthYear] += productMetric;
  });

  return metricByMonth;
};

const StoreClicksAndLikesChart = ({ products }: { products: any[] }) => {
  const [currentMetric, setCurrentMetric] = useState<"clicks" | "likes">("clicks");

  if (!products || products.length === 0) {
    return (
      <Card className="w-2/3">
        <CardHeader>
          <CardTitle>{currentMetric === "clicks" ? "Clicks by Month" : "Likes by Month"}</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div>No data to display</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate the metric (clicks or likes) by month
  const monthlyMetric = calculateMetricByMonth(products, currentMetric);

  // Transform monthlyMetric into chartData
  const chartData = Object.keys(monthlyMetric)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((key) => {
      const [year, month] = key.split("-");
      const formattedMonth = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", {
        month: "long",
      });
      return { month: formattedMonth, [currentMetric]: monthlyMetric[key] };
    });

  const chartConfig = {
    clicks: {
      label: "Clicks",
      color: "hsl(var(--secondary-foreground))",
    },
    likes: {
      label: "Likes",
      color: "hsl(var(--secondary-foreground))",
    },
    label: {
      color: "hsl(var(--primary-foreground))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{currentMetric === "clicks" ? "Clicks by Month" : "Likes by Month"}</CardTitle>
        <div className="hover:underline hover:cursor-pointer text-right justify-end text-sm" onClick={() => setCurrentMetric(currentMetric === "clicks" ? "likes" : "clicks")}>
          Switch to {currentMetric === "clicks" ? "Likes" : "Clicks"}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData} margin={{ right: 16 }} width={500} height={500}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${value} ${currentMetric}`} />
            <Tooltip
              content={<ChartTooltipContent indicator="line" />}
              formatter={(value) => `${value} ${currentMetric}`}
            />
            <Line
              type="monotone"
              dataKey={currentMetric}
              stroke="var(--color-clicks)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing {currentMetric} for the last 12 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default StoreClicksAndLikesChart;
