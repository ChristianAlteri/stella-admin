"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"
import Image from "next/image";

export type ProductColumn = {
  id: string;
  name: string;
  description: string;
  ourPrice: string;
  retailPrice: string;
  designer: string;
  category: string;
  sellerHandle: string;
  size: string;
  color: string;
  createdAt: string;
  isFeatured: boolean;
  isArchived: boolean;
  isOnSale: boolean;
  isCharity: boolean;
  condition: string | null | undefined;
  material: string | null | undefined;
  measurements: string | null | undefined;
  likes: number | null | undefined;
  clicks: number | null | undefined;
  imageUrl: string;
  designerId: string;
  categoryId: string;
  storeId: string;
}

export const columns: ColumnDef<ProductColumn>[] = [
  {
    id: "actions",
    cell: ({ row }) => 
      <div className="flex" >
        <CellAction data={row.original} />
      </div>
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => 
      <div className="flex text-red-900" >
       {row.original.name} 
      </div>
  },
  {
    accessorKey: "imageUrl",
    header: "imageUrl",
    cell: ({ row }) => (
      <>
        <a className="hover:underline" href={row.original.imageUrl}>
          <Image src={row.original.imageUrl} alt="Image" width={100} height={100}></Image> 
        </a>
      </>
    )
  },
  {
    accessorKey: "ourPrice",
    header: "Price",
    cell: ({ row }) => 
      <div className="flex text-red-600" >
        {row.original.ourPrice} 
      </div>
  },
  {
    accessorKey: "retailPrice",
    header: "RRP",
  },
  {
    accessorKey: "designer",
    header: "Designer",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2 overflow-y-auto">
         <a className="hover:underline" href={`/api/${row.original.storeId}/designers/${row.original.designerId}`}>
          {row.original.designer}
        </a>
      </div>
    )
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2 overflow-y-auto">
        {row.original.description}
      </div>
    )
  },
  {
    accessorKey: "likes",
    header: "Likes",
  },
  {
    accessorKey: "clicks",
    header: "Clicks",
  },
  // {
  //   accessorKey: "location",
  //   header: "Location",
  // },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => 
        <div className="flex items-center gap-x-2 overflow-y-auto">
          <a className="hover:underline" href={`/api/${row.original.storeId}/categories/${row.original.categoryId}`}>{row.original.category}</a>
        </div>
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "sellerHandle",
    header: "Seller",
  },
  {
    accessorKey: "condition",
    header: "Condition",
  },
  {
    accessorKey: "sex",
    header: "Sex",
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
    header: "OnSale",
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
    accessorKey: "reference",
    header: "Reference",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.color}
        <div
        className="w-4 h-4 rounded border"
          style={{ backgroundColor: row.original.color}}
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
  //       {/* <a className="hover:underline" href={row.original.imageUrl}> */}
  //       <a className="hover:underline" >

  //         <img src={row.original.imageUrl} alt="Image" style={{ width: '100px', height: 'auto' }}></img> 
  //       </a>
  //     </>,
  // },
  {
    accessorKey: "createdAt",
    header: "Date",
  }
];
