import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SetupLayout({ 
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  // If no clerk user then re direct to sign-up
  if (!userId) {
    redirect("/sign-in");
  }

  // TODO: Now try find if they have a company, if not then show the create company modal

 const company = await prismadb.company.findFirst({
    where: {
      userId,
    },
  });

  console.log("CLG company", company);
  console.log("CLG userId", userId);

  // if (company) {
  //   redirect(`/company/${company.name}`);
  // }

  // Find the store for the clerk user.
  const store = await prismadb.store.findFirst({
    where: {
      userId,
    },
  });

  console.log("CLG store", store);
  console.log("CLG userId", userId);
  // If the user has a store, redirect to the store page, otherwise show the create store modal.
  // if (store) {
  //   redirect(`/company/${store.name}`);
  //   // redirect(`/${store.id}`);
  // }

  return <>{children}</>;
}
