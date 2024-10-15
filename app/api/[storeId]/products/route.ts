import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();
    console.log("body", body);

    const {
      name,
      ourPrice,
      retailPrice,
      categoryId,
      designerId,
      description,
      sellerId,
      colorId,
      sizeId,
      conditionId,
      materialId,
      subcategoryId,
      genderId,
      images,
      isFeatured,
      isArchived,
      isCharity,
      isHidden,
      measurements,
      likes,
      clicks,
      isOnSale,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!ourPrice) {
      return new NextResponse("Price is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const product = await prismadb.product.create({
      // @ts-ignore
      data: {
        name,
        description,
        ourPrice,
        retailPrice,
        measurements,
        likes,
        clicks,
        isCharity,
        isFeatured,
        isArchived,
        isOnSale,
        isHidden,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
        store: {
          connect: {
            id: storeByUserId.id,
          },
        },
        category: {
          connect: {
            id: categoryId,
          },
        },
        designer: {
          connect: {
            id: designerId,
          },
        },
        size: {
          connect: {
            id: sizeId,
          },
        },
        condition: {
          connect: {
            id: conditionId,
          },
        },
        material: {
          connect: {
            id: materialId,
          },
        },
        color: {
          connect: {
            id: colorId,
          },
        },
        subcategory: {
          connect: {
            id: subcategoryId,
          },
        },
        gender: {
          connect: {
            id: genderId,
          },
        },
        seller: {
          connect: {
            id: sellerId,
          },
        },
      },
    });
    // console.log('[PRODUCTS_POST]', product);
    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; productName: string } }
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
    const isFeatured =
      searchParams.get("isFeatured") === "true" ? true : undefined;
    const isOnSale = searchParams.get("isOnSale") === "true" ? true : undefined;
    const isHidden = searchParams.get("isHidden") === "true" ? true : undefined;
    const isCharity =
      searchParams.get("isCharity") === "true" ? true : undefined;

    const name = searchParams.get("productName") || undefined;
    const sort = searchParams.get("sort") || undefined;

    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;

    // const isArchived = searchParams.get("isArchived") === "true" ? true : undefined;
    const isArchived = searchParams.get("isArchived") === "true" ? true : false;

    // console.log("searchParams", searchParams);


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

    const products = await prismadb.product.findMany({
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
        name: {
          contains: name,
          mode: "insensitive",
        },
        isFeatured,
        isOnSale,
        isCharity,
        isHidden,
        isArchived: isArchived,
        // isArchived: isArchived ?? false,
        ourPrice: {
          gte: minPrice,
          lte: maxPrice,
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

    // console.log("API CALL products", products);
    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
