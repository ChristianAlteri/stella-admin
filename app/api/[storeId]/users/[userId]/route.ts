import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

// GET route to fetch user details by user ID
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    if (!params.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: {
        id: params.userId,
      },
      include: {
        store: true,
        account: true,
        interactingStaff: true,
        likeList: true,
        clickList: true,
        orderHistory: true,
        purchaseHistory: true,
        followingSeller: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET] Internal error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE route to soft-delete a user by setting isArchived to true
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string; storeId: string } }
) {
  try {
    const { userId: authUserId } = auth();

    if (!authUserId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.userId || !params.storeId) {
      return new NextResponse("User ID and Store ID are required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: authUserId,
      },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const user = await prismadb.user.update({
      where: {
        id: params.userId,
      },
      data: {
        isArchived: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_DELETE] Internal error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH route to update user details or increment specific fields
export async function PATCH(
  req: Request,
  { params }: { params: { userId: string; storeId: string } }
) {
  try {
    const { userId: authUserId } = auth();
    const body = await req.json();

    if (!authUserId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.userId || !params.storeId) {
      return new NextResponse("User ID and Store ID are required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: authUserId,
      },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const {
      name,
      email,
      postalCode,
      phoneNumber,
      incrementTotalPurchases,
      incrementTotalItemsPurchased,
      incrementTotalTransactionCount,
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

    if (incrementTotalPurchases) {
      updateData.totalPurchases = { increment: incrementTotalPurchases };
    }
    if (incrementTotalItemsPurchased) {
      updateData.totalItemsPurchased = { increment: incrementTotalItemsPurchased };
    }
    if (incrementTotalTransactionCount) {
      updateData.totalTransactionCount = { increment: incrementTotalTransactionCount };
    }

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
