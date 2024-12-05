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

    const order = await prismadb.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
                designer: true,
                seller: true,
                size: true,
              },
            },
          },
        },
      },
    });
    // console.log("ORDER DETAILS", JSON.stringify(order));

    // Replace S3 URLs with CDN URLs in products' images
    // if (order) {
    //   order.orderItems.forEach((orderItem) => {
    //     orderItem.product.images.forEach((image) => {
    //       image.url = image.url.replace(
    //         "stella-ecomm-media-bucket.s3.amazonaws.com",
    //         "d1t84xijak9ta1.cloudfront.net"
    //       );
    //     });
    //   });
    // }

    // console.log("responseData", responseData);
    // return NextResponse.json(order, { headers });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
