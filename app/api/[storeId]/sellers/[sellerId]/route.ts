import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { sellerId: string } }
) {
  try {
    if (!params.sellerId) {
      return new NextResponse("Seller id is required", { status: 400 });
    }

    const seller = await prismadb.seller.findUnique({
      where: {
        id: params.sellerId
      },
      include: {
        billboard: true,
        products: {
          include: {
            images: true,
            designer: true,
            seller: true,
            category: true,
            size: true,
            color: true,
          },
        }
      }
    });
  
    return NextResponse.json(seller);
  } catch (error) {
    console.log('[seller_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { sellerId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.sellerId) {
      return new NextResponse("Seller id is required", { status: 400 });
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

    const seller = await prismadb.seller.delete({
      where: {
        id: params.sellerId,
      }
    });
  
    return NextResponse.json(seller);
  } catch (error) {
    console.log('[Seller_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { sellerId: string, storeId: string } }
) {
  try {   
    const { userId } = auth();

    const body = await req.json();
    
    const { name, billboardId } = body;
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!billboardId) {
      return new NextResponse("Billboard ID is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.sellerId) {
      return new NextResponse("sellerId id is required", { status: 400 });
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

    const seller = await prismadb.seller.update({
      where: {
        id: params.sellerId,
      },
      data: {
        name,
        billboardId
      }
    });
  
    return NextResponse.json(seller);
  } catch (error) {
    console.log('[SELLER_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
