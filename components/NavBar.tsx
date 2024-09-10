import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// import StoreSwitcher from "@/components/store-switcher";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import prismadb from "@/lib/prismadb";
import StoreSwitcher from "./store-switcher";
import { Input } from "./ui/input";

const Navbar = async () => {
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
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <StoreSwitcher items={stores} />
          <div className="flex justify-between pr-3 items-center space-x-5 flex-grow">
            <MainNav className="mx-6 flex-shrink-0" />
            <div className="flex-shrink w-64 overflow-hidden">
              <Input placeholder="Search" />
            </div>
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
