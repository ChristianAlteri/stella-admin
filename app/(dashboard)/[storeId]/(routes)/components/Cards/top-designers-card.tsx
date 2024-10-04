'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from 'lucide-react';
import { TbSwitchVertical } from "react-icons/tb";
import { Button } from '@/components/ui/button';

export default function MostPopularDesignerCard({ products }: any) {
  const [showTopDesigners, setShowTopDesigners] = useState(true);

  // Function to calculate top or bottom 5 designers with archived products
  const getDesigners = (products: any[], isTop: boolean) => {
    const archivedProducts = products.filter(product => product.isArchived);
    const designerCounts: { [key: string]: number } = archivedProducts.reduce((acc, product) => {
      const designerName = product.designer.name;
      acc[designerName] = (acc[designerName] || 0) + 1;
      return acc;
    }, {});

    // Convert object to array, sort by count
    const sortedDesigners = Object.entries(designerCounts).sort((a, b) => b[1] - a[1]);

    // Get the top 5 or bottom 5 designers based on the toggle
    return isTop ? sortedDesigners.slice(0, 5) : sortedDesigners.slice(-5).reverse();
  };

  const designers = getDesigners(products, showTopDesigners);
  

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 w-full justify-between">
          <Award className="h-5 w-5 text-blue-400" />
          {showTopDesigners ? "Top Designers" : "Bottom Designers"}
          <Button variant="outline" onClick={() => setShowTopDesigners(!showTopDesigners)}>
            <TbSwitchVertical className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {designers.map(([designerName, count], index) => (
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
