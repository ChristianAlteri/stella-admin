"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@prisma/client";
import UserCard from "./user-card";

export const columns = (countryCode: string): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <UserCard row={row.original} countryCode={countryCode} />,
  },
];

// export const columns: ColumnDef<User>[] = [
//   {
//     accessorKey: "name",
//     header: "Name",
//     cell: ({ row }) => <UserCard row={row.original} />, 
//   },
// ];
