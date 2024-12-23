import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server"

export async function GET(
  req: Request,
  { params }: { params: { genderId: string } }
) {
  try {
    if (!params.genderId) {
      return new NextResponse("gender id is required", { status: 400 });
    }

    const gender = await prismadb.gender.findUnique({
      where: {
        id: params.genderId
      }
    });
  
    return NextResponse.json(gender);
  } catch (error) {
    console.log('[gender_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { genderId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.genderId) {
      return new NextResponse("gender id is required", { status: 400 });
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

    const gender = await prismadb.gender.update({
      where: {
        id: params.genderId
      },
      data: {
        isArchived: true,
      }
    });
  
    return NextResponse.json(gender);
  } catch (error) {
    console.log('[gender_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { genderId: string, storeId: string } }
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

  


    if (!params.genderId) {
      return new NextResponse("gender id is required", { status: 400 });
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

    const gender = await prismadb.gender.update({
      where: {
        id: params.genderId
      },
      data: {
        name,
        value
      }
    });
  
    return NextResponse.json(gender);
  } catch (error) {
    console.log('[gender_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
