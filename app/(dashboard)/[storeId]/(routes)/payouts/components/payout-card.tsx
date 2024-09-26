"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { PayoutColumn } from "./columns";
import Link from "next/link";

export default function PayoutCard({ row }: { row: PayoutColumn }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="w-full mx-auto mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge className="p-2" variant="default">
              £{row.amount}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">
              {new Date(row.createdAt).toLocaleString("en-GB", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Seller Information</h3>
          <Link
            href={`sellers/${row.sellerId}/details`}
            className="text-center"
          >
            <span className="font-semibold hover:underline font-bold">
              Name: {row.sellerHandle}
            </span>
          </Link>
          <p>
            <a
              href={`mailto:${row.sellerEmail}`}
              className="text-blue-500 hover:underline"
            >
              Email: {row.sellerEmail}
            </a>
          </p>
        </div>
        <Separator />

        {/* Toggle button */}
        <Button variant="ghost" onClick={toggleExpand}>
          {isExpanded ? (
            <>
              Hide Details <ChevronUpIcon className="ml-2" />
            </>
          ) : (
            <>
              Show Details <ChevronDownIcon className="ml-2" />
            </>
          )}
        </Button>

        {isExpanded && (
          <div className="space-y-2">
            <p className="font-semibold">
              Stripe Connect: {row.sellerStripConnect}
            </p>
            <h3 className="text-lg font-semibold">Payout Details</h3>
            <p className="text-sm">Payout ID: {row.id}</p>
            <p className="text-sm">Transfer Group ID: {row.transferGroupId}</p>
            <p className="text-sm">Stripe Transfer ID: {row.stripeTransferId}</p>
          </div>
        )}
        <Separator />
      </CardContent>
    </Card>
  );
}
