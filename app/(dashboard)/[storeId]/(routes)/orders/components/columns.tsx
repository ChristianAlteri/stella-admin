"use client";

import { ColumnDef } from "@tanstack/react-table";
import OrderCard from "./order-card";

export type OrderColumn = {
  id: string;
  phone: string;
  email: string;
  address: string;
  hasBeenDispatched: boolean;
  isPaid: boolean;
  totalPrice: string;
  totalRrpPrice: string;
  createdAt: Date;
  stripe_connect_unique_id: string[];
  products: string[];
  productIds: string[];
  productImageUrls: string[];
  sellers: string[];
  sellerIds: string[];
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "createdAt",
    header: "Orders",
    cell: ({ row }) => (
      <div className="flex flex-row justify-start w-full">
        <OrderCard row={row.original} />,
      </div>
    ),
  },
];
