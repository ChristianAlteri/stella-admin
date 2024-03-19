import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";

export async function GET(
  req: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    if (!params.materialId) {
      return new NextResponse("material id is required", { status: 400 });
    }

    const material = await prismadb.material.findUnique({
      where: {
        id: params.materialId
      }
    });
  
    return NextResponse.json(material);
  } catch (error) {
    console.log('[material_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { materialId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.materialId) {
      return new NextResponse("material id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const material = await prismadb.material.delete({
      where: {
        id: params.materialId
      }
    });
  
    return NextResponse.json(material);
  } catch (error) {
    console.log('[material_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { materialId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }


    if (!params.materialId) {
      return new NextResponse("material id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const material = await prismadb.material.update({
      where: {
        id: params.materialId
      },
      data: {
        name,
        value
      }
    });
  
    return NextResponse.json(material);
  } catch (error) {
    console.log('[material_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
