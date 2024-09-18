"use client";

import { ColumnDef } from "@tanstack/react-table";
import SellerCard from "./seller-card";

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
    cell: ({ row }) => <SellerCard row={row.original} />, 
  },
];
