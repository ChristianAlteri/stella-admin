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
import {
  Instagram,
  Mail,
  Phone,
  MapPin,
  Store,
  ShoppingBag,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TbLego, TbClipboardData } from "react-icons/tb";

import { Staff } from "@prisma/client";
import StaffActions from "./staff-actions";
import { currencyConvertor } from "@/lib/utils";
import { useState } from "react";

export default function StaffCard({
  row,
  countryCode,
}: {
  row: Staff;
  countryCode: string;
}) {
  const currencySymbol = currencyConvertor(countryCode);
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(true);

  const handleCardClick = () => {
    router.push(`/${row.storeId}/staff/${row.id}/details`);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-300">
      {isMinimized ? (
        <div className="flex flex-row items-center justify-between bg-white rounded-lg shadow-sm hover:shadow-md ml-4">
          <div className="grid grid-cols-5 w-full items-center">
            <p className="font-semibold text-sm col-span-1 truncate w-full text-left">
              {row.name || "CA"}
            </p>
            <p className="font-semibold text-sm col-span-1 truncate w-full text-left">
            {currencySymbol} {row.totalSales || "No Sales Yet"}
            </p>
            <p className="font-semibold text-sm col-span-1 truncate w-full text-left">
              {row.totalItemsSold || "No"} Items Sold
            </p>
            <p className="flex justify-between items-center col-span-1 truncate w-full text-left">
              <Badge variant="default">{row.staffType}</Badge>
            </p>
            <div className="flex justify-end col-span-1 truncate w-full p-2">
              <StaffActions data={row} />
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
                  ? `${row.name[0].toUpperCase()}${row.name[1].toUpperCase()}`
                  : "CA"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-md text-primary underline">
                {row.name ? row.name : "CA"}
              </p>
            </div>
            <StaffActions data={row} />
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:cursor-pointer focus:outline-none m-2 p-1"
            >
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {row?.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                <a
                  href={`mailto:${row.email}`}
                  className="text-primary hover:underline"
                >
                  {row.email}
                </a>
              </div>
            )}
            <div className="flex items-center">
              <TbLego className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Type: {row.staffType}</span>
            </div>
            {row?.totalSales ? (
              <div className="flex items-center text-xs text-gray-500">
                <TbClipboardData className="w-4 h-4 mr-2 text-gray-500" />
                <span>
                  Total Sales: {currencySymbol}
                  {row.totalSales}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-gray-500">
                <TbClipboardData className="w-4 h-4 mr-2 text-gray-500" />
                <span>No Sales Yet</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Badge variant="default">{row.staffType}</Badge>
          </CardFooter>
        </CardContent>
      )}
    </Card>
  );
}
