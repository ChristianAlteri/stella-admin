import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

const logKey = "API_COMPANY_WAREHOUSE";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");
    const { userId } = auth();
    console.log("companyId", companyId);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!companyId) {
      return new NextResponse("Company ID is required", { status: 400 });
    }

    const company = await prismadb.company.findFirst({
      where: {
        id: companyId,
      },
    });

    const stores = await prismadb.store.findMany({
      where: {
        companyId: companyId,
      },
      include: {
        products: true,
      },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.log("[API_COMPANY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
