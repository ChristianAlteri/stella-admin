"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"
import Image from "next/image"

export type DesignerColumn = {
  id: string
  name: string;
  billboardLabel: string | undefined;
  createdAt: string;
  imageUrl: string | undefined; 
  productsUrl: string;
  storeId: string;
  designerId: string | undefined;
}

export const columns: ColumnDef<DesignerColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "billboard",
    header: "Billboard Name",
    cell: ({ row }) => row.original.billboardLabel,
  },
  {
    accessorKey: "imageUrl",
    header: "Billboard Image",
    cell: ({ row }) => 
      <>
        <a className="hover:underline" href={row.original.imageUrl}>
          {row.original.imageUrl && (
            <Image src={row.original.imageUrl} alt="Image" style={{ width: '100px', height: 'auto' }} />
          )}
        </a>
      </>,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "productsUrl", // This is the accessor key for the products URL
    header: "Products", // Link to the products page
    cell: ({ row }) => <a className="hover:underline" href={`/api/${row.original.storeId}/designers/${row.original.designerId}`}>Link to Products</a>
  },
  {
    accessorKey: "ordersUrl", // This is the accessor key for the orders URL
    header: "Orders", // Link to the orders page
    cell: ({ row }) => <a className="hover:underline" href={row.original.productsUrl}>Link to Orders</a>
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
];
