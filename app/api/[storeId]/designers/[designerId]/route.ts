import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { designerId: string } }
) {
  try {
    if (!params.designerId) {
      return new NextResponse("Designer id is required", { status: 400 });
    }

    const designer = await prismadb.designer.findUnique({
      where: {
        id: params.designerId
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
      }
    });
  
    return NextResponse.json(designer);
  } catch (error) {
    console.log('[Designer_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { designerId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.designerId) {
      return new NextResponse("Designer id is required", { status: 400 });
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

    const designer = await prismadb.designer.delete({
      where: {
        id: params.designerId,
      }
    });
  
    return NextResponse.json(designer);
  } catch (error) {
    console.log('[DESIGNER_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { designerId: string, storeId: string } }
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

    if (!params.designerId) {
      return new NextResponse("Category id is required", { status: 400 });
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

    const designer = await prismadb.designer.update({
      where: {
        id: params.designerId,
      },
      data: {
        name,
        billboardId,
      }
    });
  
    return NextResponse.json(designer);
  } catch (error) {
    console.log('[DESIGNER_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
