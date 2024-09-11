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


const PopularDesignerChart = ({ popularDesigners }: { popularDesigners: { [key: string]: { count: number, totalRevenue: number } } }) => {
  
  if (!popularDesigners || Object.keys(popularDesigners).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Designer Metrics</CardTitle>
          <CardDescription>No designer data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div>Nothing sold yet</div>
        </CardContent>
      </Card>
    );
  }
  
  // Transform popularDesigners to chartData
  const chartData = Object.entries(popularDesigners).map(([designer, { count, totalRevenue }]) => ({
    designer,
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
        <CardTitle>Designer metrics</CardTitle>
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
              dataKey="designer"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(designer) => {
                const item = chartData.find(data => data.designer === designer);
                return `${designer}\n$${item?.totalRevenue}`;
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
                dataKey="designer"
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
          Total revenue and sold count by designers
        </div>
      </CardFooter>
    </Card>
  )
}

export default PopularDesignerChart
