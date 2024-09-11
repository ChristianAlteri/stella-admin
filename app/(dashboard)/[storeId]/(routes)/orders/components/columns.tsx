"use client"

import { ColumnDef } from "@tanstack/react-table"



export type OrderColumn = {
  id: string
  phone: string;
  email: string;
  address: string;
  hasBeenDispatched: boolean;
  isPaid: boolean;
  totalPrice: string;
  totalRrpPrice: string;
  products: string;
  createdAt: string;
}

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <a href = {`mailto:${row.original.email}`} className="text-blue-500 hover:underline hover:cursor-pointer">
        {row.original.email}
      </a>
    )
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
  },
  {
    accessorKey: "totalRrpPrice",
    header: "Total RRP",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  }
];
