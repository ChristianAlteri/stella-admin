import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import TheGrandExchangeComponent from "./components/client";

interface TheGrandExchangePageProps {
  params: {
    companyName: string;
  };
}

const TheGrandExchangePage: React.FC<TheGrandExchangePageProps> = async ({
  params,
}) => {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

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
        <TheGrandExchangeComponent company={company}/>
      </div>
    </div>
  );
};

export default TheGrandExchangePage;
