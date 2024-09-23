"use client"

import { ColumnDef } from "@tanstack/react-table"
import PayoutCard from "./payout-card";
import { Seller } from "@prisma/client";

export type PayoutColumn = {
  id: string
  sellerId: string;
  sellerHandle: string;
  sellerEmail: string;
  sellerStripConnect: string;
  amount: string;
  transferGroupId: string;
  stripeTransferId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const columns: ColumnDef<PayoutColumn>[] = [
  {
    accessorKey: "id",
    header: "Payouts",
    cell: ({ row }) => (
      <div className="flex flex-row justify-start w-full">
        <PayoutCard row={row.original} />,
      </div>
    ),
  },
];
