'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from 'lucide-react'
import { useParams, useRouter } from "next/navigation";

// Helper function to calculate total sales from payouts
function calculateTotalSales(payouts: any[]) {
  return payouts.reduce((total, payout) => total + payout.amount, 0); // Assuming each payout object has an 'amount' field
}

export default function TopSellersCard({ sellers }: any) {
  const router = useRouter();
  const params = useParams();

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Top Sellers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {sellers.map((seller: { id: string; instagramHandle: string; firstName: string; lastName: string; soldCount: number; payouts: any[] }, index: number) => {
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
