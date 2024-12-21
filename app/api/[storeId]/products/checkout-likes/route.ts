import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; productName: string } }
) {
  try {
    let orderBy = {
      createdAt: "desc" as Prisma.SortOrder,
    };
    const { searchParams } = new URL(req.url);
    const isOnline = searchParams.get("isOnline") === "true" ? true : undefined;
    const isArchived = searchParams.get("isArchived") === "true" ? true : false;
    const storeIdFromOnlineStore =
      searchParams.get("storeIdFromOnlineStore") || undefined;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeId = storeIdFromOnlineStore || params.storeId;

    const products = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        // isFeatured,
        // isOnSale,
        isOnline: isOnline,
        isArchived: isArchived,
      },
      include: {
        images: true,
        category: true,
        designer: true,
        size: true,
      },
      orderBy,
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

    console.log("products", products);
    return NextResponse.json(productsWithCDNAndFormatted);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}



export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    // 1. Parse the request body
    const body = await req.json();
    const { productIds, isOnline, isArchived, storeIdFromOnlineStore } = body;

    // 2. Basic validation
    if (!params.storeId && !storeIdFromOnlineStore) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // 3. Determine which store ID to use
    const storeId = storeIdFromOnlineStore || params.storeId;

    // 3.5. If productIds is empty or not provided, return an empty array
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 4. Build the WHERE clause
    const whereClause: Prisma.ProductWhereInput = {
      storeId,
      // If `isOnline` or `isArchived` are provided
      isOnline: isOnline === undefined ? true : Boolean(isOnline),
      isArchived: isArchived === undefined ? false : Boolean(isArchived),
    };

    // 5. Filter by product IDs if provided
    if (Array.isArray(productIds) && productIds.length > 0) {
      whereClause.id = {
        in: productIds,
      };
    }

    // 6. Query the database
    const products = await prismadb.product.findMany({
      where: whereClause,
      include: {
        images: true,
        category: true,
        designer: true,
        size: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 7. Format data (prices, CDN URLs, etc.)
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

    // 8. Return the filtered and formatted products
    return NextResponse.json(productsWithCDNAndFormatted, { status: 200 });
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
