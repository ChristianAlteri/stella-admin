"use client";

import React, { useState, useEffect } from "react";
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
import { DateRange } from "react-day-picker";
import {
  addDays,
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  subYears,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn, currencyConvertor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useParams } from "next/navigation";

const calculateRevenueAndOrdersByDate = (
  orders: any,
  startDate: Date,
  endDate: Date,
  isMonthly: boolean,
  storeId: string | string[]
) => {
  const intervalFunc = isMonthly ? eachMonthOfInterval : eachDayOfInterval;
  const dateFormat = isMonthly ? "MMM yyyy" : "dd-MM-yyyy";

  const allDates = intervalFunc({ start: startDate, end: endDate });
  const revenueByDate: Record<
    string,
    { revenue: number; orders: number; storeRevenue: number }
  > = {};

  allDates.forEach((date) => {
    const dateKey = format(date, dateFormat);
    revenueByDate[dateKey] = { revenue: 0, orders: 0, storeRevenue: 0 };
  });

  orders.forEach((order: any) => {
    const orderDate = new Date(order.createdAt);
    if (orderDate < startDate || orderDate > endDate) return;

    const dateKey = format(orderDate, dateFormat);

    if (!revenueByDate[dateKey]) {
      revenueByDate[dateKey] = { revenue: 0, orders: 0, storeRevenue: 0 };
    }

    const totalAmount =
      typeof order.totalAmount === "object" && "toNumber" in order.totalAmount
        ? order.totalAmount.toNumber()
        : parseFloat(order.totalAmount as any) || 0;

    revenueByDate[dateKey].revenue += totalAmount;
    revenueByDate[dateKey].orders += 1;
  });
  return revenueByDate;
};

function DatePickerWithRange({
  className,
  date,
  setDate,
}: React.HTMLAttributes<HTMLDivElement> & {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[250px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function StoreRevenueVsOrderAreaChart({
  orders,
  countryCode,
}: {
  orders: any;
  countryCode: string;
}) {
  const currencySymbol = currencyConvertor(countryCode);
  const [isMounted, setIsMounted] = useState(false);
  const { storeId } = useParams();

  const currentDate = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfYear(currentDate),
    to: endOfYear(currentDate),
  });
  const [isMonthly, setIsMonthly] = useState(true);
  const [yearOffset, setYearOffset] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [filteredRevenue, setFilteredRevenue] = useState(0);
  const [filteredOrders, setFilteredOrders] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && dateRange?.from && dateRange?.to) {
      const filteredData = calculateRevenueAndOrdersByDate(
        orders,
        dateRange.from,
        dateRange.to,
        isMonthly,
        storeId
      );

      const newChartData = Object.entries(filteredData).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }));
      setChartData(newChartData);
      setFilteredRevenue(
        newChartData.reduce((sum, data) => sum + data.revenue, 0)
      );
      setFilteredOrders(
        newChartData.reduce((sum, data) => sum + data.orders, 0)
      );
    }
  }, [isMounted, dateRange, orders, isMonthly, storeId]);

  const selectDateRange = (offset: number) => {
    const yearToSelect = new Date().getFullYear() + offset;
    setDateRange({
      from: startOfYear(new Date(yearToSelect, 0, 1)),
      to: endOfYear(new Date(yearToSelect, 11, 31)),
    });
  };

  const adjustYear = (increment: number) => {
    setYearOffset((prev) => {
      const newOffset = prev + increment;
      selectDateRange(newOffset);
      return newOffset;
    });
  };

  if (!isMounted) {
    return null;
  }

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

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--accent))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--primary))",
    },
    storeRevenue: {
      label: "Store Revenue",
      color: "hsl(271, 76%, 53%)", // Purple color
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Revenue vs Orders</CardTitle>
        <CardDescription>
          <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4">
            <span className="text-lg font-semibold">
              {currencySymbol}{filteredRevenue.toLocaleString()}: {filteredOrders} orders
              <br />
              <span className="text-sm font-normal">
                Average order: {currencySymbol}
                {filteredOrders > 0
                  ? (filteredRevenue / filteredOrders).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )
                  : "0.00"}
              </span>
            </span>
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-col gap-2">
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                <div className="flex flex-row w-full gap-1 justify-between">
                  <Button onClick={() => adjustYear(-1)} variant="ghost">
                    <IoChevronBack className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => adjustYear(1)} variant="ghost">
                    <IoChevronForward className="w-4 h-4" />
                  </Button>
                  <Select
                    value={isMonthly ? "monthly" : "daily"}
                    onValueChange={(value) => setIsMonthly(value === "monthly")}
                  >
                    <SelectTrigger className="w-[100px] justify-center ">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  isMonthly
                    ? value
                    : format(
                        new Date(value.split("-").reverse().join("-")),
                        "MMM dd"
                      )
                }
              />
              <YAxis yAxisId="left" tickFormatter={(value) => `${currencySymbol}${value}`} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
                fillOpacity={0.6}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stackId="2"
                stroke="var(--color-orders)"
                fill="var(--color-orders)"
                fillOpacity={0.4}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="storeRevenue"
                stackId="3"
                stroke="var(--color-storeRevenue)"
                fill="var(--color-storeRevenue)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing {isMonthly ? "monthly" : "daily"} revenue and orders from{" "}
          {dateRange?.from ? format(dateRange.from, "dd/MM/yyyy") : ""} to{" "}
          {dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : ""}
        </div>
      </CardFooter>
    </Card>
  );
}
// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Area,
//   AreaChart,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import { DateRange } from "react-day-picker";
// import {
//   addDays,
//   format,
//   startOfYear,
//   endOfYear,
//   eachDayOfInterval,
//   eachMonthOfInterval,
//   subYears,
// } from "date-fns";
// import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { IoChevronBack, IoChevronForward } from "react-icons/io5";

// const calculateRevenueAndOrdersByDate = (
//   orders: any,
//   startDate: Date,
//   endDate: Date,
//   isMonthly: boolean
// ) => {
//   const intervalFunc = isMonthly ? eachMonthOfInterval : eachDayOfInterval;
//   const dateFormat = isMonthly ? "MMM yyyy" : "dd-MM-yyyy";

//   const allDates = intervalFunc({ start: startDate, end: endDate });
//   const revenueByDate: Record<string, { revenue: number; orders: number }> = {};

//   allDates.forEach((date) => {
//     const dateKey = format(date, dateFormat);
//     revenueByDate[dateKey] = { revenue: 0, orders: 0 };
//   });

//   orders.forEach((order: any) => {
//     const orderDate = new Date(order.createdAt);
//     if (orderDate < startDate || orderDate > endDate) return;

//     const dateKey = format(orderDate, dateFormat);

//     if (!revenueByDate[dateKey]) {
//       revenueByDate[dateKey] = { revenue: 0, orders: 0 };
//     }

//     const totalAmount =
//       typeof order.totalAmount === "object" && "toNumber" in order.totalAmount
//         ? order.totalAmount.toNumber()
//         : parseFloat(order.totalAmount as any) || 0;

//     revenueByDate[dateKey].revenue += totalAmount;
//     revenueByDate[dateKey].orders += 1;
//   });

//   return revenueByDate;
// };

// function DatePickerWithRange({
//   className,
//   date,
//   setDate,
// }: React.HTMLAttributes<HTMLDivElement> & {
//   date: DateRange | undefined;
//   setDate: (date: DateRange | undefined) => void;
// }) {
//   return (
//     <div className={cn("grid gap-2", className)}>
//       <Popover>
//         <PopoverTrigger asChild>
//           <Button
//             id="date"
//             variant={"outline"}
//             className={cn(
//               "w-[250px] justify-start text-left font-normal",
//               !date && "text-muted-foreground"
//             )}
//           >
//             <CalendarIcon className="mr-2 h-4 w-4" />
//             {date?.from ? (
//               date.to ? (
//                 <>
//                   {format(date.from, "LLL dd, y")} -{" "}
//                   {format(date.to, "LLL dd, y")}
//                 </>
//               ) : (
//                 format(date.from, "LLL dd, y")
//               )
//             ) : (
//               <span>Pick a date</span>
//             )}
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//           <Calendar
//             initialFocus
//             mode="range"
//             defaultMonth={date?.from}
//             selected={date}
//             onSelect={setDate}
//             numberOfMonths={2}
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// }

// export function StoreRevenueVsOrderAreaChart({ orders }: { orders: any }) {
//   const currentDate = new Date();
//   const [dateRange, setDateRange] = useState<DateRange | undefined>({
//     from: startOfYear(currentDate),
//     to: endOfYear(currentDate),
//   });
//   const [isMonthly, setIsMonthly] = useState(true);
//   const [yearOffset, setYearOffset] = useState(0); // New state to track year offset

//   const [chartData, setChartData] = useState<any[]>([]);
//   const [filteredRevenue, setFilteredRevenue] = useState(0);
//   const [filteredOrders, setFilteredOrders] = useState(0);

//   useEffect(() => {
//     if (dateRange?.from && dateRange?.to) {
//       const filteredData = calculateRevenueAndOrdersByDate(
//         orders,
//         dateRange.from,
//         dateRange.to,
//         isMonthly
//       );

//       const newChartData = Object.entries(filteredData).map(([date, data]) => ({
//         date,
//         revenue: data.revenue,
//         orders: data.orders,
//       }));
//       setChartData(newChartData);
//       setFilteredRevenue(
//         newChartData.reduce((sum, data) => sum + data.revenue, 0)
//       );
//       setFilteredOrders(
//         newChartData.reduce((sum, data) => sum + data.orders, 0)
//       );
//     }
//   }, [dateRange, orders, isMonthly]);

//   // Modified selectDateRange to accept an offset
//   const selectDateRange = (offset: number) => {
//     const today = new Date();
//     const yearToSelect = new Date().getFullYear() + offset;

//     setDateRange({
//       from: startOfYear(new Date(yearToSelect, 0, 1)),
//       to: endOfYear(new Date(yearToSelect, 11, 31)),
//     });
//   };

//   // Function to handle year adjustment
//   const adjustYear = (increment: number) => {
//     setYearOffset((prev) => prev + increment);
//     selectDateRange(yearOffset + increment); // Update the date range based on the new offset
//   };

//   if (!orders || orders.length === 0) {
//     return (
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle>Revenue vs Orders</CardTitle>
//           <CardDescription>No revenue data available</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div>No data to display</div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const chartConfig = {
//     revenue: {
//       label: "Revenue",
//       color: "hsl(var(--accent))",
//     },
//     orders: {
//       label: "Orders",
//       color: "hsl(var(--primary))",
//     },
//   } satisfies ChartConfig;

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>Revenue vs Orders</CardTitle>
//         <CardDescription>
//           <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4">
//             <span className="text-lg font-semibold">
//               £{filteredRevenue.toLocaleString()}: {filteredOrders} orders
//               <br />
//               <span className="text-sm font-normal">
//                 Average order: £
//                 {filteredOrders > 0
//                   ? (filteredRevenue / filteredOrders).toLocaleString(
//                       undefined,
//                       {
//                         minimumFractionDigits: 0,
//                         maximumFractionDigits: 0,
//                       }
//                     )
//                   : "0.00"}
//               </span>
//             </span>
//             <div className="flex flex-wrap gap-2">
//               <div className="flex flex-col gap-2">
//                 <DatePickerWithRange date={dateRange} setDate={setDateRange} />
//                 <div className="flex flex-row w-full gap-1 justify-between">
//                   <Button onClick={() => adjustYear(-1)} variant="ghost">
//                     <IoChevronBack className="w-4 h-4" />
//                   </Button>
//                   <Button onClick={() => adjustYear(1)} variant="ghost">
//                     <IoChevronForward className="w-4 h-4" />
//                   </Button>
//                   <Select
//                     value={isMonthly ? "monthly" : "daily"}
//                     onValueChange={(value) => setIsMonthly(value === "monthly")}
//                   >
//                     <SelectTrigger className="w-[100px] justify-center ">
//                       <SelectValue placeholder="Select view" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="monthly">Monthly</SelectItem>
//                       <SelectItem value="daily">Daily</SelectItem>
//                     </SelectContent>
//                   </Select>

//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <ResponsiveContainer width="100%" height={400}>
//             <AreaChart
//               data={chartData}
//               margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis
//                 dataKey="date"
//                 tickFormatter={(value) =>
//                   isMonthly
//                     ? value
//                     : format(
//                         new Date(value.split("-").reverse().join("-")),
//                         "MMM dd"
//                       )
//                 }
//               />
//               <YAxis yAxisId="left" tickFormatter={(value) => `£${value}`} />
//               <YAxis
//                 yAxisId="right"
//                 orientation="right"
//                 tickFormatter={(value) => `${value}`}
//               />
//               <Tooltip content={<ChartTooltipContent indicator="dot" />} />
//               <Area
//                 yAxisId="left"
//                 type="monotone"
//                 dataKey="revenue"
//                 stackId="1"
//                 stroke="var(--color-revenue)"
//                 fill="var(--color-revenue)"
//                 fillOpacity={0.6}
//               />
//               <Area
//                 yAxisId="right"
//                 type="monotone"
//                 dataKey="orders"
//                 stackId="2"
//                 stroke="var(--color-orders)"
//                 fill="var(--color-orders)"
//                 fillOpacity={0.4}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter className="flex-col items-start gap-2 text-sm">
//         <div className="leading-none text-muted-foreground">
//           Showing {isMonthly ? "monthly" : "daily"} revenue and orders from{" "}
//           {dateRange?.from?.toLocaleDateString()} to{" "}
//           {dateRange?.to?.toLocaleDateString()}
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }
