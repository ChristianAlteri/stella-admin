"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type ColorColumn = {
  id: string;
  name: string;
  value: string;
  createdAt: string;
};

export const columns: ColumnDef<ColorColumn>[] = [
  // {
  //   accessorKey: "name",
  //   header: "Name",
  // },
  {
    id: "combined",
    header: "Details",
    cell: ({ row }) => (
      <div>
        <div className="text-black ">
          <strong>Name:</strong> {row.original.name}
        </div>
        <div className="text-sm text-gray-400">Value: {row.original.value}</div>
        <div className="text-sm text-gray-400">
          Date: {row.original.createdAt}
        </div>
        <div className="flex items-center gap-x-2">
          {row.original.value}
          <div
            className="h-4 w-4 rounded border"
            style={{ backgroundColor: row.original.value }}
          />
        </div>
      </div>
    ),
  },
  // {
  //   accessorKey: "value",
  //   header: "Value",
  //   cell: ({ row }) => (
  //     <div className="flex items-center gap-x-2">
  //       {row.original.value}
  //       <div className="h-4 w-4 rounded border" style={{ backgroundColor: row.original.value }} />
  //     </div>
  //   )
  // },
  // {
  //   accessorKey: "createdAt",
  //   header: "Date",
  // },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
