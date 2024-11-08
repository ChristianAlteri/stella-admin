"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Phone } from "lucide-react";
import { TbBadge, TbClipboardData } from "react-icons/tb";

import { User } from "@prisma/client";
import UserActions from "./user-actions";
import { currencyConvertor } from "@/lib/utils";

export default function UserCard({
  row,
  countryCode,
}: {
  row: User;
  countryCode: string;
}) {
  const currencySymbol = currencyConvertor(countryCode);
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/${row.storeId}/user/${row.id}/details`);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarFallback>
            <AvatarFallback>
              {row.name
                ? `${row.name[0]?.toUpperCase() || ""}${
                    row.name[1]?.toUpperCase() || ""
                  }`
                : "CA"}
            </AvatarFallback>
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-md text-primary underline">
            {row.name ? `${row.name}` : "CA"}
          </p>
        </div>
        <UserActions data={row} />
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
          <a
            href={`mailto:${row.email}`}
            className="text-primary hover:underline"
          >
            Email: {row.email || "No email"}
          </a>
        </div>


        {row?.phoneNumber ? (
          <div className="flex items-center text-xs text-gray-500">
            <Phone className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span>Phone Number: {row.phoneNumber}</span>
          </div>
        ) : (
          <div className="flex items-center text-xs text-gray-500">
            <Phone className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span className="text-xs text-gray-500">No Phone Number</span>
          </div>
        )}

        {row?.postalCode ? (
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span>Post Code: {row.postalCode}</span>
          </div>
        ) : (
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span className="text-xs text-gray-500">No Post Code</span>
          </div>
        )}

        {row?.totalPurchases ? (
          <div className="flex items-center text-xs text-gray-500">
            <TbBadge className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span>
              Total Purchases: {currencySymbol}
              {row.totalPurchases}
            </span>
          </div>
        ) : (
          <div className="flex items-center text-xs text-gray-500">
            <TbBadge className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span className="text-xs text-gray-500">No Purchases Yet</span>
          </div>
        )}
        {row?.totalItemsPurchased ? (
          <div className="flex items-center text-xs text-gray-500">
            <TbClipboardData className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span>Total Number Of Purchases: {row.totalItemsPurchased}</span>
          </div>
        ) : (
          <div className="flex items-center text-xs text-gray-500">
            <TbClipboardData className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span className="text-xs text-gray-500">No Purchases Yet</span>
          </div>
        )}

        {row?.totalTransactionCount ? (
          <div className="flex items-center text-xs text-gray-500">
            <TbClipboardData className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span>Total Transactions: {row.totalTransactionCount}</span>
          </div>
        ) : (
          <div className="flex items-center text-xs text-gray-500">
            <TbClipboardData className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span className="text-xs text-gray-500">No Purchases Yet</span>
          </div>
        )}
      </CardContent>
      {/* <CardFooter className="flex justify-between items-center">
        <Badge variant="default">{row.userType}</Badge>
      </CardFooter> */}
    </Card>
  );
}
