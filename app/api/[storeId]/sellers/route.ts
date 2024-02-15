import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';
 
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, billboardId, productId, designerId, categoryId, instagramHandle } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // if (!billboardId) {
    //   return new NextResponse("Designer Id is required", { status: 400 });
    // }
    // if (!productId) {
    //   return new NextResponse("productId is required", { status: 400 });
    // }
    // if (!designerId) {
    //   return new NextResponse("designerId is required", { status: 400 });
    // }
    // if (!categoryId) {
    //   return new NextResponse("categoryId is required", { status: 400 });
    // }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const seller = await prismadb.seller.create({
      data: {
        name,
        instagramHandle,
        billboardId,
        storeId: params.storeId,
      }
    });
  
    return NextResponse.json(seller);
  } catch (error) {
    console.log('[SELLERS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const sellers = await prismadb.seller.findMany({
      where: {
        storeId: params.storeId
      },
      include: {
        products: true,
        designers: true,
        categories: true,
        billboard: true,
      },
    });
  
    return NextResponse.json(sellers);
  } catch (error) {
    console.log('[SELLER_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
