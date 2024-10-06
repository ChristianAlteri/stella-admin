'use client'

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Award, ArrowUpDown } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Product {
  id: string
  ourPrice: number
  isArchived: boolean
  designer: {
    id: string
    name: string
  }
}

interface TopDesignersCardProps {
  products: Product[]
}

interface DesignerStats {
  id: string
  name: string
  totalValue: number
  count: number
}

const TopDesignersCard: React.FC<TopDesignersCardProps> = ({ products }) => {
  const router = useRouter()
  const params = useParams()
  const [sortByValue, setSortByValue] = useState(true)
  const [showBottomDesigners, setShowBottomDesigners] = useState(false)

  const designerStats = useMemo(() => {
    const stats: { [key: string]: DesignerStats } = {}

    products.forEach((product) => {
      if (product.isArchived) {
        const { id, name } = product.designer
        if (!stats[id]) {
          stats[id] = { id, name, totalValue: 0, count: 0 }
        }
        stats[id].totalValue += product.ourPrice
        stats[id].count += 1
      }
    })

    return Object.values(stats)
  }, [products])

  const sortedDesigners = useMemo(() => {
    return [...designerStats].sort((a, b) => {
      if (sortByValue) {
        return b.totalValue - a.totalValue
      } else {
        return b.count - a.count
      }
    })
  }, [designerStats, sortByValue])

  const displayedDesigners = useMemo(() => {
    return showBottomDesigners ? sortedDesigners.slice().reverse() : sortedDesigners
  }, [sortedDesigners, showBottomDesigners])

  return (
    <Card className="col-span-3 h-[280px] flex flex-col">
      <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-xl font-bold">
            {showBottomDesigners ? "Bottom Designers" : "Top Designers"}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBottomDesigners(!showBottomDesigners)}
            className="ml-2"
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex flex-row items-center justify-between space-x-2">
          <Switch
            id="sort-toggle"
            checked={sortByValue}
            onCheckedChange={setSortByValue}
          />
          <Label htmlFor="sort-toggle" className="text-sm">
            {sortByValue ? "Products Sold" : "Total Value"}
          </Label>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 p-4">
            {displayedDesigners.slice().map((designer, index) => (
              <div
                className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent transition-colors duration-200 cursor-pointer"
                key={designer.id}
                // onClick={() => router.push(`/${params.storeId}/designers/${designer.id}/details`)}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback>{designer.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {designer.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {designer.count} products sold
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto flex-shrink-0">
                  {sortByValue
                    ? `£${designer.totalValue.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`
                    : `${designer.count} sold`}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default TopDesignersCard

// 'use client'

// import React, { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Award } from 'lucide-react';
// import { TbSwitchVertical } from "react-icons/tb";
// import { Button } from '@/components/ui/button';

// export default function MostPopularDesignerCard({ products }: any) {
//   const [showTopDesigners, setShowTopDesigners] = useState(true);

//   // Function to calculate top or bottom 5 designers with archived products
//   const getDesigners = (products: any[], isTop: boolean) => {
//     const archivedProducts = products.filter(product => product.isArchived);
//     const designerCounts: { [key: string]: number } = archivedProducts.reduce((acc, product) => {
//       const designerName = product.designer.name;
//       acc[designerName] = (acc[designerName] || 0) + 1;
//       return acc;
//     }, {});

//     // Convert object to array, sort by count
//     const sortedDesigners = Object.entries(designerCounts).sort((a, b) => b[1] - a[1]);

//     // Get the top 5 or bottom 5 designers based on the toggle
//     return isTop ? sortedDesigners.slice(0, 5) : sortedDesigners.slice(-5).reverse();
//   };

//   const designers = getDesigners(products, showTopDesigners);
  

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2 w-full justify-between">
//           <Award className="h-5 w-5 text-blue-400" />
//           {showTopDesigners ? "Top Designers" : "Bottom Designers"}
//           <Button variant="outline" onClick={() => setShowTopDesigners(!showTopDesigners)}>
//             <TbSwitchVertical className="h-4 w-4" />
//           </Button>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <ul className="space-y-4">
//           {designers.map(([designerName, count], index) => (
//             <li key={designerName} className="flex items-center gap-3">
//               <span className="font-bold text-lg text-muted-foreground">{index + 1}</span>
//               <div className="flex-1">
//                 <p className="font-semibold">{designerName}</p>
//               </div>
//               <Badge variant="secondary">{count.toString()} sold</Badge>
//             </li>
//           ))}
//         </ul>
//       </CardContent>
//     </Card>
//   );
// }
