import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server"

import prismadb from '@/lib/prismadb';
 
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
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

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
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

    const material = await prismadb.material.create({
      data: {
        name,
        value,
        storeId: params.storeId
      }
    });
  
    return NextResponse.json(material);
  } catch (error) {
    console.log('[material_POST]', error);
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

    const materials = await prismadb.material.findMany({
      where: {
        storeId: params.storeId
      }
    });
  
    return NextResponse.json(materials);
  } catch (error) {
    console.log('[material_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
