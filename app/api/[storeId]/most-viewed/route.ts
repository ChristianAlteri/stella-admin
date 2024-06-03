import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server"

import prismadb from '@/lib/prismadb';
import { Prisma } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    console.log("searchParams", searchParams);
    const categoryId = searchParams.get("categoryId") || undefined;
    const designerId = searchParams.get("designerId") || undefined;
    const sellerId = searchParams.get("sellerId") || undefined;
    const colorId = searchParams.get("colorId") || undefined;
    const sizeId = searchParams.get("sizeId") || undefined;
    const materialId = searchParams.get("materialId") || undefined;
    const conditionId = searchParams.get("conditionId") || undefined;
    const genderId = searchParams.get("genderId") || undefined;
    const subcategoryId = searchParams.get("subcategoryId") || undefined;
    const isFeatured = searchParams.get("isFeatured");
    const isOnSale = searchParams.get("isOnSale");
    const isHidden = searchParams.get("isHidden");
    const isCharity = searchParams.get("isCharity");
    const name = searchParams.get("productName") || undefined;
    const sort = searchParams.get("sort") || undefined;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

   
    let orderBy;
    if (sort === "low-to-high") {
      orderBy = {
        ourPrice: "asc" as Prisma.SortOrder,
      };
    } else if (sort === "high-to-low") {
      orderBy = {
        ourPrice: "desc" as Prisma.SortOrder,
      };
    } else {
      orderBy = {
        createdAt: "desc" as Prisma.SortOrder,
      };
    }

    // console.log("sort", orderBy);

    const clickedProducts = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        designerId,
        sellerId,
        colorId,
        sizeId,
        conditionId,
        materialId,
        genderId,
        subcategoryId,
        name,
        isFeatured: isFeatured ? true : undefined,
        isOnSale: isOnSale ? true : undefined,
        isCharity: isCharity ? true : undefined,
        isHidden: isHidden ? true : undefined,
        isArchived: false,
        clicks: {
          gt: 0, // Greater than 0
        },
      },
      include: {
        images: true,
        category: true,
        designer: true,
        color: true,
        size: true,
        condition: true,
        material: true,
        seller: true,
        subcategory: true,
        gender: true,
      },
      orderBy,
    });
  
    return NextResponse.json(clickedProducts);
  } catch (error) {
    console.log('[PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
