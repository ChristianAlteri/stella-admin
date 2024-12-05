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

export async function PATCH(req: Request, { params }: { params: { storeId: string } }) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");

  try {
    // Parse request body
    const body = await req.json();
    const { orderId, hasBeenDispatched } = body;


    if (!orderId || hasBeenDispatched === undefined) {
      return NextResponse.json(
        { success: false, message: "orderId and hasBeenDispatched are required" },
        { status: 400 }
      );
    }

    // Update the order
    const order = await prismadb.order.update({
      where: { id: orderId },
      data: {
        hasBeenDispatched,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
