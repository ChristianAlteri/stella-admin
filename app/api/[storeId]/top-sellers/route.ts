import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; name?: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || undefined;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const topSellers = await prismadb.seller.findMany({
      where: {
        storeId: params.storeId,
        instagramHandle: {
          contains: name,
          mode: 'insensitive',
        },
      },
      include: {
        billboard: true,
        products: {
          where: {
            isArchived: false,
          },
          include: {
            images: true,
            designer: true,
            seller: true,
            orderItems: true,
          },
        }
      },
      orderBy: {
        soldCount: 'desc'
      }
    });

    // console.log("topSellers", topSellers);
    return NextResponse.json(topSellers);
  } catch (error) {
    console.log('[topSellers_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};