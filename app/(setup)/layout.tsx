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

  const company = await prismadb.company.findFirst({
    where: {
      userId,
    },
  });
  if (company) {
    redirect(`/company/${company.name}`);
  }

  // Find the store for the clerk user.
  // const store = await prismadb.store.findFirst({
  //   where: {
  //     userId,
  //   },
  // });

  // If the user has a store, redirect to the store page, otherwise show the create store modal.
  // if (store) {
  //   redirect(`/company/${store.name}`);
  //   // redirect(`/${store.id}`);
  // }

  return <>{children}</>;
}
