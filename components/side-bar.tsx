"use client";
import {
    TbAdjustmentsCog,
  TbCash,
  TbDeviceAnalytics,
  TbFriends,
  TbSettings,
  TbTag,
} from "react-icons/tb";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaHandshakeAngle, FaXbox } from "react-icons/fa6";

import { useState } from "react";
import { Users, Package } from "lucide-react";
import { GrConfigure } from "react-icons/gr";

export default function Sidebar({ storeId }: { storeId: string | string[] }) {
  const params = useParams();
  const menuItems = [
    { icon: TbDeviceAnalytics, href: `/${params.storeId}`, label: "Dashboard" },
    { icon: TbCash, href: `/${params.storeId}/point-of-sale`, label: "POS" },
    { icon: Package, href: `/${params.storeId}/products`, label: "Products" },
    { icon: Users, href: `/${params.storeId}/sellers`, label: "Sellers" },
  ];

  return (
    <aside className="absolute w-[50px] bg-sidebar  h-full shadow-2xl border-opacity-50 ">
      <nav className="h-full flex flex-col items-center py-2 space-y-4">
        <div className="flex flex-col gap-3">
          <div className="p-2 rounded-md">
            <FaXbox className="w-6 h-6 text-muted-foreground" />
          </div>
          {menuItems.map((item) => (
            <Link
                title={item.label}
              key={item.href}
              href={item.href}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors duration-200"
            >
              <item.icon className="w-6 h-6 text-muted-foreground" />
              <span className="sr-only">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3 h-full justify-end items-end">
          <Link
            key={`/${params.storeId}/manage-readers`} //TODO: make a store config route that takes me to a single place where i can manage all store configurations ie designers and sizes
            href={`/${params.storeId}/manage-readers`}
            title="Store Config"
            className="p-2 rounded-md hover:bg-slate-100 transition-colors duration-200"
          >
            <TbAdjustmentsCog  className="w-6 h-6 text-muted-foreground" />
            <span className="sr-only">Store Config</span>
          </Link>
          <Link
            key={`/${params.storeId}/manage-readers`}
            href={`/${params.storeId}/manage-readers`}
            title="Hardware"
            className="p-2 rounded-md hover:bg-slate-100 transition-colors duration-200"
          >
            <GrConfigure className="w-5 h-5 text-muted-foreground" />
            <span className="sr-only">Hardware</span>
          </Link>
          <Link
            key={`/${params.storeId}/settings`}
            href={`/${params.storeId}/settings`}
            title="Settings"
            className="p-2 rounded-md hover:bg-slate-100 transition-colors duration-200"
          >
            <TbSettings className="w-6 h-6 text-muted-foreground" />
            <span className="sr-only">Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
