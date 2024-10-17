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
    <div className="w-full h-full">
      <Sidebar storeId={storeId} />
      <div className="flex h-12 items-center p-4 ml-[50px] bg-secondary">
        <StoreSwitcher items={stores} />
        <div className="flex-1 flex items-center justify-between w-2/3">
          <MainNav className="flex-1 w-full mr-4" />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
