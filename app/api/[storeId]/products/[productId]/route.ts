import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

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
        color: true,
      }
    });
    console.log('[PRODUCT_GET]', product);
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_GET]', error);
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

    const product = await prismadb.product.delete({
      where: {
        id: productId
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
      images, 
      sellerId,
      isFeatured, 
      isArchived, 
      isCharity, 
      isOnSale, 
      material,
      measurements,
      likes,
      clicks } = body;
      
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    if (!sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
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
        material,
        measurements,
        likes,
        clicks,
        isFeatured,
        isArchived,
        isOnSale,
        isCharity,
        // categoryId,
        // designerId,
        // colorId,
        // sizeId,
        // sellerId,
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
        condition: {
          connect: {
            id: conditionId
          }
        },
        color: {
          connect: {
            id: colorId
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
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
