"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type SellerColumn = {
  id: string
  name: string;
  instagramHandle: string;
  createdAt: string;
  productsUrl: string;
  storeId: string;
  sellerId: string;
  imageUrl: string | undefined; 
}

export const columns: ColumnDef<SellerColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "instagramHandle",
    header: "Instagram",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
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
    accessorKey: "productsUrl", // This is the accessor key for the products URL
    header: "Products", // Link to the products page
    cell: ({ row }) => <a className="hover:underline" href={`/api/${row.original.storeId}/sellers/${row.original.sellerId}`}>Link to Products</a>
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
