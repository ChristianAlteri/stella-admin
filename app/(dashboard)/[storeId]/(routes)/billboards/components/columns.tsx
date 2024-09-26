"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"
import Image from "next/image"
import ReactPlayer from "react-player"
import BillboardCard from "./billboard-card"

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
    cell: ({ row }) => <BillboardCard billboards={[row.original]} />

  },
  // {
  //   accessorKey: "label",
  //   header: "Label",
  // },
  // {
  //   accessorKey: "imageUrl",
  //   header: "Billboard Image",
  //   cell: ({ row }) => 
  //     <>
  //       <a className="hover:underline" href={row.original.imageUrl}>
  //       {row.original?.imageUrl.match(/https:\/\/.*\.(video|mp4|MP4|mov).*/) ? (
  //           <ReactPlayer
  //             key={row.original.id}
  //             url={row.original.imageUrl}
  //             width={"50%"}
  //             loop={true}
  //             playing={true}
  //             muted={true}
  //             alt={`Image from ${row.original.imageUrl}`}
  //             className="rounded-md transition-opacity duration-200 ease-in-out"
  //           />
  //         ) : (
  //           <Image
  //             key={row.original.id}
  //             src={row.original.imageUrl}
  //             alt={`Image from ${row.original.imageUrl}`}
  //             width={100}
  //             height={0}
  //             loading="lazy"
  //             className="rounded-md transition-opacity duration-200 ease-in-out"
  //           />
  //         )}
  //       </a>
  //     </>,
  // },
  // {
  //   accessorKey: "createdAt",
  //   header: "Date",
  // },
  // {
  //   id: "actions",
  //   cell: ({ row }) => <CellAction data={row.original} />
  // },
];
