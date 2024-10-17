"use client";
import {
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

export default function Sidebar({ storeId }: { storeId: string | string[] }) {
  const params = useParams();
  const menuItems = [
    { icon: TbDeviceAnalytics, href: `/${params.storeId}`, label: "Dashboard" },
    { icon: TbCash, href: `/${params.storeId}/point-of-sale`, label: "POS" },
    { icon: Package, href: `/${params.storeId}/products`, label: "Products" },
    { icon: Users, href: `/${params.storeId}/sellers`, label: "Sellers" },
  ];

  return (
    <aside className="absolute w-[50px] bg-white border-r border-slate-300 h-full">
      <nav className="h-full flex flex-col items-center py-2 space-y-4">
        <div className="flex flex-col gap-3">
          <div className="p-2 rounded-md">
            <FaXbox className="w-6 h-6 text-gray-600" />
          </div>
          {menuItems.map((item) => (
            <Link
                title={item.label}
              key={item.href}
              href={item.href}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors duration-200"
            >
              <item.icon className="w-6 h-6 text-gray-600" />
              <span className="sr-only">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3 h-full justify-end items-end">
          <Link
            key={`/${params.storeId}/settings`}
            href={`/${params.storeId}/settings`}
            className="p-2 rounded-md hover:bg-slate-100 transition-colors duration-200"
          >
            <TbSettings className="w-6 h-6 text-gray-600" />
            <span className="sr-only">Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
