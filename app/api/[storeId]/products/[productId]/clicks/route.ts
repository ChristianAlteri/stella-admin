// This is an example of a dedicated PATCH endpoint for updating likes
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

// CORS preflight request handling
// export async function OPTIONS(request: Request) {
//   const allowedOrigin = request.headers.get("origin");
//   const response = new NextResponse(null, {
//     status: 200,
//     headers: {
//       "Access-Control-Allow-Origin": allowedOrigin || "*",
//       "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
//       "Access-Control-Allow-Headers":
//         "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
//       "Access-Control-Max-Age": "86400",
//     },
//   });
//   return response;
// }

export async function OPTIONS(request: Request) {
    // Just return a simple OK response without setting any CORS headers.
    return new NextResponse(null, { status: 200 });
}

export async function PATCH(
    req: Request,
    { params }: { params: { productId: string, storeId: string } }
  ) {
    try {

      const body = await req.json();
      
      const { clicks } = body;
      

    const likedProduct = await prismadb.product.update({
        where: {
          id: params.productId
        },
        data: { clicks }
    });

        // console.log('[CLICKS_PATCH]', likedProduct);
      return new NextResponse("CLICKS updated successfully", { status: 200 });
    } catch (error) {
      console.log('[CLICKS_PATCH]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  }