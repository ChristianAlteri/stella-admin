import prismadb from "@/lib/prismadb";

import { UserForm } from "./components/user-form";

const UserPage = async ({
  params
}: {
  params: { userId: string, storeId: string }
}) => {

  const user = await prismadb.user.findUnique({
    where: {
      id: params.userId,
    },
  });

  const store = await prismadb.store.findUnique({
    where: {
      id: params.storeId,
    },
  })


  return ( 
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        <UserForm 
          countryCode={store?.countryCode || "GB"}
          initialData={user || undefined}
        />
      </div>
    </div>
  );
}

export default UserPage;
