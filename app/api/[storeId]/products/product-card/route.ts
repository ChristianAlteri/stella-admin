import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";
import { convertDecimalFields, parseBooleanParam } from "@/lib/utils";

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
        subcategory: {
          connect: {
            id: subcategoryId,
          },
        },
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
    let orderBy: any;
    const { searchParams } = new URL(req.url);
    const storeIdFromOnlineStore =
      searchParams.get("storeIdFromOnlineStore") || undefined;

    const isOnline = parseBooleanParam(searchParams.get("isOnline"));
    const isArchived = parseBooleanParam(searchParams.get("isArchived"));
    const isOnSale = parseBooleanParam(searchParams.get("isOnSale"));

    const sort = searchParams.get("sort") || undefined;

    if (sort === "most-liked") {
      orderBy = {
        likes: "desc" as Prisma.SortOrder,
      };
    } else if (sort === "most-viewed") {
      orderBy = {
        clicks: "desc" as Prisma.SortOrder,
      };
    } else {
      orderBy = {
        createdAt: "desc" as Prisma.SortOrder,
      };
    }

    console.log("orderBy", orderBy);

    // const categoryId = searchParams.get("categoryId") || undefined;
    // const designerId = searchParams.get("designerId") || undefined;
    // const sellerId = searchParams.get("sellerId") || undefined;
    // const colorId = searchParams.get("colorId") || undefined;
    // const sizeId = searchParams.get("sizeId") || undefined;
    // const materialId = searchParams.get("materialId") || undefined;
    // const conditionId = searchParams.get("conditionId") || undefined;
    // const genderId = searchParams.get("genderId") || undefined;
    // const subcategoryId = searchParams.get("subcategoryId") || undefined;
    // const isFeatured =
    //   searchParams.get("isFeatured") === "true" ? true : undefined;
    // const isOnSale = searchParams.get("isOnSale") === "true" ? true : undefined;
    // const isHidden = searchParams.get("isHidden") === "true" ? true : undefined;

    // const isCharity =
    //   searchParams.get("isCharity") === "true" ? true : undefined;

    // const name = searchParams.get("productName") || undefined;

    // const minPrice = searchParams.get("minPrice")
    //   ? parseFloat(searchParams.get("minPrice")!)
    //   : undefined;
    // const maxPrice = searchParams.get("maxPrice")
    //   ? parseFloat(searchParams.get("maxPrice")!)
    //   : undefined;

    

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "4", 10);

    const skip = (page - 1) * limit;
    console.log("pagination", { page, limit, skip });
    console.log("searchParams", searchParams);

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // if (sort === "low-to-high") {
    //   orderBy = {
    //     ourPrice: "asc" as Prisma.SortOrder,
    //   };
    // } else if (sort === "high-to-low") {
    //   orderBy = {
    //     ourPrice: "desc" as Prisma.SortOrder,
    //   };
    // } else {
    //   orderBy = {
    //     createdAt: "desc" as Prisma.SortOrder,
    //   };
    // }

    const storeId = storeIdFromOnlineStore || params.storeId;

    const products = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        // categoryId,
        // designerId,
        // sellerId,
        // colorId,
        // sizeId,
        // conditionId,
        // materialId,
        // genderId,
        // subcategoryId,
        // name: {
        //   contains: name,
        //   mode: "insensitive",
        // },
        // isFeatured,
        // isOnSale,
        // isCharity,
        // isHidden,
        isOnline: isOnline,
        isOnSale: isOnSale,
        isArchived: isArchived,
        // ourPrice: {
        //   gte: minPrice,
        //   lte: maxPrice,
        // },
      },
      include: {
        images: true,
        category: true,
        designer: true,
        size: true,
        // color: true,
        // condition: true,
        // material: true,
        // seller: true,
        // subcategory: true,
        // gender: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    const productsWithCDNAndFormatted = products.map((product) => ({
      ...product,
      ourPrice: product.ourPrice.toNumber(),
      retailPrice: product.retailPrice ? product.retailPrice.toNumber() : null,
      originalPrice: product.originalPrice
        ? product.originalPrice.toNumber()
        : null,
      images: product.images.map((image) => ({
        ...image,
        url: image.url.replace(
          "stella-ecomm-media-bucket.s3.amazonaws.com",
          "d1t84xijak9ta1.cloudfront.net"
        ),
      })),
    }));

    // Get the total count of matching products
    const totalProducts = await prismadb.product.count({
      where: {
        storeId: storeId,
        isOnline: isOnline,
        isArchived: isArchived,
        // isOnSale: isOnSale,
      },
    });
    console.log("totalProducts", totalProducts);
    return NextResponse.json({
      products: productsWithCDNAndFormatted, // Current page products
      total: totalProducts, // Total number of matching products
      page, // Current page
      limit, // Items per page
    });
  } catch (error) {
    console.log("[PRODUCTS_CARD_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
