'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from 'lucide-react'
import { useParams, useRouter } from "next/navigation";


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
          {sellers.map((seller: { id: React.Key | null | undefined; instagramHandle: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.PromiseLikeOfReactNode | null | undefined; firstName: string; lastName: string; soldCount: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | React.PromiseLikeOfReactNode | null | undefined }, index: number) => (
            <li key={seller.id} className="flex items-center gap-3">
              <span className="font-bold text-lg text-muted-foreground">{index + 1}</span>
              <div className="flex-1">
                <p onClick={() => router.push(`/${params.storeId}/sellers/${seller.id}/details`)} className="font-semibold hover:underline hover:cursor-pointer">
                  {seller.firstName || seller.instagramHandle}
                  {seller.lastName && ` ${seller.lastName}`}
                </p>
                <p className="text-sm text-muted-foreground">@{seller.instagramHandle}</p>
              </div>
              <Badge variant="secondary">{seller.soldCount} sold</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}