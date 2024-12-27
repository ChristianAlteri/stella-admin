import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { DashboardClient } from "./components/client";

interface DashboardPageProps {
  params: {
    companyName: string;
  };
}
const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const company = await prismadb.company.findFirst({
    where: {
      name: params.companyName,
    },
  });
  const stores = await prismadb.store.findFirst({
    where: {
      companyId: company?.id,
    },
  });

  const countryCode = stores?.countryCode || "";

  if (!company) {
    redirect("/");
  }

  return (
    // <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
    // {/* <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full"> */}
    <div className="p-3">
      <DashboardClient company={company} countryCode={countryCode} />
    </div>
    // </div>
  );
};

export default DashboardPage;
