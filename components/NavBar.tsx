import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect, useParams } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import prismadb from "@/lib/prismadb";
import StoreSwitcher from "./store-switcher";
import Sidebar from "./side-bar";

interface NavbarProps {
  storeId: string;
}

const Navbar: React.FC<NavbarProps> = async ({ storeId }) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId,
    },
  });

  return (
    <div className="w-full h-full sticky top-0 z-50">
      <div className="absolute w-full flex h-[50px] items-center p-4  bg-secondary">
        <div className="ml-[50px]">
        <StoreSwitcher items={stores} />
        </div>
        <div className="flex-1 flex items-center justify-center w-full mr-[100px]">
          <MainNav className="flex-1 w-full " />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <Sidebar storeId={storeId} />
    </div>
  );
};

export default Navbar;
