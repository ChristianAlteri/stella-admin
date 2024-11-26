import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        images: true,
        category: true,
        designer: true,
        seller: true,
        size: true,
        condition: true,
        material: true,
        color: true,
        gender: true,
        subcategory: true,
      }
    });
    // Replace S3 URLs with CDN URLs
    const productWithCDN = {
      ...product,
      images: product?.images.map((img) => ({
        ...img,
        url: img.url.replace("stella-ecomm-media-bucket.s3.amazonaws.com", "d1t84xijak9ta1.cloudfront.net"),
      })),
    };

    console.log("API_GET_PRODUCT_BY_ID", productWithCDN);
    return NextResponse.json(productWithCDN);
  } catch (error) {
    // console.log('[PRODUCT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const { userId } = auth();
    const { productId } = params;
    console.log('[PRODUCT_ID]', productId);
    console.log('[PARAMS]', params);

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 });
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
    // Perform soft-delete by setting isArchived to true
    const product = await prismadb.product.update({
      where: {
        id: productId
      },
      data: {
        isArchived: true,
      },
    });
    console.log('[PRODUCT_DELETE]', product);
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { 
      name, 
      ourPrice, 
      retailPrice, 
      categoryId, 
      designerId, 
      description, 
      colorId, 
      sizeId, 
      conditionId, 
      materialId,
      subcategoryId,
      genderId,
      images, 
      sellerId,
      isFeatured, 
      isArchived, 
      isCharity, 
      isOnSale, 
      isHidden,
      isOnline,
      measurements,
      likes,
      clicks } = body;
      
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
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

    await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        description,
        ourPrice,
        retailPrice,
        measurements,
        likes,
        clicks,
        isFeatured,
        isArchived,
        isOnSale,
        isCharity,
        isHidden,
        isOnline,
        images: {
          deleteMany: {},
        },
        category: {
          connect: {
            id: categoryId
          }
        },
        designer: {
          connect: {
            id: designerId
          }
        },
        size: {
          connect: {
            id: sizeId
          }
        },
        ...(conditionId ? { condition: { connect: { id: conditionId } } } : {}),
        ...(colorId ? { color: { connect: { id: colorId } } } : {}),
        ...(materialId ? { material: { connect: { id: materialId } } } : {}),
        ...(genderId ? { gender: { connect: { id: genderId } } } : {}),
        subcategory: {
          connect: {
            id: subcategoryId
          }
        },
        seller: {
          connect: {
            id: sellerId
          }
        },
      },
    });

    const product = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        images: {
          createMany: {
            data: [
              ...images.map((image: { url: string }) => image),
            ],
          },
        },
      },
    })
    // console.log('[PRODUCT_PATCH]', product);
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
