import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb";
import CompanySettingsForm from "./components/company-settings-form";


const CompanySettingsPage = async ({
  params
}: {
  params: { companyName: string }
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
        <CompanySettingsForm company={company} />
      </div>
    </div>
  );
}

export default CompanySettingsPage;