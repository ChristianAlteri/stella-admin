"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trophy, ArrowUpDown } from "lucide-react"
import { Payout, Seller as PrismaSeller } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { currencyConvertor } from "@/lib/utils"

interface Seller extends PrismaSeller {
  payouts: { amount: number }[]
}

interface TopSellersCardProps {
  countryCode: string
  sellers: Seller[]
}

const TopSellersCard: React.FC<TopSellersCardProps> = ({ sellers, countryCode }) => {
  const currencySymbol = currencyConvertor(countryCode)
  const router = useRouter()
  const params = useParams()
  const [sortByPayouts, setSortByPayouts] = useState(true)
  const [showBottomSellers, setShowBottomSellers] = useState(false)

  const calculateTotalPayouts = (payouts: { amount: number }[]) => {
    return payouts.reduce((total, payout) => total + payout.amount, 0)
  }

  const sortedSellers = useMemo(() => {
    return [...sellers].sort((a, b) => {
      if (sortByPayouts) {
        return calculateTotalPayouts(b.payouts) - calculateTotalPayouts(a.payouts)
      } else {
        return (b.soldCount ?? 0) - (a.soldCount ?? 0)
      }
    })
  }, [sellers, sortByPayouts])

  const displayedSellers = useMemo(() => {
    return showBottomSellers ? sortedSellers.slice().reverse() : sortedSellers
  }, [sortedSellers, showBottomSellers])

  return (
    <Card className="col-span-3 h-[280px] flex flex-col">
      <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <CardTitle className="text-xl font-bold">
            {showBottomSellers ? "Bottom Sellers" : "Top Sellers"}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBottomSellers(!showBottomSellers)}
            className="ml-2"
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex flex-row items-center justify-between space-x-2">
          <Switch
            id="sort-toggle"
            checked={sortByPayouts}
            onCheckedChange={setSortByPayouts}
          />
          <Label htmlFor="sort-toggle" className="text-sm">
            {sortByPayouts ? "Sold Count" : "Total Payouts"}
          </Label>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 p-4">
            {displayedSellers.map((seller, index) => (
              <div
                className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent transition-colors duration-200 cursor-pointer"
                key={seller.id}
                onClick={() => router.push(`/${params.storeId}/sellers/${seller.id}/details`)}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback>
                  {seller?.storeName?.[0]?.toUpperCase() || "?"}
                  {seller?.storeName?.[1]?.toUpperCase() || "?"}
                </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 ">
                  <p className="text-sm font-medium truncate hover:underline">
                    {seller.storeName || seller.firstName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{seller.instagramHandle || seller.storeName}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto flex-shrink-0">
                  {sortByPayouts
                    ? `${currencySymbol}${calculateTotalPayouts(seller.payouts).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`
                    : `${seller.soldCount} sold`}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default TopSellersCard

// "use client"

// import React, { useState, useMemo } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Switch } from "@/components/ui/switch"
// import { Label } from "@/components/ui/label"
// import { Trophy, User2, ArrowUpDown } from "lucide-react"
// import { Payout, Seller as PrismaSeller } from "@prisma/client"
// import { useParams, useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// interface Seller extends PrismaSeller {
//   payouts: { amount: number }[]
// }

// interface TopSellersCardProps {
//   sellers: Seller[]
// }

// const TopSellersCard: React.FC<TopSellersCardProps> = ({ sellers }) => {
//   const router = useRouter()
//   const params = useParams()
//   const [sortByPayouts, setSortByPayouts] = useState(false)
//   const [showBottomSellers, setShowBottomSellers] = useState(false)

//   const calculateTotalPayouts = (payouts: { amount: number }[]) => {
//     return payouts.reduce((total, payout) => total + payout.amount, 0)
//   }

//   const sortedSellers = useMemo(() => {
//     return [...sellers].sort((a, b) => {
//       if (sortByPayouts) {
//         return calculateTotalPayouts(b.payouts) - calculateTotalPayouts(a.payouts)
//       } else {
//         return (b.soldCount ?? 0) - (a.soldCount ?? 0)
//       }
//     })
//   }, [sellers, sortByPayouts])

//   const displayedSellers = useMemo(() => {
//     const slicedSellers = showBottomSellers
//       ? sortedSellers.slice(-3).reverse()
//       : sortedSellers.slice(0, 3)
//     return slicedSellers
//   }, [sortedSellers, showBottomSellers])

//   return (
//     <Card className="col-span-3">
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <div className="flex items-center space-x-2">
//           <Trophy className="h-5 w-5 text-yellow-400" />
//           <CardTitle className="text-xl font-bold">
//             {showBottomSellers ? "Bottom Sellers" : "Top Sellers"}
//           </CardTitle>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setShowBottomSellers(!showBottomSellers)}
//             className="ml-2"
//           >
//             <ArrowUpDown className="h-3 w-3" />
//           </Button>
//         </div>
//         <div className="flex flex-row items-center justify-between space-x-2">
//           <Switch
//             id="sort-toggle"
//             checked={sortByPayouts}
//             onCheckedChange={setSortByPayouts}
//           />
//           <Label htmlFor="sort-toggle" className="text-sm">
//             {sortByPayouts ? "Sold Count" : "Total Payouts"}
//           </Label>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {displayedSellers.map((seller, index) => (
//             <div
//               className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent transition-colors duration-200 cursor-pointer"
//               key={seller.id}
//               onClick={() => router.push(`/${params.storeId}/sellers/${seller.id}/details`)}
//             >
//               <Avatar className="h-10 w-10">
//                 <AvatarFallback>{seller.firstName?.[0] ?? seller.storeName?.[0] ?? "S"}</AvatarFallback>
//               </Avatar>
//               <div className="flex-1 min-w-0  hover:underline">
//                 <p className="text-sm font-medium truncate">
//                   {seller.storeName || seller.firstName}
//                 </p>
//                 <p className="text-xs text-muted-foreground truncate">
//                   @{seller.instagramHandle || seller.storeName}
//                 </p>
//               </div>
//               <Badge variant="secondary" className="ml-auto">
//                 {sortByPayouts
//                   ? `£${calculateTotalPayouts(seller.payouts).toLocaleString(undefined, {
//                       minimumFractionDigits: 0,
//                       maximumFractionDigits: 0,
//                     })}`
//                   : `${seller.soldCount} sold`}
//               </Badge>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default TopSellersCard
