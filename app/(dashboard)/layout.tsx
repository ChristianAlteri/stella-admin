import NavBar from "@/components/main-components/nav-bar";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function MasterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string, companyName: string };
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }
  console.log("params", params);

  // TODO: we need to some how get the store still
  // let store = await prismadb.store.findFirst({
  //   where: {
  //     name: params.companyName,
  //     userId,
  //   },
  //   include: {
  //     address: true,
  //   },
  // });
  // console.log("store", store);

  // if (!store) {
  //   redirect("/");
  // }

  // const storeIdFromName = store.id;
  // console.log("storeIdFromName", storeIdFromName);

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      {/* <NavBar /> */}
      <div className="flex flex-1 p-2">
        <main className="flex-1 ml-[50px] mt-[50px] w-full">MASTER LAYOUT{children}</main>
      </div>
    </div>
  );
}
