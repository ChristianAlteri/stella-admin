import NavBar from "@/components/NavBar";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


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
    <>
      <NavBar />
      {children}
    </>
  );
}
