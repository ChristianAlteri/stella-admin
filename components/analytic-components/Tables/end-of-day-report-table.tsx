"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Modal from "@/components/ui/modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { currencyConvertor } from "@/lib/utils";
import { Package } from "lucide-react";
import { useState } from "react";

interface EndOfDayTableProps {
  countryCode: string;
  orderData: any;
  isModalOpen: boolean; // receive parent's state
  onClose: () => void; // receive parent's close handler
  todaysGrossRevenue: number;
  todaysNetRevenue: number;
  todaysSellerPayouts: number;
  cashOrderRevenue: number;
}

const EndOfDayTable: React.FC<EndOfDayTableProps> = ({
  countryCode,
  orderData,
  isModalOpen,
  onClose,
  todaysGrossRevenue,
  todaysNetRevenue,
  todaysSellerPayouts,
  cashOrderRevenue,
}) => {
  const currencySymbol = currencyConvertor(countryCode);
  const [isLoading, setIsLoading] = useState(false);
  console.log("orderData", orderData[0]);

  return (
    <Modal
      title="End of Day Reporting"
      description="This is the end of day reporting for your store"
      isOpen={isModalOpen}
      onClose={onClose}
      className="max-w-6xl  w-full mx-auto"
    >
      <div className=" space-y-4 ">
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
            <CardTitle className="w-full">
              <div className="flex items-center gap-2">Sales Overview</div>
            </CardTitle>
            <div className="flex flex-row items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-5">
              {isLoading ? (
                <>
                  <Skeleton className="h-[75px] w-full" />
                  <Skeleton className="h-[75px] w-full" />
                  <Skeleton className="h-[75px] w-full" />
                  <Skeleton className="h-[75px] w-full" />
                  <Skeleton className="h-[25px] w-1/2" />
                  <Skeleton className="h-[25px] w-1/2" />
                  <Skeleton className="h-[25px] w-1/2" />
                  <Skeleton className="h-[25px] w-1/2" />
                </>
              ) : (
                <>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Gross Revenue
                    </div>
                    <div className="text-2xl font-bold">
                      {todaysGrossRevenue > 0 ? (
                        <p>
                          {`${currencySymbol}${todaysGrossRevenue.toFixed(2)}`}
                        </p>
                      ) : (
                        <span className="flex text-xs text-muted-foreground">
                          No sales today
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Payouts
                    </div>
                    {orderData.length > 0 ? (
                      <div className="text-2xl font-bold">
                        <p className="text-red-500">
                          {`${currencySymbol}${todaysSellerPayouts.toFixed(2)}`}
                        </p>
                      </div>
                    ) : (
                      <div className="flex text-xs text-muted-foreground">
                        No payouts today
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Fees
                    </div>
                    {orderData.length > 0 ? (
                      <div className="text-2xl font-bold">
                        <p className="text-red-500">
                          {`${currencySymbol}${(
                            todaysGrossRevenue -
                            (todaysNetRevenue + todaysSellerPayouts)
                          ).toFixed(2)}`}
                        </p>
                      </div>
                    ) : (
                      <div className="flex text-xs text-muted-foreground">
                        No Fees today
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Net Revenue
                    </div>
                    {orderData.length > 0 ? (
                      <div className="text-2xl font-bold">
                        <p className="text-green-500">
                          {`${currencySymbol}${todaysNetRevenue.toFixed(2)}`}
                        </p>
                      </div>
                    ) : (
                      <div className="flex text-xs text-muted-foreground">
                        No Net Revenue today
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Cash
                    </div>
                    {orderData.length > 0 ? (
                      <div className="text-2xl font-bold">
                        <p className="text-black">
                          {`${currencySymbol}${cashOrderRevenue.toFixed(2)}`}
                        </p>
                      </div>
                    ) : (
                      <div className="flex text-xs text-muted-foreground">
                        No Cash taken today
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              <div className="flex items-center gap-2">
                End of Day Report for {orderData.length} Sales
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <ScrollArea>
              <div className="overflow-x-auto w-full h-[200px]">
                <table className="w-full text-sm text-left text-muted-foreground">
                  <thead className="text-xs uppercase bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-2">Order ID</th>
                      <th className="px-2 py-2">Total Amount</th>
                      <th className="px-2 py-2">Sale Type</th>
                      <th className="px-2 py-2">Order Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.length > 0 ? (
                      orderData.map((order: any) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          <td className="px-2 py-2 hover:underline truncate">
                            {order.id}
                          </td>
                          <td className="px-2 py-2">
                            {currencySymbol}
                            {order.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-2 py-2">
                            {order.inStoreSale
                              ? order.isCash
                                ? "In-store: Cash"
                                : "In-store: Card"
                              : "Online: Card"}
                          </td>
                          <td className="px-2 py-2">
                            <ul>
                              {Object.entries(
                                order.orderItems.reduce(
                                  (
                                    grouped: Record<string, string[]>,
                                    item: any
                                  ) => {
                                    const storeName =
                                      item.product.seller.storeName;
                                    if (!grouped[storeName]) {
                                      grouped[storeName] = [];
                                    }
                                    grouped[storeName].push(item.product.name);
                                    return grouped;
                                  },
                                  {}
                                )
                              ).map(([storeName, products]) => (
                                <li key={storeName}>
                                  <strong className="underline">
                                    {storeName}
                                  </strong>
                                  <ul className="">
                                    {(products as string[]).map(
                                      (productName, index) => (
                                        <li key={index}>- {productName}</li>
                                      )
                                    )}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-2 py-2 text-center">
                          No report found for the selected date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
};

export default EndOfDayTable;
