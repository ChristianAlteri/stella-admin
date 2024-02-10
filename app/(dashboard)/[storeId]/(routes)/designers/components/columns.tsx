"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type DesignerColumn = {
  id: string
  name: string;
  billboardLabel: string;
  createdAt: string;
  imageUrl: string; 
  productsUrl: string;
}

export const columns: ColumnDef<DesignerColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "billboard",
    header: "Billboard",
    cell: ({ row }) => row.original.billboardLabel,
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => <img src={row.original.imageUrl} alt="Image" style={{ width: '100px', height: 'auto' }}/>,
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
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
];
