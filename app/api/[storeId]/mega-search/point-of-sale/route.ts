import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const productName = searchParams.get("productName") || undefined;
    const isOnlineFilter = searchParams.get("isOnline") || undefined;
    const limit = parseInt(searchParams.get("limit") || "500", 10);


    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // Get products
    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        isArchived: false,
        isOnline: isOnlineFilter !== undefined ? isOnlineFilter === 'true' : undefined,
        OR: [
          // TODO: when we implement bar codes use the full UUID, right now the 4 digit code has a ≈0.398% chance of collision with full UUID's so we take the use of both at the same time. We are only using 4 digit atm because stellas store write it by hand on the tags
          // { id: productName }, // uuid
          { id: { endsWith: productName } }, // Last four digits of uuid
          { name: { contains: productName, mode: "insensitive" } },
        ],
      },
      include: {
        images: true,
        category: true,
        designer: true,
        seller: true,
      },
      orderBy: {
        createdAt: "desc" as Prisma.SortOrder,
      },
      take: limit,
    });

    // console.log("PRODUCTS",products);
    // Replace S3 URLs with CDN URLs
    const productsWithCDN = products.map(product => ({
      ...product,
      images: product.images.map(image => ({
        ...image,
        url: image.url.replace("stella-ecomm-media-bucket.s3.amazonaws.com", "d1t84xijak9ta1.cloudfront.net"),
      })),
    }));

    // console.log("API_MEGA_SEARCH products", productsWithCDN.length);
    return NextResponse.json(productsWithCDN);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
