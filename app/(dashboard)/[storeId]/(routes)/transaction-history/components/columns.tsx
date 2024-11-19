"use client";

import { ColumnDef } from "@tanstack/react-table";

import TransactionHistoryComponent from "./transaction-history-component";
import { Order, OrderItem, Payout, Product, Seller } from "@prisma/client";

type OrderWithItemsAndSeller = Order & {
  orderItems: (OrderItem & {
    product: Product & {
      images: { url: string }[];
      designer: { name: string };
      seller: {
        storeName: string;
        id: string;
        name: string;
      };
      category: { name: string };
      size: { name: string };
      color: { name: string };
    };
  })[];
  soldByStaff: {  name: string; id: string } | null;
  Payout: {
    id: string;
    amount: number;
    transferGroupId: string | null;
    stripeTransferId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
};


export type TransactionHistoryColumn = {
  order?: OrderWithItemsAndSeller;
  // seller: Seller;
  countryCode: string;
};

export const columns: ColumnDef<TransactionHistoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <TransactionHistoryComponent data={row.original} />,
  },
];
