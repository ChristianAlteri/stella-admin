"use client"

import React, { useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
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
  ChartTooltipContent,
} from "@/components/ui/chart"
import { GrFormPrevious } from "react-icons/gr"
import { TbReload } from "react-icons/tb"
import { Order, Payout } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

interface StoreRevenueVsOrderVsPayoutAreaChartProps {
  orders: Order[]
  payouts: Payout[]
}

export default function StoreRevenueVsOrderVsPayoutAreaChart({
  orders,
  payouts,
}: StoreRevenueVsOrderVsPayoutAreaChartProps) {
  const currentYear = new Date().getFullYear()
  const params = useParams()
  const [selectedYear, setSelectedYear] = useState(currentYear)


  const chartConfig = {
    orders: {
      label: "Orders",
      color: "hsl(var(--primary))",
    },
    totalPayout: {
      label: "Total Payout",
      color: "hsl(210, 100%, 50%)", // Blue
    },
    sellerPayout: {
      label: "Seller Payout",
      color: "hsl(0, 100%, 50%)", // Red
    },
  } satisfies ChartConfig

  // Initialize chartData
  const chartData = months.map((month) => ({
    month,
    orders: 0,
    totalPayout: 0,
    sellerPayout: 0,
  }))

  // Calculate totalRevenue and totalOrders
  let totalRevenue = 0
  let totalOrders = 0

  // Process orders to calculate orders and totalPayout per month
  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt)
    if (orderDate.getFullYear() !== selectedYear) return
    const monthIndex = orderDate.getMonth() // 0-11
    chartData[monthIndex].orders += 1
    chartData[monthIndex].totalPayout += Number(order.totalAmount)
    totalRevenue += Number(order.totalAmount)
    totalOrders += 1
  })

  // Process payouts to calculate sellerPayout per month
  payouts.forEach((payout) => {
    if (payout.sellerId === params.storeId) return // Skip this payout

    const payoutDate = new Date(payout.createdAt)
    if (payoutDate.getFullYear() !== selectedYear) return
    const monthIndex = payoutDate.getMonth()
    chartData[monthIndex].sellerPayout += Number(payout.amount)
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Revenue vs Orders</CardTitle>
        <CardDescription>
          <span className="flex flex-row w-full justify-between ">
            £{totalRevenue.toLocaleString()}: {totalOrders} orders (Avg order: £
            {totalOrders > 0
              ? (
                  totalRevenue / totalOrders
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00"}
            )
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
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<ChartTooltipContent indicator="line" />} />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke={chartConfig.orders.color}
                fill={chartConfig.orders.color}
                fillOpacity={0.3}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="totalPayout"
                stroke={chartConfig.totalPayout.color}
                fill={chartConfig.totalPayout.color}
                fillOpacity={0.3}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="sellerPayout"
                stroke={chartConfig.sellerPayout.color}
                fill={chartConfig.sellerPayout.color}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex flex-row w-full justify-between p-2"></div>
        <div className="leading-none text-muted-foreground">
          Showing total and seller revenue vs orders for the year {selectedYear}
        </div>
      </CardFooter>
    </Card>
  )
}
