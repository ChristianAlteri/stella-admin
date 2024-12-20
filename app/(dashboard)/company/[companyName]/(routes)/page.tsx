import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import CompanyHomePageComponent from "@/components/main-components/company/company-home-page";

interface CompanyHomePageProps {
  params: {
    companyName: string;
  };
}

const CompanyHomePage: React.FC<CompanyHomePageProps> = async ({ params }) => {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const stores = userId
    ? await prismadb.store.findMany({
        where: {
          userId: userId,
        },
        include: {
          address: true,
        },
      })
    : [];

  const company = await prismadb.company.findFirst({
    where: {
      name: params.companyName,
    },
  });

  if (!company) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        <CompanyHomePageComponent company={company} stores={stores} />
      </div>
    </div>
  );
};

export default CompanyHomePage;
