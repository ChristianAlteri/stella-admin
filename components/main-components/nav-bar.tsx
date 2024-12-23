import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect, useParams } from "next/navigation";
import { MainNav } from "@/components/main-components/main-nav";
import { ThemeToggle } from "@/components/main-components/theme-toggle";
import prismadb from "@/lib/prismadb";
import StoreSwitcher from "./store/store-switcher";
import StoreSideBarComponent from "./store/store-side-bar";
import CompanySideBarComponent from "./company/company-side-bar";

interface NavbarProps {
  storeId?: string;
  companyName?: string;
}

const Navbar: React.FC<NavbarProps> = async ({ storeId, companyName }) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // All the stores the clerk user has access to.
  const stores = await prismadb.store.findMany({
    where: {
      userId,
    },
  });
  const company = await prismadb.company.findMany({
    where: {
      userId,
    },
  });

  return (
    <div className="w-full h-full sticky top-0 z-50">
      <div className="absolute w-full flex h-[50px] items-center p-4  bg-secondary">
        <div className="ml-[50px]">
        {storeId ? (
          <StoreSwitcher items={stores} />
        ) : (
          <div className="text-black w-full font-bold ">{(companyName?.toUpperCase() || company[0].name.toUpperCase())}</div>
        )}
        </div>
        <div className="flex-1 flex items-center justify-center w-full mr-[100px]">
          <MainNav className="flex-1 w-full " />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
      {storeId ? (
        <StoreSideBarComponent storeId={storeId} />
      ) : (
        <CompanySideBarComponent companyName={companyName} />
      )}
    </div>
  );
};

export default Navbar;
