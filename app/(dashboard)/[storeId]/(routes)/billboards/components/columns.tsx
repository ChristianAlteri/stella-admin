"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"
import Image from "next/image"

export type BillboardColumn = {
  id: string
  label: string;
  imageUrl: string; 
  createdAt: string;
}

export const columns: ColumnDef<BillboardColumn>[] = [
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "imageUrl",
    header: "Billboard Image",
    cell: ({ row }) => 
      <>
        <a className="hover:underline" href={row.original.imageUrl}>
          <Image src={row.original.imageUrl} alt="Image" style={{ width: '100px', height: 'auto' }}></Image> 
        </a>
      </>,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
];
