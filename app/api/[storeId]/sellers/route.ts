import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";
import { createProfileInKlaviyo } from "@/actions/klaviyo/create-profile-in-klaviyo";
import { findProfileInKlaviyo } from "@/actions/klaviyo/find-profile-in-klaviyo";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const {
      instagramHandle,
      firstName,
      lastName,
      email,
      phoneNumber,
      shippingAddress,
      country,
      shoeSizeEU,
      topSize,
      bottomSize,
      billboardId,
      charityName,
      charityUrl,
      connectedAccountId,
      sellerType,
      storeName,
      description,
      consignmentRate,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
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

    const seller = await prismadb.seller.create({
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
      },
    });

    if (seller.email) {
      const profileExists = await findProfileInKlaviyo(seller.email);
      if (!profileExists) {
        const userKlaviyoProfile = await createProfileInKlaviyo(
          seller.storeName || "",
          seller.email || ""
        );
        console.log("[CREATE_SELLER_KLAVIYO_PROFILE]", userKlaviyoProfile);
      }
    }

    console.log("[CREATE_SELLER]", seller);
    return NextResponse.json(seller);
  } catch (error) {
    console.log("[SELLERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; name: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || undefined;
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const sellers = await prismadb.seller.findMany({
      where: {
        storeId: params.storeId,
        isArchived: false,
        instagramHandle: {
          contains: name,
          mode: "insensitive",
        },
      },
      include: {
        billboard: true,
        payouts: true,
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

    // console.log('[SELLER_GET] payout amount', sellers.map(seller => seller.payouts.map(payout => payout.amount)));
    return NextResponse.json(sellers);
  } catch (error) {
    console.log("[SELLER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
