"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";
import Image from "next/image";
import ReactPlayer from "react-player";

export type ProductColumn = {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  ourPrice: string;
  retailPrice: string;
  designer: string;
  category: string;
  sellerHandle: string;
  size: string;
  color: string;
  condition: string;
  gender: string;
  subcategory: string;
  createdAt: string;
  isFeatured: boolean;
  isArchived: boolean;
  isOnSale: boolean;
  isCharity: boolean;
  isHidden: boolean;
  material: string | null | undefined;
  likes: number | null | undefined;
  clicks: number | null | undefined;
  imageUrl: string;
  designerId: string;
  categoryId: string;
  storeId: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex">
        <CellAction data={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex text-red-900">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "imageUrl",
    header: "imageUrl",
    cell: ({ row }) => (
      <>
        <a className="hover:underline" href={row.original.imageUrl}>
          {/* <Image src={row.original.imageUrl} alt="Image" width={100} height={100}></Image>  */}
          {row.original?.imageUrl.match(/https:\/\/.*\.(video|mp4|MP4|mov).*/) ? (
            <ReactPlayer
              key={row.original.id}
              url={row.original.imageUrl}
              width={"100%"}
              loop={true}
              playing={true}
              muted={true}
              alt={`Image from ${row.original.imageUrl}`}
              className="rounded-md transition-opacity duration-200 ease-in-out"
            />
          ) : (
            <Image
              key={row.original.id}
              src={row.original.imageUrl}
              alt={`Image from ${row.original.imageUrl}`}
              width={100}
              height={0}
              loading="lazy"
              className="rounded-md transition-opacity duration-200 ease-in-out"
            />
          )}
        </a>
      </>
    ),
  },
  {
    accessorKey: "ourPrice",
    header: "Price",
    cell: ({ row }) => (
      <div className="flex text-red-600">{row.original.ourPrice}</div>
    ),
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
        <a
          className="hover:underline"
          href={`/api/${row.original.storeId}/designers/${row.original.designerId}`}
        >
          {row.original.designer}
        </a>
      </div>
    ),
  },
  {
    accessorKey: "sellerHandle",
    header: "Seller",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2 overflow-y-auto">
        <a
          className="hover:underline"
          href={`/api/${row.original.storeId}/categories/${row.original.categoryId}`}
        >
          {row.original.category}
        </a>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2 overflow-y-auto">
        {row.original.description}
      </div>
    ),
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
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "material",
    header: "Material",
  },
  {
    accessorKey: "condition",
    header: "Condition",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "subcategory",
    header: "Subcategory",
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
        ></div>
      </div>
    ),
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "isArchived",
    header: "Sold",
  },
  {
    accessorKey: "isOnSale",
    header: "OnSale",
  },
  {
    accessorKey: "isCharity",
    header: "isCharity",
  },
  {
    accessorKey: "isHidden",
    header: "isHidden",
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
  },
];
