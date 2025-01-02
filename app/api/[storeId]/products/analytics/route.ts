import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; productName: string } }
) {
  try {
    let orderBy = {
      createdAt: "desc" as Prisma.SortOrder,
    };
    const { searchParams } = new URL(req.url);
    const storeIdFromOnlineStore =
      searchParams.get("storeIdFromOnlineStore") || undefined;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeId = storeIdFromOnlineStore || params.storeId;

    const products = await prismadb.product.findMany({
      where: {
        storeId: storeId,
      },
      orderBy,
    });

    // console.log("products", products);
    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

