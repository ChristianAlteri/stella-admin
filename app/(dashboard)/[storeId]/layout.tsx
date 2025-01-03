import NavBar from "@/components/main-components/nav-bar";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function StoresLayout({
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
    <div className="min-h-screen flex flex-col bg-secondary">
      <NavBar storeId={params.storeId} />
      <div className="flex flex-1 p-2">
        <main className="flex-1 ml-[50px] mt-[50px] w-full">{children}</main>
      </div>
    </div>
  );
}
