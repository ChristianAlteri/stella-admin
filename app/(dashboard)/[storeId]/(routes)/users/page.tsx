import prismadb from "@/lib/prismadb";
import React from "react";
import { UserClient } from "./components/client";
import { cleanDecimals } from "@/lib/utils";

const UserPage = async ({ params }: { params: { storeId: string } }) => {
  const rawUser = await prismadb.user.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      orderHistory: {
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
      followingSeller: {
        include: {
          products: true,
        },
      },
      store: true,
      interactingStaff: true,
      likeList: true,
      clickList: true,
    },
  });
  const users = cleanDecimals(rawUser);

  const store = await prismadb.store.findUnique({
    where: {
      id: params.storeId,
    }
  })

  return (
    <div className="flex flex-col items-center justify-center w-full bg-secondary h-full">
      <div className="flex-1 space-y-4 p-8 pt-6 items-center justify-center w-2/3 h-full">
        <UserClient data={users} countryCode={store?.countryCode || 'GB'}/>
      </div>
    </div>
  );
};

export default UserPage;
