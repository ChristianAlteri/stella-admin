import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function OPTIONS(request: Request) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  headers.set("Access-Control-Allow-Credentials", "true");

  return new NextResponse(null, { status: 204, headers });
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; orderId: string } }
) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId") || undefined;
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId is required" },
        { status: 400 }
      );
    }

    const orderItemsAssociatedWithOrder = await prismadb.orderItem.findMany({
      where: { orderId: orderId },
    });
    const order = await prismadb.order.findUnique({
      where: { id: orderItemsAssociatedWithOrder[0]?.orderId },
    });
    const uniqueProductIds = Array.from(new Set(orderItemsAssociatedWithOrder.map(item => item.productId)));
    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: uniqueProductIds,
        },
      },
      include: {
        images: true,
        designer: true,
        seller: true,
        size: true,
      },
    });

    // Construct the response
    const responseData = {
      success: true,
      orderId: orderItemsAssociatedWithOrder[0]?.orderId,
      order,
      products,
    };

    // console.log("responseData", responseData);
    return NextResponse.json(responseData, { headers });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
