"use client";

import React, { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
  ChartTooltipContent,
} from "@/components/ui/chart";
import { GrFormPrevious } from "react-icons/gr";
import { TbReload } from "react-icons/tb";
import { totalRevenue } from "@/lib/utils";

const getMonthYear = (date: Date | string): string => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "Invalid Date";
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const calculateRevenueAndOrdersByMonth = (
  orders: any,
  selectedYear: number
) => {
  const revenueByMonth: Record<string, { revenue: number; orders: number }> =
    {};

  orders.forEach((order: any) => {
    const orderDate = new Date(order.createdAt);
    const monthYear = getMonthYear(order.createdAt);

    if (
      orderDate.getFullYear() !== selectedYear ||
      monthYear === "Invalid Date"
    )
      return;

    if (!revenueByMonth[monthYear]) {
      revenueByMonth[monthYear] = { revenue: 0, orders: 0 };
    }

    order.orderItems.forEach((item: any) => {
      const productAmount =
        typeof item.productAmount === "object" &&
        "toNumber" in item.productAmount
          ? item.productAmount.toNumber()
          : parseFloat(item.productAmount as any) || 0;
      revenueByMonth[monthYear].revenue += productAmount;
    });

    revenueByMonth[monthYear].orders += 1;
  });

  return revenueByMonth;
};

export function StoreRevenueVsOrderAreaChart({ orders }: { orders: any }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const revenue = totalRevenue(orders);
  const ourRevenue = revenue * 0.3;

  if (!orders || orders.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Revenue vs Orders</CardTitle>
          <CardDescription>No revenue data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div>No data to display</div>
        </CardContent>
      </Card>
    );
  }

  const monthlyData = calculateRevenueAndOrdersByMonth(orders, selectedYear);

  const chartData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(selectedYear, i, 1);
    const monthKey = getMonthYear(date);
    const formattedMonth = date.toLocaleString("default", { month: "short" });

    return {
      month: formattedMonth,
      revenue: monthlyData[monthKey]?.revenue * 0.3 || 0,
      orders: monthlyData[monthKey]?.orders || 0,
    };
  });

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--destructive))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Revenue vs Orders</CardTitle>
        <CardDescription>
          <span className="flex flex-row w-full justify-between ">
            £{revenue.toLocaleString()} vs {orders.length} orders (Avg: £
            {orders.length > 0 ? (revenue / orders.length).toLocaleString() : "0.00"})
            <span className="flex flex-row text-black items-center text-center">
              <span
                className="hover:cursor-pointer hover:underline "
                onClick={() => setSelectedYear(selectedYear - 1)}
              >
                <GrFormPrevious size={24} />
              </span>
              <span
                className="hover:cursor-pointer hover:underline"
                onClick={() => setSelectedYear(currentYear)}
              >
                <TbReload size={20} />
              </span>
            </span>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" tickFormatter={(value) => `£${value}`} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<ChartTooltipContent indicator="line" />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
                fillOpacity={0.3}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stackId="2"
                stroke="var(--color-orders)"
                fill="var(--color-orders)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex flex-row w-full justify-between p-2"></div>
        <div className="leading-none text-muted-foreground">
          Showing revenue and orders for the year {selectedYear}
        </div>
      </CardFooter>
    </Card>
  );
}
