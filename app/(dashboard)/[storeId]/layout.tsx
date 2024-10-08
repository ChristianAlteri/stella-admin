import NavBar from "@/components/NavBar";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import Decimal from "decimal.js";
import { redirect } from "next/navigation";

// // Utility function to convert Decimals to numbers
// function convertDecimals(obj: any): any {
//   if (obj === null || obj === undefined) {
//     return obj;
//   }
//   if (typeof obj === "object") {
//     for (const key in obj) {
//       if (obj[key] instanceof Decimal) {
//         obj[key] = obj[key].toNumber();
//       } else if (typeof obj[key] === "object") {
//         obj[key] = convertDecimals(obj[key]);
//       }
//     }
//   }
//   return obj;
// }

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
    include: {
      address: true,
    },
  });

  // TODO: Fix this decimal shit. Maybe just make the type INT in schema than multiply to a Decimal
  // store = convertDecimals(store);


  if (!store) {
    redirect("/");
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
