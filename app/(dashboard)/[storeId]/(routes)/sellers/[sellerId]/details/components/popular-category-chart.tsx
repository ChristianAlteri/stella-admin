"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const PopularCategoryChart = ({ salesByCategory }: { salesByCategory: { [key: string]: { count: number, totalRevenue: number } } }) => {
  
  if (!salesByCategory || Object.keys(salesByCategory).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Category Metrics</CardTitle>
          <CardDescription>No designer data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div>Nothing sold yet</div>
        </CardContent>
      </Card>
    );
  }

  // Transform salesByCategory to chartData
  const chartData = Object.entries(salesByCategory).map(([category, { count, totalRevenue }]) => ({
    category,
    count,
    totalRevenue,
  }))

  const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--secondary-foreground))",
    },
    label: {
      color: "hsl(var(--primary-foreground))",
    },
  } satisfies ChartConfig

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Category metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis 
              dataKey="category"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(category) => {
                const item = chartData.find(data => data.category === category);
                return `${category}\n$${item?.totalRevenue}`;
              }}
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="count"
              layout="vertical"
              fill="var(--color-count)"
              radius={8}
              barSize={100}
            >
              <LabelList
                dataKey="category"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList 
                dataKey="count"
                position="right"
                offset={8}
                className="fill-foreground" 
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Total revenue and sold count by category
        </div>
      </CardFooter>
    </Card>
  )
}

export default PopularCategoryChart
