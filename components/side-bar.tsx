"use client";

import {
  TbAdjustmentsCog,
  TbCash,
  TbDeviceAnalytics,
  TbSettings,
} from "react-icons/tb";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { FaXbox } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { Users, Package } from "lucide-react";
import { GrConfigure } from "react-icons/gr";

export default function Component({ storeId = '' }: { storeId?: string }) {
  const params = useParams();
  const pathname = usePathname();
  const [selectedItem, setSelectedItem] = useState<string>(`/${params.storeId}`);

  useEffect(() => {
    const currentPath = pathname || `/${params.storeId}`;
    setSelectedItem(currentPath);
  }, [pathname, params.storeId]);

  const menuItems = [
    { icon: TbDeviceAnalytics, href: `/${params.storeId}`, label: "Dashboard" },
    { icon: TbCash, href: `/${params.storeId}/point-of-sale`, label: "POS" },
    { icon: Package, href: `/${params.storeId}/products`, label: "Products" },
    { icon: Users, href: `/${params.storeId}/sellers`, label: "Sellers" },
  ];

  const settingsItems = [
    {
      icon: TbAdjustmentsCog,
      href: `/${params.storeId}/store-config`,
      label: "Store Config",
    },
    {
      icon: GrConfigure,
      href: `/${params.storeId}/manage-readers`,
      label: "Hardware",
    },
    {
      icon: TbSettings,
      href: `/${params.storeId}/settings`,
      label: "Settings",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 w-[50px] bg-sidebar h-full shadow-2xl border-opacity-50">
      <div className="h-full flex flex-col justify-between py-2">
        <div className="flex flex-col items-center gap-3">
          <div className="p-2 rounded-md">
            <FaXbox className="w-6 h-6 text-muted-foreground" />
          </div>
          {menuItems.map((item) => (
            <Link
              title={item.label}
              key={item.href}
              href={item.href}
              onClick={() => setSelectedItem(item.href)}
              className={`p-2 rounded-md transition-colors duration-200 ${
                selectedItem === item.href
                  ? "bg-background"
                  : "hover:bg-background"
              }`}
            >
              <item.icon className="w-6 h-6 text-muted-foreground" />
              <span className="sr-only">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3 items-center">
          {settingsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={() => setSelectedItem(item.href)}
              className={`p-2 rounded-md transition-colors duration-200 ${
                selectedItem === item.href
                  ? "bg-background"
                  : "hover:bg-background"
              }`}
            >
              <item.icon className="w-6 h-6 text-muted-foreground" />
              <span className="sr-only">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

// "use client";

// import {
//   TbAdjustmentsCog,
//   TbCash,
//   TbDeviceAnalytics,
//   TbSettings,
// } from "react-icons/tb";
// import Link from "next/link";
// import { useParams, usePathname } from "next/navigation";
// import { FaXbox } from "react-icons/fa6";
// import { useState, useEffect } from "react";
// import { Users, Package } from "lucide-react";
// import { GrConfigure } from "react-icons/gr";

// export default function Sidebar({ storeId }: { storeId: string | string[] }) {
//   const params = useParams();
//   const pathname = usePathname();
//   const [selectedItem, setSelectedItem] = useState<string>(
//     `/${params.storeId}`
//   );

//   useEffect(() => {
//     const currentPath = pathname || `/${params.storeId}`;
//     setSelectedItem(currentPath);
//   }, [pathname, params.storeId]);

//   const menuItems = [
//     { icon: TbDeviceAnalytics, href: `/${params.storeId}`, label: "Dashboard" },
//     { icon: TbCash, href: `/${params.storeId}/point-of-sale`, label: "POS" },
//     { icon: Package, href: `/${params.storeId}/products`, label: "Products" },
//     { icon: Users, href: `/${params.storeId}/sellers`, label: "Sellers" },
//   ];

//   const settingsItems = [
//     {
//       icon: TbAdjustmentsCog,
//       href: `/${params.storeId}/store-config`,
//       label: "Store Config",
//     },
//     {
//       icon: GrConfigure,
//       href: `/${params.storeId}/manage-readers`,
//       label: "Hardware",
//     },
//     {
//       icon: TbSettings,
//       href: `/${params.storeId}/settings`,
//       label: "Settings",
//     },
//   ];

//   return (
//     <aside className="absolute w-[50px] bg-sidebar h-full shadow-2xl border-opacity-50">
//       <div className="h-full flex flex-col justify-between py-2">
//         {/* Top Menu Items */}
//         <div className="flex flex-col items-center gap-3 justify-between">
//           <div className="p-2 rounded-md">
//             <FaXbox className="w-6 h-6 text-muted-foreground" />
//           </div>
//           {menuItems.map((item) => (
//             <Link
//               title={item.label}
//               key={item.href}
//               href={item.href}
//               onClick={() => setSelectedItem(item.href)}
//               className={`p-2 rounded-md transition-colors duration-200 ${
//                 selectedItem === item.href
//                   ? "bg-background"
//                   : "hover:bg-background"
//               }`}
//             >
//               <item.icon className="w-6 h-6 text-muted-foreground" />
//               <span className="sr-only">{item.label}</span>
//             </Link>
//           ))}
//         </div>
//         <div className="flex flex-col gap-3 items-center justify-between h-full">
//           {settingsItems.map((item) => (
//             <Link
//               key={item.href}
//               href={item.href}
//               title={item.label}
//               onClick={() => setSelectedItem(item.href)}
//               className={`p-2 rounded-md transition-colors duration-200 ${
//                 selectedItem === item.href
//                   ? "bg-background"
//                   : "hover:bg-background"
//               }`}
//             >
//               <item.icon className="w-6 h-6 text-muted-foreground" />
//               <span className="sr-only">{item.label}</span>
//             </Link>
//           ))}
//         </div>

//         {/* Bottom Menu Items */}
//       </div>
//     </aside>
//   );
// }
