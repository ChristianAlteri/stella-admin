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
      isOnline,
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
        isOnline,
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
        seller: {
          connect: {
            id: sellerId,
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
        // condition: {
        //   connect: {
        //     id: conditionId,
        //   },
        // },
        ...(conditionId ? { condition: { connect: { id: conditionId } } } : {}),
        // material: {
        //   connect: {
        //     id: materialId,
        //   },
        // },
        ...(materialId ? { material: { connect: { id: materialId } } } : {}),
        // color: {
        //   connect: {
        //     id: colorId,
        //   },
        // },
        ...(colorId ? { color: { connect: { id: colorId } } } : {}),
        ...(subcategoryId ? { subcategory: { connect: { id: subcategoryId } } } : {}),
        // gender: {
        //   connect: {
        //     id: genderId,
        //   },
        // },
        ...(genderId ? { gender: { connect: { id: genderId } } } : {}),
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
    const storeIdFromOnlineStore =
      searchParams.get("storeIdFromOnlineStore") || undefined;
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
    const isOnline = searchParams.get("isOnline") === "true" ? true : undefined;
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

    const isArchived = searchParams.get("isArchived") === "true" ? true : false;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

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

    const storeId = storeIdFromOnlineStore || params.storeId;

    const products = await prismadb.product.findMany({
      where: {
        storeId: storeId,
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
        isOnline,
        isArchived: isArchived,
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
      skip,
      take: limit,
    });

    const productsWithCDN = products.map((product) => ({
      ...product,
      images: product.images.map((image) => ({
        ...image,
        url: image.url.replace(
          "stella-ecomm-media-bucket.s3.amazonaws.com",
          "d1t84xijak9ta1.cloudfront.net"
        ),
      })),
    }));

    return NextResponse.json(productsWithCDN);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
