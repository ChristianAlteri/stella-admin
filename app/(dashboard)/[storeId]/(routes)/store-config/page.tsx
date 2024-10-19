import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb";


const StoreConfigPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId
    }
  });

  if (!store) {
    redirect('/');
  }

  return ( 
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        {/* StoreConfig sfc goes here  */}

      </div>
    </div>
  );
}

export default StoreConfigPage;