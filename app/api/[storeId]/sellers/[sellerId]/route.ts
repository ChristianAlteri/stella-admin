import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";


export async function GET(
  req: Request,
  { params }: { params: { sellerId: string } }
) {
  try {
    if (!params.sellerId) {
      return new NextResponse("Seller id is required", { status: 400 });
    }

    const seller = await prismadb.seller.findUnique({
      where: {
        id: params.sellerId,
      },
      include: {
        billboard: true,
        payouts: {
          where: { sellerId: params.sellerId },
          orderBy: { createdAt: 'desc' },
        },
        products: {
          include: {
            images: true,
            designer: true,
            seller: true,
            category: true,
            size: true,
            color: true,
          },
        },
      },
    });

    const orders = await prismadb.orderItem.findMany({
      where: {
        sellerId: params.sellerId,
      },
      distinct: ['orderId'], // Fetch distinct orders based on the orderId
      include: {
        order: true,
        product: true,
      },
    });

    return NextResponse.json({seller, orders});
  } catch (error) {
    console.log("[seller_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { sellerId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.sellerId) {
      return new NextResponse("Seller id is required", { status: 400 });
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

    // Perform soft-delete by setting isDeleted to true
    const seller = await prismadb.seller.update({
      where: {
        id: params.sellerId,
      },
      data: {
        isArchived: true,
      },
    });

    return NextResponse.json(seller);
  } catch (error) {
    console.log("[Seller_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { sellerId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const {
      billboardId,
      firstName,
      lastName,
      email,
      phoneNumber,
      shippingAddress,
      country,
      instagramHandle,
      charityName,
      charityUrl,
      shoeSizeEU,
      topSize,
      bottomSize,
      connectedAccountId,
      sellerType,
      storeName,
      description,
      consignmentRate,
      isConnectedToStripe
    } = body;

    // console.log("BODY", body);
    // console.log("INSIDE PATCH Seller Id", params.sellerId);
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.sellerId) {
      return new NextResponse("sellerId id is required", { status: 400 });
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

    const seller = await prismadb.seller.update({
      where: {
        id: params.sellerId,
      },
      data: {
        instagramHandle,
        firstName,
        lastName,
        email,
        phoneNumber,
        shippingAddress,
        country,
        billboardId,
        charityName,
        charityUrl,
        shoeSizeEU,
        topSize,
        bottomSize,
        storeId: params.storeId,
        stripe_connect_unique_id: connectedAccountId,
        sellerType,
        storeName,
        description,
        consignmentRate,
        isConnectedToStripe,
      },
    });
    console.log("SELLER", seller);
    return NextResponse.json(seller);
  } catch (error) {
    console.log("[SELLER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
