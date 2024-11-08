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
} from "lucide-react";
import { TbLego, TbClipboardData } from "react-icons/tb";

import { Staff } from "@prisma/client";
import StaffActions from "./staff-actions";
import { currencyConvertor } from "@/lib/utils";

export default function StaffCard({
  row,
  countryCode,
}: {
  row: Staff;
  countryCode: string;
}) {
  const currencySymbol = currencyConvertor(countryCode);
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/${row.storeId}/staff/${row.id}/details`);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-300">
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
            {row.name ? `${row.name}` : "CA"}
          </p>
        </div>
        <StaffActions data={row} />
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
        <div className="flex items-center">
          <TbLego className="w-4 h-4 mr-2 text-muted-foreground" />
          <span>Type: {row.staffType}</span>
        </div>
        {row?.totalSales ? (
          <div className="flex items-center text-xs text-gray-500">
            <TbClipboardData className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span>
              Total Sales: {currencySymbol}
              {row.totalSales}
            </span>
          </div>
        ) : (
          <div className="flex items-center text-xs text-gray-500">
            <TbClipboardData className="w-4 h-4 mr-2 text-xs text-gray-500" />
            <span className="text-xs text-gray-500">No Sales Yet</span>
          </div>
        )}
      </CardContent>
      {/* <CardFooter className="flex justify-between items-center">
        <Badge variant="default">{row.staffType}</Badge>
      </CardFooter> */}
    </Card>
  );
}
