'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from 'lucide-react';

export default function MostPopularCategoryCard({ products }: any) {
  // Function to calculate top 5 categories with archived products
  const getTopCategories = (products: any[]) => {
    const archivedProducts = products.filter(product => product.isArchived);
    const categoryCounts: { [key: string]: number } = archivedProducts.reduce((acc, product) => {
      const categoryName = product.category.name;
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    // Convert object to array, sort by count, and take top 5
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
      .slice(0, 5); // Get the top 5 categories

    return topCategories;
  };

  const topCategories = getTopCategories(products);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-green-400" />
          Top Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {topCategories.map(([categoryName, count], index) => (
            <li key={categoryName} className="flex items-center gap-3">
              <span className="font-bold text-lg text-muted-foreground">{index + 1}</span>
              <div className="flex-1">
                <p className="font-semibold">{categoryName}</p>
              </div>
              <Badge variant="secondary">{count} archived</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
