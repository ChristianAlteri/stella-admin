import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; name: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || undefined;
    // console.log("SELLER SEARCH", searchParams);
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
          include: {
            images: true,
            designer: true,
            seller: true,
            // category: true,
            // size: true,
            // color: true,
            orderItems: true,
          },
        }
      },
    });

    // TODO: Add a count of sold products to each seller rather than have to calculate it based on isArchived
    const sellersWithArchivedCount = topSellers.map(seller => {
      const archivedCount = seller.products.filter(product => product.isArchived).length;
      return { ...seller, archivedCount };
    });
    console.log("sellersWithArchivedCount", sellersWithArchivedCount);
    const sortedSellers = sellersWithArchivedCount.sort((a, b) => b.archivedCount - a.archivedCount);
    return NextResponse.json(sortedSellers);
  } catch (error) {
    console.log('[topSellers_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
