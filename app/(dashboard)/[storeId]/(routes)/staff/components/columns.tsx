"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Staff } from "@prisma/client";
import StaffCard from "./staff-card";

export const columns = (countryCode: string): ColumnDef<Staff>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <StaffCard row={row.original} countryCode={countryCode} />, 
  },
];
