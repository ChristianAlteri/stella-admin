'use client'

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Award, ArrowUpDown, Tag } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Product {
  id: string
  ourPrice: number
  isArchived: boolean
  category: {
    id: string
    name: string
  }
}

interface TopCategoriesCardProps {
  products: Product[]
}

interface CategoriesStats {
  id: string
  name: string
  totalValue: number
  count: number
}

const TopCategoriesCard: React.FC<TopCategoriesCardProps> = ({ products }) => {
  const router = useRouter()
  const params = useParams()
  const [sortByValue, setSortByValue] = useState(true)
  const [showBottomCategories, setShowBottomCategories] = useState(false)

  const CategoriesStats = useMemo(() => {
    const stats: { [key: string]: CategoriesStats } = {}

    products.forEach((product) => {
      if (product.isArchived) {
        const { id, name } = product.category
        if (!stats[id]) {
          stats[id] = { id, name, totalValue: 0, count: 0 }
        }
        stats[id].totalValue += product.ourPrice
        stats[id].count += 1
      }
    })

    return Object.values(stats)
  }, [products])

  const sortedCategories = useMemo(() => {
    return [...CategoriesStats].sort((a, b) => {
      if (sortByValue) {
        return b.totalValue - a.totalValue
      } else {
        return b.count - a.count
      }
    })
  }, [CategoriesStats, sortByValue])

  const displayedCategories = useMemo(() => {
    return showBottomCategories ? sortedCategories.slice().reverse() : sortedCategories
  }, [sortedCategories, showBottomCategories])

  return (
    <Card className="col-span-3 h-[280px] flex flex-col">
      <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Tag className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-xl font-bold">
            {showBottomCategories ? "Bottom Categories" : "Top Categories"}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBottomCategories(!showBottomCategories)}
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
            {displayedCategories.slice().map((category, index) => (
              <div
                className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent transition-colors duration-200 cursor-pointer"
                key={category.id}
                // onClick={() => router.push(`/${params.storeId}/Categories/${category.id}/details`)}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback>{category.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {category.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {category.count} categories sold
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto flex-shrink-0">
                  {sortByValue
                    ? `£${category.totalValue.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`
                    : `${category.count} sold`}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default TopCategoriesCard

// 'use client'

// import React, { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Tag } from 'lucide-react';
// import { TbSwitchVertical } from "react-icons/tb";

// export default function TopCategoriesCard({ products }: any) {
//   const [showTopCategories, setShowTopCategories] = useState(true);

//   // Function to calculate top or bottom 5 categories with archived products
//   const getCategories = (products: any[], isTop: boolean) => {
//     const archivedProducts = products.filter(product => product.isArchived);
//     const categoryCounts: { [key: string]: number } = archivedProducts.reduce((acc, product) => {
//       const categoryName = product.category.name;
//       acc[categoryName] = (acc[categoryName] || 0) + 1;
//       return acc;
//     }, {});

//     // Convert object to array, sort by count
//     const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

//     // Get the top 5 or bottom 5 categories based on the toggle
//     return isTop ? sortedCategories.slice(0, 5) : sortedCategories.slice(-5).reverse();
//   };

//   const categories = getCategories(products, showTopCategories);

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2 w-full justify-between">
//           <Tag className="h-5 w-5 text-green-400" />
//           {showTopCategories ? "Top Categories" : "Bottom Categories"}
//         <Button variant="outline" onClick={() => setShowTopCategories(!showTopCategories)}>
//           <TbSwitchVertical className="h-4 w-4" />
//         </Button>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <ul className="space-y-4 mt-4">
//           {categories.map(([categoryName, count], index) => (
//             <li key={categoryName} className="flex items-center gap-3">
//               <span className="font-bold text-lg text-muted-foreground">{index + 1}</span>
//               <div className="flex-1">
//                 <p className="font-semibold">{categoryName}</p>
//               </div>
//               <Badge variant="secondary">{count} sold</Badge>
//             </li>
//           ))}
//         </ul>
//       </CardContent>
//     </Card>
//   );
// }
