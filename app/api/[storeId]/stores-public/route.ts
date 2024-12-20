import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { convertDecimalFields } from "@/lib/utils";

// export async function GET(req: Request) {
export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { searchParams } = new URL(req.url);
  const storeIdFromOnlineStore =
    searchParams.get("storeIdFromOnlineStore") || params.storeId;
  try {

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    const storeId = storeIdFromOnlineStore || params.storeId;

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
      },
      include: {
        address: true,
      },
    });

    // Convert Decimal fields to numbers
    const storeWithConvertedDecimals = convertDecimalFields(store);
    return NextResponse.json(storeWithConvertedDecimals);
  } catch (error) {
    console.log("[API_PUBLIC_STORE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
