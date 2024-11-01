"use client"

import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { columns, OrderColumn } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpDown, Package, Search } from "lucide-react"

interface OrderClientProps {
  data: OrderColumn[]
}

export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {
  const [showDispatched, setShowDispatched] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortAscending, setSortAscending] = useState<boolean>(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return null
  }

  const filteredData = data
    .filter((order) => {
      const matchesDispatch = showDispatched ? order.hasBeenDispatched : !order.hasBeenDispatched
      const matchesSearch =
        order.products.join(" ").toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.sellers.some((seller) => seller.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.stripe_connect_unique_id.some((stripeId) => stripeId.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesDispatch && matchesSearch
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortAscending ? dateA - dateB : dateB - dateA
    })

  if (!isHydrated) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Orders ({filteredData.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showDispatched ? "outline" : "default"}
                onClick={() => setShowDispatched(false)}
                className="flex-1 sm:flex-none"
              >
                <Package className="mr-2 h-4 w-4" />
                Not Dispatched
              </Button>
              <Button
                variant={showDispatched ? "default" : "outline"}
                onClick={() => setShowDispatched(true)}
                className="flex-1 sm:flex-none"
              >
                <Package className="mr-2 h-4 w-4" />
                Dispatched
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setSortAscending((prev) => !prev)}
              className="flex items-center"
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort by Date: {sortAscending ? "Latest" : "Oldest"}
            </Button>
          </div>
        </div>
        <Separator className="my-6" />
        <DataTable columns={columns} data={filteredData} />
      </CardContent>
    </Card>
  )
}
// "use client";

// import { useEffect, useState } from "react";
// import { Heading } from "@/components/ui/heading";
// import { Separator } from "@/components/ui/separator";
// import { columns, OrderColumn } from "./columns";
// import { DataTable } from "@/components/ui/data-table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"; 
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// interface OrderClientProps {
//   data: OrderColumn[];
// }

// export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {
//   const [showDispatched, setShowDispatched] = useState<boolean>(false);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [sortAscending, setSortAscending] = useState<boolean>(true);

//    const [isHydrated, setIsHydrated] = useState(false);

//    useEffect(() => {
//      setIsHydrated(true); 
//    }, []);
//    if (!isHydrated) {
//      return null;
//    }

//   // Filter data based on dispatch status and search term (products and email)
//   const filteredData = data
//   .filter(order => {
//     const matchesDispatch = showDispatched ? order.hasBeenDispatched : !order.hasBeenDispatched;
//     const matchesSearch = order.products.join(" ").toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
//       order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
//       order.sellers.some(seller => seller.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       order.stripe_connect_unique_id.some(stripeId => stripeId.toLowerCase().includes(searchTerm.toLowerCase()));
//       return matchesDispatch && matchesSearch;
//     })
//     .sort((a, b) => {
//       const dateA = new Date(a.createdAt).getTime();
//       const dateB = new Date(b.createdAt).getTime();
//       return sortAscending ? dateA - dateB : dateB - dateA;
//     });


//   if (!isHydrated) {
//     return (
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle>Orders</CardTitle>
//           <CardDescription>Getting order data...</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <p>Loading data...</p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <>
//       <Heading
//         title={`Orders (${filteredData.length})`}
//         description="Manage your orders"
//       />
//       <Separator />
      
//       {/* Toggle between dispatched/not dispatched orders */}
//       <div className="flex flex-row w-full">
//         <div className="flex justify-between items-center w-full gap-4">
//           <Input 
//             placeholder="Search" 
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="mr-2"
//           />
//           <Button onClick={() => setShowDispatched(prev => !prev)}>
//             {showDispatched ? "Not Dispatched Orders" : "Dispatched Orders"}
//           </Button>

//           <Button onClick={() => setSortAscending(prev => !prev)}>
//           Sort by Date: {sortAscending ? "Ascending" : "Descending"}
//         </Button>
//         </div>
//       </div>
      
//       <Separator />
      
//       <DataTable columns={columns} data={filteredData} />
//       <Separator />
//     </>
//   );
// };
