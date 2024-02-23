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

    const { name, billboardId } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!billboardId) {
      return new NextResponse("Designer Id is required", { status: 400 });
    }

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

    const designer = await prismadb.designer.create({
      data: {
        name,
        billboardId,
        storeId: params.storeId,
      }
    });
  
    return NextResponse.json(designer);
  } catch (error) {
    console.log('[DESIGNER_POST]', error);
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

    const designer = await prismadb.designer.findMany({
      where: {
        storeId: params.storeId
      },
      include: {
        billboard: true,
        products: {
          include: {
            images: true,
            designer: true,
            seller: true,
            category: true,
          },
        }
      },
    });
  
    return NextResponse.json(designer);
  } catch (error) {
    console.log('[DESIGNER_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
