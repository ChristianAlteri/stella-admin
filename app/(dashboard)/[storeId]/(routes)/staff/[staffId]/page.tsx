import prismadb from "@/lib/prismadb";

import { StaffForm } from "./components/staff-form";

const StaffPage = async ({
  params
}: {
  params: { staffId: string, storeId: string }
}) => {

  const staff = await prismadb.staff.findUnique({
    where: {
      id: params.staffId,
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
        <StaffForm 
          countryCode={store?.countryCode || "GB"}
          initialData={staff || undefined}
        />
      </div>
    </div>
  );
}

export default StaffPage;
