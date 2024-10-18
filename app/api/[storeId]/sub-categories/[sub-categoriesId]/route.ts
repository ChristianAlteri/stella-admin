import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server"

export async function GET(
  req: Request,
  { params }: { params: { subcategoryId: string } }
) {
  try {
    if (!params.subcategoryId) {
      return new NextResponse("subcategory id is required", { status: 400 });
    }

    const subcategory = await prismadb.subcategory.findUnique({
      where: {
        id: params.subcategoryId
      }
    });
  
    return NextResponse.json(subcategory);
  } catch (error) {
    console.log('[subcategory_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { subcategoryId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.subcategoryId) {
      return new NextResponse("subcategory id is required", { status: 400 });
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

    const subcategory = await prismadb.subcategory.delete({
      where: {
        id: params.subcategoryId
      }
    });
  
    return NextResponse.json(subcategory);
  } catch (error) {
    console.log('[subcategory_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { subcategoryId: string, storeId: string } }
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




    if (!params.subcategoryId) {
      return new NextResponse("subcategory id is required", { status: 400 });
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

    const subcategory = await prismadb.subcategory.update({
      where: {
        id: params.subcategoryId
      },
      data: {
        name,
        value
      }
    });
  
    return NextResponse.json(subcategory);
  } catch (error) {
    console.log('[subcategory_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
