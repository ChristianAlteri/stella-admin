'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from 'lucide-react';

export default function MostPopularDesignerCard({ products }: any) {
  // Function to calculate top 5 designers with archived products
  const getTopDesigners = (products: any[]) => {
    const archivedProducts = products.filter(product => product.isArchived);
    const designerCounts: { [key: string]: number } = archivedProducts.reduce((acc, product) => {
      const designerName = product.designer.name;
      acc[designerName] = (acc[designerName] || 0) + 1;
      return acc;
    }, {});

    // Convert object to array, sort by count, and take top 5
    const topDesigners = Object.entries(designerCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by the count (descending)
      .slice(0, 5); // Get the top 5

    return topDesigners;
  };

  const topDesigners = getTopDesigners(products);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-blue-400" />
          Top Designers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {topDesigners.map(([designerName, count], index) => (
            <li key={designerName} className="flex items-center gap-3">
              <span className="font-bold text-lg text-muted-foreground">{index + 1}</span>
              <div className="flex-1">
                <p className="font-semibold">{designerName}</p>
              </div>
              <Badge variant="secondary">{count.toString()} sold</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
