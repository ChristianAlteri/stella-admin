"use client";

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Decimal } from "decimal.js";
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
import { Order } from "@prisma/client";

const getMonthYear = (date: Date | string): string => {
    // Check if the input is a valid date
    const parsedDate = new Date(date);
    
    if (isNaN(parsedDate.getTime())) {
      // Return a fallback value if date is invalid
      return 'Invalid Date';
    }
  
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    
    return `${year}-${month}`;
  };
const calculateRevenueByMonth = (orders: any): Record<string, number> => {
    const revenueByMonth: Record<string, number> = {};
  
    orders.forEach((order: any) => {
      const monthYear = getMonthYear(order.createdAt);
      
      // Skip if the date is invalid
      if (monthYear === 'Invalid Date') {
        return;
      }
  
      order.orderItems.forEach((item: any) => {
        let productAmount;
  
        // Check if productAmount is an instance of Prisma's Decimal or another type
        if (typeof item.productAmount === "object" && "toNumber" in item.productAmount) {
          productAmount = item.productAmount.toNumber();
        } else {
          productAmount = parseFloat(item.productAmount as any) || 0;
        }
  
        if (!revenueByMonth[monthYear]) {
          revenueByMonth[monthYear] = 0;
        }
  
        revenueByMonth[monthYear] += productAmount;
      });
    });
  
    console.log("revenueByMonth:", revenueByMonth);
    return revenueByMonth;
  };
  


const StoreRevenueByMonthChart = ({ orders }: { orders: Order[] }) => {
  if (!orders || orders.length === 0) {
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

  // Calculate revenue by month using the provided orders
  const monthlyRevenue = calculateRevenueByMonth(orders);

  // Transform monthlyRevenue to chartData
  const chartData = Object.keys(monthlyRevenue)
  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())  // Sort by date ascending
  .map((key) => {
    const [year, month] = key.split("-");
    const formattedMonth = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "long" });
    return { month: formattedMonth, revenue: parseFloat(monthlyRevenue[key].toFixed(2)) };
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

export default StoreRevenueByMonthChart;
