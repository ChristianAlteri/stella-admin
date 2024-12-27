"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Product,
  Designer,
  Seller,
  Category,
  OrderItem,
  Order,
  Payout,
  Company,
} from "@prisma/client";
import { RiErrorWarningLine } from "react-icons/ri";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { currencyConvertor } from "@/lib/utils";
import { TbTag } from "react-icons/tb";
import OldStockTable from "../Tables/old-stock-table";
import axios from "axios";

interface CompanyStockCardProps {
  company: Company;
  countryCode: string;
}

export default function CompanyStockCard({ company, countryCode }: CompanyStockCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const currencySymbol = currencyConvertor(countryCode);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    if (!company) return;

    try {
      setIsLoading(true);
      const fetchedData = await axios.get(
        `/api/company/${company.name}/warehouse`,
        {
          params: {
            companyId: company.id,
          },
        }
      );

      setData(fetchedData.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const products = data.reduce((acc, store) => {
    return [...acc, ...store.products];
  }, []);
  const totalStockWorth = products.reduce(
    (total: number, product: { isArchived: any; ourPrice: any }) => {
      if (!product.isArchived) {
        return total + (Number(product.ourPrice) || 0);
      }
      return total;
    },
    0
  );
  const liveStock = products.filter(
    (product: { isArchived: any }) => !product.isArchived
  ).length;
  const soldStock = products.filter(
    (product: { isArchived: any }) => product.isArchived
  ).length;

  // const todaysGrossRevenue = todaysOrders.reduce((total, order) => {
  //   return total + (Number(order.totalAmount) || 0);
  // }, 0);

  // const todaysNetRevenue = todaysPayouts.reduce((total, payout) => {
  //   if (payout.sellerId === params.storeId) {
  //     return total + (Number(payout.amount) || 0);
  //   } else {
  //     return total;
  //   }
  // }, 0);

  // const todaysSellerPayouts = todaysPayouts.reduce((total, payout) => {
  //   if (payout.sellerId !== params.storeId) {
  //     return total + (Number(payout.amount) || 0);
  //   } else {
  //     return total;
  //   }
  // }, 0);

  // const averageItemsSoldPerOrder = todaysOrders.map((order) => {
  //   const totalAmount = order.totalAmount;
  //   const itemsCount = order.orderItems.length;

  //   const averagePerOrder = Number(totalAmount) / Number(itemsCount);

  //   return averagePerOrder;
  // });

  // const totalAverageForOneUnitToday =
  //   averageItemsSoldPerOrder.reduce((sum, avg) => sum + avg, 0) /
  //   averageItemsSoldPerOrder.length;

  // const averageTransactionValue = todaysGrossRevenue / todaysOrders.length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"></CardHeader>
      <CardContent className="flex-grow grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Company Overview</CardTitle>
              <Package className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Gross Revenue
                  </div>
                  <div className="text-2xl font-bold"></div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Orders
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Avg Transaction
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Avg price of unit
                  </div>
                  {/* {todaysOrders.length > 0 ? (
                    <div className="text-2xl font-bold">
                      {currencySymbol}
                      {totalAverageForOneUnitToday.toFixed(2)}
                    </div>
                  ) : (
                    <div className="flex text-xs text-muted-foreground">
                      No units sold today
                    </div>
                  )} */}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Stock</CardTitle>
              <TbTag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStock}</div>
              <p className="text-xs text-muted-foreground">Available items</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold Stock</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{soldStock}</div>
              <p className="text-xs text-muted-foreground">Items sold</p>
            </CardContent>
          </Card>
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Price
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {averagePrice.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Per item</p>
            </CardContent>
          </Card> */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Stock Worth
              </CardTitle>
              <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {totalStockWorth.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Total value</p>
            </CardContent>
          </Card>
        </div>
        <Separator />
      </CardContent>
    </Card>
  );
}
