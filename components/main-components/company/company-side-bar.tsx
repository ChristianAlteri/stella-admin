"use client";

import {
  TbCreditCard,
  TbDeviceDesktopAnalytics,
  TbSettings,
} from "react-icons/tb";
import Link from "next/link";
import { LuWarehouse } from "react-icons/lu";
import { useParams, usePathname } from "next/navigation";
import { FaXbox } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { RiExchangeFundsFill } from "react-icons/ri";


export default function CompanySideBarComponent({ companyName = "" }: { companyName?: string }) {
  const params = useParams();
  const pathname = usePathname();
  const [selectedItem, setSelectedItem] = useState<string>(
    `/${params.companyName}`
  );

  useEffect(() => {
    const currentPath = pathname || `/${params.companyName}`;
    setSelectedItem(currentPath);
  }, [pathname, params.companyName]);

  const menuItems = [
    { icon: TbDeviceDesktopAnalytics, href: `/company/${params.companyName}/dashboard`, label: "Dashboard" },
    { icon: LuWarehouse, href: `/company/${params.companyName}/warehouse`, label: "Warehouse" },
    { icon: RiExchangeFundsFill, href: `/company/${params.companyName}/the-grand-exchange`, label: "The Grand Exchange" },
  ];

  // const middleSectionItems = [
  //   {
  //     icon: TbLego,
  //     href: `/${params.companyName}/staff`,
  //     label: "Staff",
  //   },
  //   {
  //     icon: TbStar,
  //     href: `/${params.companyName}/users`,
  //     label: "Users",
  //   },
  // ];

  const settingsItems = [
    // {
    //   icon: TbAdjustmentsCog,
    //   href: `/${params.companyName}/store-config`,
    //   label: "Store Config",
    // },
    // {
    //   icon: GrConfigure,
    //   href: `/${params.companyName}/manage-readers`,
    //   label: "Hardware",
    // },
    {
      icon: TbSettings,
      href: `/company/${params.companyName}/settings`,
      label: "Settings",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 w-[50px] bg-sidebar h-full shadow-2xl border-opacity-50">
      <div className="h-full flex flex-col justify-between py-2">
        <div className="flex flex-col items-center gap-3">
          <Link 
          href={`/`}
          className="p-2 rounded-md">
            <FaXbox className="w-6 h-6 text-muted-foreground" />
          </Link>
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
          <div className="flex w-1/2">
            {/* <Separator /> */}
          </div>
          {/* {middleSectionItems.map((item) => (
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
          ))} */}
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
//   TbCreditCard,
//   TbDeviceAnalytics,
//   TbSettings,
//   TbStar,
//   TbTag,
// } from "react-icons/tb";
// import Link from "next/link";
// import { useParams, usePathname } from "next/navigation";
// import { FaXbox } from "react-icons/fa6";
// import { useState, useEffect } from "react";
// import { Users, Package } from "lucide-react";
// import { GrConfigure } from "react-icons/gr";
// import { Separator } from "../ui/separator";
// import { PiSmileyBold } from "react-icons/pi";
// import { TbLego } from "react-icons/tb";

// export default function Component({ companyName = "" }: { companyName?: string }) {
//   const params = useParams();
//   const pathname = usePathname();
//   const [selectedItem, setSelectedItem] = useState<string>(
//     `/${params.companyName}`
//   );

//   useEffect(() => {
//     const currentPath = pathname || `/${params.companyName}`;
//     setSelectedItem(currentPath);
//   }, [pathname, params.companyName]);

//   const menuItems = [
//     { icon: TbDeviceAnalytics, href: `/${params.companyName}`, label: "Dashboard" },
//     {
//       icon: TbCreditCard,
//       href: `/${params.companyName}/point-of-sale`,
//       label: "POS",
//     },
//     { icon: TbTag, href: `/${params.companyName}/products`, label: "Products" },
//     { icon: Users, href: `/${params.companyName}/sellers`, label: "Sellers" },
//   ];

//   const settingsItems = [
//     {
//       icon: TbAdjustmentsCog,
//       href: `/${params.companyName}/store-config`,
//       label: "Store Config",
//     },
//     {
//       icon: GrConfigure,
//       href: `/${params.companyName}/manage-readers`,
//       label: "Hardware",
//     },
//     {
//       icon: TbSettings,
//       href: `/${params.companyName}/settings`,
//       label: "Settings",
//     },
//   ];

//   return (
//     <aside className="fixed left-0 top-0 w-[50px] bg-sidebar h-full shadow-2xl border-opacity-50">
//       <div className="h-full flex flex-col justify-between py-2">
//         <div className="flex flex-col items-center gap-3">
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
//           <div className="flex w-1/2">
//             <Separator />
//           </div>
//           <Link
//             title="staff"
//             key="staff"
//             href="staff"
//             onClick={() => setSelectedItem(`/${params.companyName}/staff`)}
//             className={`p-2 rounded-md transition-colors duration-200 ${
//               selectedItem === `/${params.companyName}/staff`
//                 ? "bg-background"
//                 : "hover:bg-background"
//             }`}
//           >
//             <TbLego className="w-6 h-6 text-muted-foreground" />
//             <span className="sr-only">Staff</span>
//           </Link>
//           <Link
//             title="users"
//             key="users"
//             href="users"
//             onClick={() => setSelectedItem(`/${params.companyName}/users`)}
//             className={`p-2 rounded-md transition-colors duration-200 ${
//               selectedItem === `/${params.companyName}/users`
//                 ? "bg-background"
//                 : "hover:bg-background"
//             }`}
//           >
//             <TbStar className="w-6 h-6 text-muted-foreground" />
//             <span className="sr-only">Users</span>
//           </Link>
//         </div>
//         <div className="flex flex-col gap-3 items-center">
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
//       </div>
//     </aside>
//   );
// }
