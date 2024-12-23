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

  return (
    <>{children}</>
  );
}
