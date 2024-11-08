import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

// Fetch staff data
export async function GET(
  req: Request,
  { params }: { params: { staffId: string } }
) {
  try {
    if (!params.staffId) {
      return new NextResponse("Staff id is required", { status: 400 });
    }

    const staff = await prismadb.staff.findUnique({
      where: {
        id: params.staffId,
      },
      include: {
        orders: true,
        orderItems: true,
        customers: true,
        store: true,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.log("[STAFF_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Soft-delete staff by setting isArchived to true
export async function DELETE(
  req: Request,
  { params }: { params: { staffId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.staffId) {
      return new NextResponse("Staff id is required", { status: 400 });
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

    const staff = await prismadb.staff.update({
      where: {
        id: params.staffId,
      },
      data: {
        isArchived: true,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.log("[STAFF_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Update or increment specific fields for staff
export async function PATCH(
  req: Request,
  { params }: { params: { staffId: string; storeId: string } }
) {
  console.log("[INFO] Entering PATCH route for staff update");
  try {
    const { userId } = auth();
    const body = await req.json();
    console.log("[INFO] User ID:", userId);
    console.log("[INFO] Request body:", JSON.stringify(body));
    console.log("[INFO] Params:", params);

    const {
      name,
      email,
      staffType,
      incrementTotalSales,
      incrementTotalTransactionCount,
      incrementTotalItemsSold,
      incrementReturningCustomers,
      totalSales,
      targetTotalSales,
      totalTransactionCount,
      targetTotalTransactionCount,
      totalItemsSold,
      targetTotalItemsSold,
      returningCustomers,
      targetReturningCustomers,
    } = body;

    if (!userId) {
      console.error("[ERROR] Unauthenticated request");
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.staffId) {
      console.error("[ERROR] Staff ID is missing in the request");
      return new NextResponse("Staff id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });
    console.log("[INFO] Store found for user ID:", storeByUserId);

    if (!storeByUserId) {
      console.error("[ERROR] Unauthorized access, store not found for user");
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const updateData: Prisma.StaffUpdateInput = {
      name,
      email,
      staffType,
      totalSales,
      targetTotalSales,
      totalTransactionCount,
      targetTotalTransactionCount,
      totalItemsSold,
      targetTotalItemsSold,
      returningCustomers,
      targetReturningCustomers,
    };
    console.log("[INFO] Initial update data:", updateData);

    if (incrementTotalSales) {
      updateData.totalSales = { increment: incrementTotalSales };
      console.log("[INFO] Incrementing totalSales by:", incrementTotalSales);
    }
    if (incrementTotalTransactionCount) {
      updateData.totalTransactionCount = { increment: incrementTotalTransactionCount };
      console.log("[INFO] Incrementing totalTransactionCount by:", incrementTotalTransactionCount);
    }
    if (incrementTotalItemsSold) {
      updateData.totalItemsSold = { increment: incrementTotalItemsSold };
      console.log("[INFO] Incrementing totalItemsSold by:", incrementTotalItemsSold);
    }
    if (incrementReturningCustomers) {
      updateData.returningCustomers = { increment: incrementReturningCustomers };
      console.log("[INFO] Incrementing returningCustomers by:", incrementReturningCustomers);
    }

    console.log("[INFO] Final update data:", updateData);

    const staff = await prismadb.staff.update({
      where: {
        id: params.staffId,
      },
      data: updateData,
    });
    console.log("[INFO] Staff record updated:", staff);

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_PATCH] Internal error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

