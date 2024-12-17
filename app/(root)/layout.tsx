import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: {
      userId,
    },
  });
  console.log("CLG store", store);
  console.log("CLG userId", userId);

  // If the user has a store, redirect to the store page, otherwise show the create store modal.
  // TODO: We need to show the create company modal
  if (store) {
    redirect(`/${store.id}`);
  }

  return <>{children}</>;
}
