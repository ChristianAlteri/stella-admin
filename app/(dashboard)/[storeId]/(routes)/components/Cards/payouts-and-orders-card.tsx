"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Order, Payout, Seller } from "@prisma/client";
import { format } from "date-fns";

type PayoutWithSeller = Payout & {
  seller: Seller;
};

type PayoutsAndOrdersCardProps = {
  latestPayouts: PayoutWithSeller[];
  latestOrders: Order[];
};

export default function PayoutsAndOrdersCard({
  latestPayouts,
  latestOrders,
}: PayoutsAndOrdersCardProps) {
  const [activeTab, setActiveTab] = useState<"payouts" | "orders">("payouts");
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const params = useParams();

  return (
    <Card
      className={`w-full ${
        isExpanded ? "h-[250px]" : "h-[100px]"
      } flex flex-col transition-height duration-300 overflow-hidden`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex flex-row gap-2 items-center">
            Payouts and Orders
            {isExpanded ? (
              <Button
                variant="link"
                className=" p-2"
                onClick={() =>
                  router.push(
                    activeTab === "payouts"
                      ? `/${params.storeId}/payouts`
                      : `/${params.storeId}/orders`
                  )
                }
              >
                View all {activeTab}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}
          </CardTitle>
          <div className="flex items-center">
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "payouts" | "orders")
              }
            >
              <TabsList>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {/* <CardDescription>
        
        </CardDescription> */}
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs uppercase bg-gray-50 sticky top-0 rounded-md">
              <tr className="rounded-md">
                {activeTab === "payouts" ? (
                  <>
                    <th className="px-4 py-2">Transfer Group ID</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Seller</th>
                    <th className="px-4 py-2">Date</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-2">Order ID</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === "payouts"
                ? latestPayouts.map((payout) => (
                    <tr
                      key={payout.id}
                      className="hover:bg-gray-100 rounded-md hover:cursor-pointer"
                    >
                      <td className="px-4 py-2">{payout.transferGroupId}</td>
                      <td className="px-4 py-2">
                        ${payout.amount?.toString()}
                      </td>
                      <td
                        className="px-4 py-2 hover:underline hover:cursor-pointer"
                        onClick={() => {
                          if (
                            payout.seller?.instagramHandle ||
                            payout.seller?.firstName
                          ) {
                            router.push(
                              `/${params.storeId}/sellers/${payout.seller.id}/details`
                            );
                          }
                        }}
                      >
                        {payout.seller?.instagramHandle
                          ? payout.seller.instagramHandle
                          : payout.seller?.firstName
                          ? payout.seller.firstName
                          : "Our Store"}
                      </td>
                      <td className="px-4 py-2">
                        {format(new Date(payout.createdAt), "dd/MM/yyyy") || ""}
                      </td>
                    </tr>
                  ))
                : latestOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-100 rounded-md hover:cursor-pointer"
                    >
                      <td className="px-4 py-2">{order.id}</td>
                      <td className="px-4 py-2">
                        ${order.totalAmount.toString()}
                      </td>
                      <td className="px-4 py-2">
                        {format(new Date(order.createdAt), "dd/MM/yyyy") || ""}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// "use client";

// import { useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { ArrowRight } from "lucide-react";
// import { Order, Payout, Seller } from "@prisma/client";

// type PayoutWithSeller = Payout & {
//   seller: Seller;
// };

// type PayoutsAndOrdersCardProps = {
//   latestPayouts: PayoutWithSeller[];
//   latestOrders: Order[];
// };

// export default function PayoutsAndOrdersCard({
//   latestPayouts,
//   latestOrders,
// }: PayoutsAndOrdersCardProps) {
//   const [activeTab, setActiveTab] = useState<"payouts" | "orders">("payouts");
//   const router = useRouter();
//   const params = useParams();

//   return (
//     <Card className="w-full h-[250px] flex flex-col">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <CardTitle className="flex flex-row gap-2 justify-center text-center items-center">
//             Payouts and Orders
//             <Button
//               variant="link"
//               className="p-2"
//               onClick={() =>
//                 router.push(
//                   activeTab === "payouts"
//                     ? `/${params.storeId}/payouts`
//                     : `/${params.storeId}/orders`
//                 )
//               }
//             >
//               View all {activeTab}
//               <ArrowRight className="ml-2 h-4 w-4" />
//             </Button>
//           </CardTitle>
//           <Tabs
//             value={activeTab}
//             onValueChange={(value) =>
//               setActiveTab(value as "payouts" | "orders")
//             }
//           >
//             <TabsList>
//               <TabsTrigger value="payouts">Payouts</TabsTrigger>
//               <TabsTrigger value="orders">Orders</TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>
//         <CardDescription></CardDescription>
//       </CardHeader>
//       <CardContent className="flex-grow overflow-hidden">
//         <div className="h-full overflow-auto">
//           <table className="w-full text-sm text-left text-muted-foreground">
//             <thead className="text-xs uppercase bg-gray-50 sticky top-0 rounded-md">
//               <tr className="rounded-md">
//                 {activeTab === "payouts" ? (
//                   <>
//                     <th className="px-4 py-2">Transfer Group ID</th>
//                     <th className="px-4 py-2">Amount</th>
//                     <th className="px-4 py-2">Seller</th>
//                     <th className="px-4 py-2">Date</th>
//                   </>
//                 ) : (
//                   <>
//                     <th className="px-4 py-2">Order ID</th>
//                     <th className="px-4 py-2">Amount</th>
//                     <th className="px-4 py-2">Date</th>
//                   </>
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {activeTab === "payouts"
//                 ? latestPayouts.map((payout) => (
//                     <tr
//                       key={payout.id}
//                       className="hover:bg-gray-100 rounded-md hover:cursor-pointer"
//                     >
//                       <td className="px-4 py-2">{payout.transferGroupId}</td>
//                       <td className="px-4 py-2">
//                         ${payout.amount?.toString()}
//                       </td>
//                       <td
//                         className="px-4 py-2 hover:underline hover:cursor-pointer"
//                         onClick={() => {
//                           if (
//                             payout.seller?.instagramHandle ||
//                             payout.seller?.firstName
//                           ) {
//                             router.push(
//                               `/${params.storeId}/sellers/${payout.seller.id}/details`
//                             );
//                           }
//                         }}
//                       >
//                         {payout.seller?.instagramHandle
//                           ? payout.seller.instagramHandle
//                           : payout.seller?.firstName
//                           ? payout.seller.firstName
//                           : "Our Store"}
//                       </td>
//                       <td className="px-4 py-2">
//                         {new Date(payout.createdAt).toLocaleDateString()}
//                       </td>
//                     </tr>
//                   ))
//                 : latestOrders.map((order) => (
//                     <tr
//                       key={order.id}
//                       className="hover:bg-gray-100 rounded-md hover:cursor-pointer"
//                     >
//                       <td className="px-4 py-2">{order.id}</td>
//                       <td className="px-4 py-2">
//                         ${order.totalAmount.toString()}
//                       </td>
//                       <td className="px-4 py-2">
//                         {new Date(order.createdAt).toLocaleDateString()}
//                       </td>
//                     </tr>
//                   ))}
//             </tbody>
//           </table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
