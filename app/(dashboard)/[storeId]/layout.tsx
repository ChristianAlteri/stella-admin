import NavBar from "@/components/NavBar";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { HomeIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { TbCash, TbDeviceAnalytics, TbFriends, TbSettings, TbTag } from "react-icons/tb";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
    include: {
      address: true,
    },
  });

  if (!store) {
    redirect("/");
  }

  return (
    //     <>
    //       <NavBar />
    //       <aside className="bg-red-400 w-[20px]">
    // HI
    //       {children}
    //       </aside>
    //     </>
    <div className="min-h-screen flex flex-col bg-slate-100">
      <NavBar />
      <div className="flex flex-1">
        <aside className="w-14 bg-slate-100 border">
        <TbDeviceAnalytics />
          <TbCash />
          <TbTag />
          <TbFriends />
          <TbSettings />
        </aside>
        <main className="flex-1 ">{children}</main>
      </div>
    </div>
  );
}
