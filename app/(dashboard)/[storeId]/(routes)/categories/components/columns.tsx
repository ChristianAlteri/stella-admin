"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type CategoryColumn = {
  id: string
  name: string;
  billboardLabel: string;
  createdAt: string;
  imageUrl: string; 
  productsUrl: string;
}

export const columns: ColumnDef<CategoryColumn>[] = [
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
          <img src={row.original.imageUrl} alt="Image" style={{ width: '100px', height: 'auto' }}></img> 
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
    cell: ({ row }) => <a className="hover:underline" href={row.original.productsUrl}>Link to Products</a>
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
