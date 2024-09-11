"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type SellerColumn = {
  id: string;
  instagramHandle: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  shippingAddress: string;
  country: string;
  createdAt: string;
  productsUrl: string;
  storeId: string;
  sellerId: string;
  imageUrl: string | undefined;
  charityName: string;
  charityUrl: string;
  shoeSizeEU: string;
  topSize: string;
  bottomSize: string;
  sellerType: string;
  description: string;
  storeName: string;
};

export const columns: ColumnDef<SellerColumn>[] = [
  {
    accessorKey: "instagramHandle",
    header: "Instagram",
  },
  {
    accessorKey: "imageUrl",
    header: "Profile Image",
    cell: ({ row }) => (
      <>
        <a className="hover:underline" href={row.original.imageUrl}>
          <img
            src={row.original.imageUrl}
            alt="Image"
            style={{ width: "100px", height: "auto", borderRadius: "10px" }}
          ></img>
        </a>
      </>
    ),
  },
  // {
  //   accessorKey: "productsUrl",
  //   header: "Products",
  //   cell: ({ row }) => (
  //     <a
  //       className="hover:underline"
  //       href={`/api/${row.original.storeId}/sellers/${row.original.sellerId}`} // TODO: re route to products page and make an api to this url
  //     >
  //       Link to Products
  //     </a>
  //   ),
  // },
  // {
  //   accessorKey: "ordersUrl",
  //   header: "Orders", // TODO: Make a generic orders page that gets all the orders for storeId but if a sellerId is passed in then it gets all the orders for that seller
  //   cell: ({ row }) => (
  //     <a className="hover:underline" href={row.original.productsUrl}>
  //       Link to Orders
  //     </a>
  //   ),
  // },
  // {
  //   accessorKey: "charityName",
  //   header: "Charity Name",
  // },
  // {
  //   accessorKey: "shoeSizeEU",
  //   header: "Shoe Size EU",
  // },
  // {
  //   accessorKey: "topSize",
  //   header: "Top Size",
  // },
  // {
  //   accessorKey: "bottomSize",
  //   header: "Bottom Size",
  // },
  {
    accessorKey: "details",
    header: "Details", // TODO: Make a generic orders page that gets all the orders for storeId but if a sellerId is passed in then it gets all the orders for that seller
    cell: ({ row }) => (
      // <a className="hover:underline" href={`/api/${row.original.storeId}/sellers/${row.original.sellerId}`}>
      <a className="hover:underline" href={`/${row.original.storeId}/sellers/${row.original.sellerId}/details`}>
        Details
      </a>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
