
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";
import { createProfileInKlaviyo } from "@/actions/klaviyo/create-profile-in-klaviyo";

// POST route to create a new user
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const {
      email,
      postalCode,
      phoneNumber,
      name,
    } = body;

    const hashedPassword = await bcrypt.hash(email, 12);

    // Create the new user
    const user = await prismadb.user.create({
      data: {
        name,
        email,
        postalCode,
        phoneNumber,
        hashedPassword,
        storeId: params.storeId,
      },
    });
    const promoCode = user.name?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const userKlaviyoProfile = await createProfileInKlaviyo(
      user.name || '',
      user.email,
      promoCode || ''
    );

    console.log("API_USER_POST user", user);
    console.log("API_USER_POST userKlaviyoProfile", userKlaviyoProfile);
    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_POST] Internal error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("store ID is required", { status: 400 });
    }

    const users = await prismadb.user.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        store: true,
        account: true,
        interactingStaff: true,
        likeList: true,
        clickList: true,
        orderHistory: {
          include: {
            orderItems: true,
          },
        },
        purchaseHistory: true,
        followingSeller: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!users) {
      return new NextResponse("User not found", { status: 404 });
    }
    // console.log("USERS", users[0]);

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USER_GET] Internal error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH route to update user details
export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    if (!params.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const {
      name,
      email,
      postalCode,
      phoneNumber,
      totalPurchases,
      totalItemsPurchased,
      totalTransactionCount,
    } = body;

    const updateData: Prisma.UserUpdateInput = {
      name,
      email,
      postalCode,
      phoneNumber,
      totalPurchases,
      totalItemsPurchased,
      totalTransactionCount,
    };

    // Update the user data
    const user = await prismadb.user.update({
      where: {
        id: params.userId,
      },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PATCH] Internal error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
