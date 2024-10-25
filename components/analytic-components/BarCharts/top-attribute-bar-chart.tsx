"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const TopAttributeBarChart = ({
  attribute,
  topSellingData,
}: {
  topSellingData: { name: string; count: Number }[],
  attribute: string;
}) => {
  if (!topSellingData || topSellingData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{`Top Selling ${attribute}`}</CardTitle>
          <CardDescription>No color data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div>{`No ${attribute} sold yet`}</div>
        </CardContent>
      </Card>
    );
  }

  // Transform topSellingData to chartData, converting count from bigint to number
  const chartData = topSellingData.map(({ name, count }) => ({
    name,
    count: Number(count),
  }));

  const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--primary))",
    },
    label: {
      color: "hsl(var(--muted-foreground))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{`Top Selling ${attribute}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="horizontal"
            margin={{
              bottom: 4,
            }}
            barGap={2}
            barCategoryGap="10%"
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis dataKey="count" type="number" />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="count"
              layout="horizontal"
              fill="var(--color-count)"
              radius={2}
              barSize={20}
            >
              <LabelList
                dataKey="count"
                position="top"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopAttributeBarChart;
