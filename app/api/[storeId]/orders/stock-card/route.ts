import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { convertDecimalsToNumbers } from "@/lib/utils";
import { parseISO, startOfDay, endOfDay } from "date-fns";

const logKey = "API_ORDER_STOCK_CARD";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const url = new URL(req.url);
    const { userId } = auth();
    const dateParam = url.searchParams.get("date");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    let date = new Date();
    if (dateParam) {
      date = parseISO(dateParam);
    }

    const orders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
        isPaid: true,
        createdAt: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
      include: {
        Payout: true,
        soldByStaff: true,
        orderHistoryUsers: true,
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
                seller: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const plainOrders = convertDecimalsToNumbers(orders);

    const payouts = await prismadb.payout.findMany({
      where: {
        storeId: params.storeId,
        createdAt: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
      orderBy: { createdAt: "desc" },
      include: { seller: true },
    });
    const plainPayouts = convertDecimalsToNumbers(payouts);
    // console.log("plainPayouts", plainPayouts[0]);

    return NextResponse.json({
      orders: plainOrders,
      payouts: plainPayouts,
    });
  } catch (error) {
    console.log(`${logKey}`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
