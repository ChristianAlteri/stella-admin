'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from 'lucide-react';
import { useParams, useRouter } from "next/navigation";
import { TbSwitchVertical } from "react-icons/tb";
import { Button } from '@/components/ui/button';

// Helper function to calculate total sales from payouts
function calculateTotalSales(payouts: any[]) {
  return payouts.reduce((total, payout) => total + payout.amount, 0); // Assuming each payout object has an 'amount' field
}

export default function TopSellersCard({ sellers }: any) {
  const [showTopSellers, setShowTopSellers] = useState(true);
  const router = useRouter();
  const params = useParams();

  // Function to get either the top or bottom 5 sellers
  const getSellers = (sellers: any[], isTop: boolean) => {
    const sortedSellers = sellers.sort((a, b) => b.soldCount - a.soldCount);
    return isTop ? sortedSellers.slice(0, 5) : sortedSellers.slice(-5).reverse();
  };

  const displayedSellers = getSellers(sellers, showTopSellers);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 w-full justify-between">
          <Trophy className="h-5 w-5 text-yellow-400" />
          {showTopSellers ? "Top Sellers" : "Bottom Sellers"}
          <Button variant="outline" onClick={() => setShowTopSellers(!showTopSellers)} className="flex items-center">
            <TbSwitchVertical className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {displayedSellers.map((seller: { id: string; instagramHandle: string; firstName: string; lastName: string; soldCount: number; payouts: any[] }, index: number) => {
            const totalSales = calculateTotalSales(seller.payouts); // Calculate total sales from payouts
            return (
              <li key={seller.id} className="flex items-center gap-3">
                <span className="font-bold text-lg text-muted-foreground">{index + 1}</span>
                <div className="flex-1">
                  <p onClick={() => router.push(`/${params.storeId}/sellers/${seller.id}/details`)} className="font-semibold hover:underline hover:cursor-pointer">
                    {seller.firstName || seller.instagramHandle}
                    {seller.lastName && ` ${seller.lastName}`}
                  </p>
                  <p className="text-sm text-muted-foreground">@{seller.instagramHandle}</p>
                  {/* Display total sales below the Instagram handle */}
                  <p className="text-sm text-muted-foreground">${totalSales.toFixed(2)}</p>
                </div>
                <Badge variant="secondary">{seller.soldCount} sold</Badge>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
