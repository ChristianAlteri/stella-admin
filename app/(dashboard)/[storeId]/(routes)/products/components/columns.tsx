"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type ProductColumn = {
  id: string;
  name: string;
  ourPrice: string;
  retailPrice: string;
  designer: string;
  category: string;
  size: string;
  color: string;
  createdAt: string;
  isFeatured: boolean;
  isArchived: boolean;
  isOnSale: boolean;
  location: string | null | undefined;
  condition: string | null | undefined;
  sex: string | null | undefined;
  material: string | null | undefined;
  measurements: string | null | undefined;
  likes: number | null | undefined;
  clicks: number | null | undefined;
  reference: string | null | undefined;
}

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "name",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
  },
  {
    accessorKey: "isOnSale",
    header: "On Sale",
  },
  {
    accessorKey: "ourPrice",
    header: "Our Price",
  },
  {
    accessorKey: "retailPrice",
    header: "Real Retail Price",
  },
  // {
  //   accessorKey: "location",
  //   header: "Location",
  // },
  {
    accessorKey: "condition",
    header: "Condition",
  },
  {
    accessorKey: "sex",
    header: "Sex",
  },
  {
    accessorKey: "material",
    header: "Material",
  },
  {
    accessorKey: "measurements",
    header: "Measurements",
  },
  {
    accessorKey: "likes",
    header: "Likes",
  },
  {
    accessorKey: "clicks",
    header: "Clicks",
  },
  {
    accessorKey: "reference",
    header: "Reference",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "designer",
    header: "Designer",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.color}
        <div
        className="w-4 h-4 rounded border"
          style={{ backgroundColor: row.original.color }}
        >
        </div>
      </div>
    )
  },
  // {
  //   accessorKey: "imageUrl",
  //   header: "Preview Image",
  //   cell: ({ row }) => 
  //     <>
  //       <a className="hover:underline" href={row.original.imageUrl}>
  //         <img src={row.original.imageUrl} alt="Image" style={{ width: '100px', height: 'auto' }}></img> 
  //       </a>
  //     </>,
  // },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
];