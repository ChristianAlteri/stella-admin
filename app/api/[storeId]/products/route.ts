import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

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
      images,
      isFeatured,
      isArchived,
      isCharity,
      material,
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

    if (!description) {
      return new NextResponse("Description is required", { status: 400 });
    }

    // if (!categoryId) {
    //   return new NextResponse("Category id is required", { status: 400 });
    // }

    // if (!colorId) {
    //   return new NextResponse("Color id is required", { status: 400 });
    // }

    if (!sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    console.log(params.storeId);

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });
    // console.log("storeByUserId", storeByUserId);

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
        // categoryId,
        // designerId,
        // colorId,
        // sizeId,
        // storeId: params.storeId,
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
    const categoryId = searchParams.get("categoryId") || undefined;
    const designerId = searchParams.get("designerId") || undefined;
    const sellerId = searchParams.get("sellerId") || undefined;
    const colorId = searchParams.get("colorId") || undefined;
    const sizeId = searchParams.get("sizeId") || undefined;
    const materialId = searchParams.get("materialId") || undefined;
    const conditionId = searchParams.get("conditionId") || undefined;
    const isFeatured = searchParams.get("isFeatured");
    const isOnSale = searchParams.get("isOnSale");
    const name = searchParams.get("productName") || undefined;
    const sort = searchParams.get("sort") || undefined;

    console.log("These are the parameters ur searching by", searchParams);

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

    console.log("sort", orderBy);

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
        name,
        isFeatured: isFeatured ? true : undefined,
        isOnSale: isOnSale ? true : undefined,
        isArchived: false,
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
      },
      orderBy,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
