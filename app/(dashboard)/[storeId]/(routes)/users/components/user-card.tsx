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
import { Mail, MapPin, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { TbBadge, TbClipboardData } from "react-icons/tb";

import { User } from "@prisma/client";
import UserActions from "./user-actions";
import { currencyConvertor } from "@/lib/utils";
import { useState } from "react";

export default function UserCard({
  row,
  countryCode,
}: {
  row: User;
  countryCode: string;
}) {
  const currencySymbol = currencyConvertor(countryCode);
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(true);

  const handleCardClick = () => {
    router.push(`/${row.storeId}/user/${row.id}/details`);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-300">
      {isMinimized ? (
        <div className="flex flex-row items-center justify-between bg-white rounded-lg shadow-sm hover:shadow-md ml-4 flex-wrap">
          <div className="grid grid-cols-5 w-full items-center">
            <p className="font-semibold text-sm col-span-1 w-full text-left truncate">
              {row.name || "CA"}
            </p>
            <p className="font-semibold text-sm col-span-1 w-full text-left truncate">
              {row.email || "No Email"}
            </p>
            <span className="flex items-center text-xs text-muted-foreground truncate text-left col-span-1">
              {currencySymbol}
              {row.totalPurchases || "No Purchases Yet"}
            </span>
            <span className="flex items-center text-xs text-muted-foreground truncate text-left col-span-1">
              {row.totalItemsPurchased || "No"} Items Purchased
            </span>
            <div className="flex justify-end col-span-1 truncate p-2">
              <UserActions data={row} />
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:cursor-pointer focus:outline-none p-1"
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <CardContent>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback>
                {row.name
                  ? `${row.name[0]?.toUpperCase() || ""}${
                      row.name[1]?.toUpperCase() || ""
                    }`
                  : "CA"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-md text-primary underline">
                {row.name || "CA"}
              </p>
            </div>
            <UserActions data={row} />
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:cursor-pointer focus:outline-none m-2 p-1"
            >
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
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
              <div className="flex items-center text-xs text-muted-foreground">
                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Phone Number: {row.phoneNumber}</span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-muted-foreground">
                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>No Phone Number</span>
              </div>
            )}
            {row?.postalCode ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Post Code: {row.postalCode}</span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>No Post Code</span>
              </div>
            )}
            {row?.totalPurchases ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <TbBadge className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>
                  Total Purchases: {currencySymbol}
                  {row.totalPurchases}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-muted-foreground">
                <TbBadge className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>No Purchases Yet</span>
              </div>
            )}
            {row?.totalItemsPurchased ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <TbClipboardData className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>
                  Total Number of Purchases: {row.totalItemsPurchased}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-muted-foreground">
                <TbClipboardData className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>No Purchases Yet</span>
              </div>
            )}
            {row?.totalTransactionCount ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <TbClipboardData className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Total Transactions: {row.totalTransactionCount}</span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-muted-foreground">
                <TbClipboardData className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>No Transactions Yet</span>
              </div>
            )}
          </CardContent>
        </CardContent>
      )}
    </Card>
  );
}
