import prismadb from "@/lib/prismadb";
import React from "react";
import { StaffClient } from "./components/client";

const StaffPage = async ({ params }: { params: { storeId: string } }) => {
  const staff = await prismadb.staff.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      orders: {
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true,
                  designer: true,
                  subcategory: true,
                },
              },
            },
          },
        },
      },
      customers: true,
      store: true,
    },
  });

  const store = await prismadb.store.findUnique({
    where: {
      id: params.storeId,
    }
  })

  return (
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        <StaffClient data={staff} countryCode={store?.countryCode || "GB"} />
      </div>
    </div>
  );
};

export default StaffPage;
