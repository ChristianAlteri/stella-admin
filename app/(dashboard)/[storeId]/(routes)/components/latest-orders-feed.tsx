'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from 'lucide-react';

interface Order {
  id: string;
  isPaid: boolean;
  hasBeenDispatched: boolean;
  createdAt: string;
}

export default function LiveOrdersCard({ orders }: { orders: Order[] }) {
  // Filter live orders - unpaid and not dispatched
  const liveOrders = orders
    .filter(order => !order.isPaid && !order.hasBeenDispatched)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by createdAt descending
    .slice(0, 3); // Get top 3

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-400" />
          Live Orders Feed (Top 3)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {liveOrders.length > 0 ? (
            liveOrders.map((order, index) => (
              <li key={order.id} className="flex items-center gap-3">
                <span className="font-bold text-lg text-muted-foreground">{index + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Created at: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="secondary">
                  Unpaid / Not Dispatched
                </Badge>
              </li>
            ))
          ) : (
            <p className="text-muted-foreground">No live orders at the moment.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
