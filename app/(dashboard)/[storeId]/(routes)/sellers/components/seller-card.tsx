"use client";

import { ColumnDef } from "@tanstack/react-table";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

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


const SellerCard = ({ row }: { row: SellerColumn }) => {
  const router = useRouter();

  return (
    <Card
      onClick={() =>
        router.push(
          `/${row.storeId}/sellers/${row.sellerId}/details`
        )
      }
    >
      <CardHeader className="flex flex-row justify-between hover:cursor-pointer">
        <CardTitle className="flex flex-row gap-2">
          <>
            <a
              className="hover:underline"
              href={row.imageUrl ?? "#"}
            >
              <img
                src={row.imageUrl ?? "/default-profile.png"}
                alt="Profile Image"
                style={{
                  width: "100px",
                  height: "auto",
                  borderRadius: "10px",
                }}
              />
            </a>
            <CardContent>
              {row.instagramHandle}
              <CardDescription>
                {row.firstName} {row.lastName}
              </CardDescription>
              <CardDescription
                className="flex flex-row justify-between"
                title="Email"
              >
                {row.email}
              </CardDescription>
            </CardContent>
          </>
        </CardTitle>
        <a
          className="hover:underline"
          href={`/${row.storeId}/sellers/${row.sellerId}/details`}
        >
          Details
        </a>
      </CardHeader>
    </Card>
  );
};

export default SellerCard;