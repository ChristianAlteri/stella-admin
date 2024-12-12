import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await prismadb.product.update({
      where: { id: params.productId },
      data: {
        createdAt: new Date(), // Set createdAt to current time
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    return NextResponse.json(
      { message: "Product createdAt reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[RESET_CREATED_AT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
