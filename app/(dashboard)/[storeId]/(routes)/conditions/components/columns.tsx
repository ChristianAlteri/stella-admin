"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type ConditionColumn = {
  id: string
  name: string;
  value: string;
  createdAt: string;
}

export const columns: ColumnDef<ConditionColumn>[] = [
  // {
  //   accessorKey: "name",
  //   header: "Name",
  // },
  // {
  //   accessorKey: "value",
  //   header: "Value",
  // },
  // {
  //   accessorKey: "createdAt",
  //   header: "Date",
  // },
  {
    id: "combined",
    header: "Details",
    cell: ({ row }) => (
      <div>
        <div className="text-black "><strong>Name:</strong> {row.original.name}</div>
        <div className="text-sm text-gray-400">Value: {row.original.value}</div>
        <div className="text-sm text-gray-400">Date: {row.original.createdAt}</div>
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
];
