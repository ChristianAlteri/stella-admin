import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb";
import SettingsForm from "./components/SettingsForm";
import axios from "axios";
import ReadersSettings from "../manage-readers/components/readers-settings";
import ManageStoreConnect from "./components/manage-store-connect-account";
import { sanitiseAddress } from "@/lib/utils";

// import { SettingsForm } from "./components/settings-form";

const SettingsPage = async ({
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

  const storeAddress = await prismadb.storeAddress.findFirst({
    where: {
      Store: {
        some: {
          id: params.storeId
        }
      }
    }
  })
  console.log("store", store);
  console.log("storeAddress", storeAddress);

  if (!store) {
    redirect('/');
  }

  return ( 
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        <SettingsForm initialData={store} storeAddress={storeAddress} />
        <ManageStoreConnect initialData={store} />
      </div>
    </div>
  );
}

export default SettingsPage;