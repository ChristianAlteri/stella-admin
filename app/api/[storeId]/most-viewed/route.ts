import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const designerId = searchParams.get('designerId') || undefined;
    const sellerId = searchParams.get('sellerId') || undefined;
    const colorId = searchParams.get('colorId') || undefined;
    const sizeId = searchParams.get('sizeId') || undefined;
    const isFeatured = searchParams.get('isFeatured');
    const isOnSale = searchParams.get('isOnSale');

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const clickedProducts = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        designerId,
        sellerId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isOnSale: isOnSale ? true : undefined,
        clicks: {
          gt: 0, // Greater than 0
        },
        isArchived: false,
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
        likes: 'desc', // Order by clicks in descending order
      }
    });
  
    return NextResponse.json(clickedProducts);
  } catch (error) {
    console.log('[PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
