import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();
    const {
      email,
      name,
      staffType,
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
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const staff = await prismadb.staff.create({
      data: {
        storeId: params.storeId,
        email,
        name,
        staffType,
        // totalSales,
        targetTotalSales,
        // totalTransactionCount,
        targetTotalTransactionCount,
        // totalItemsSold,
        targetTotalItemsSold,
        // returningCustomers,
        targetReturningCustomers,
      },
    });
    console.log("[CREATE_STAFF]", staff);
    return NextResponse.json(staff);
  } catch (error) {
    console.log("[STAFF_POST]", error);
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

    const staff = await prismadb.staff.findMany({
      where: {
        storeId: params.storeId,
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                product: {
                  include: {
                    category: true,
                    designer: true,
                    subcategory: true,
                  },
                },
              },
            },
          },
        },
        customers: true,
        store: true,
      },
    });
    // console.log("STAFF", staff[0]);

    return NextResponse.json(staff);
  } catch (error) {
    console.log("[STAFF_GET]", error);
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
