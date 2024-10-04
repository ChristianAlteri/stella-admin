'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag } from 'lucide-react';
import { TbSwitchVertical } from "react-icons/tb";

export default function MostPopularCategoryCard({ products }: any) {
  const [showTopCategories, setShowTopCategories] = useState(true);

  // Function to calculate top or bottom 5 categories with archived products
  const getCategories = (products: any[], isTop: boolean) => {
    const archivedProducts = products.filter(product => product.isArchived);
    const categoryCounts: { [key: string]: number } = archivedProducts.reduce((acc, product) => {
      const categoryName = product.category.name;
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    // Convert object to array, sort by count
    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

    // Get the top 5 or bottom 5 categories based on the toggle
    return isTop ? sortedCategories.slice(0, 5) : sortedCategories.slice(-5).reverse();
  };

  const categories = getCategories(products, showTopCategories);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 w-full justify-between">
          <Tag className="h-5 w-5 text-green-400" />
          {showTopCategories ? "Top Categories" : "Bottom Categories"}
        <Button variant="outline" onClick={() => setShowTopCategories(!showTopCategories)}>
          <TbSwitchVertical className="h-4 w-4" />
        </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4 mt-4">
          {categories.map(([categoryName, count], index) => (
            <li key={categoryName} className="flex items-center gap-3">
              <span className="font-bold text-lg text-muted-foreground">{index + 1}</span>
              <div className="flex-1">
                <p className="font-semibold">{categoryName}</p>
              </div>
              <Badge variant="secondary">{count} sold</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
