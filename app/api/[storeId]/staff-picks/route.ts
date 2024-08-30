import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server"

import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined;
    const designerId = searchParams.get('designerId') || undefined;
    const sellerId = searchParams.get('sellerId') || undefined;
    const colorId = searchParams.get('colorId') || undefined;
    const sizeId = searchParams.get('sizeId') || undefined;
    const isFeatured = searchParams.get('isFeatured');
    const isOnSale = searchParams.get('isOnSale');

    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;


    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const staffPickedProducts = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        designerId,
        sellerId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isOnSale: true ,
        isArchived: false,
        ourPrice: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
      include: {
        images: true,
        category: true,
        designer: true,
        color: true,
        size: true,
        seller: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    // staffPickedProducts.filter(a, b) => a.isOnSale - b.isOnSale;
    return NextResponse.json(staffPickedProducts);
  } catch (error) {
    console.log('[PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
