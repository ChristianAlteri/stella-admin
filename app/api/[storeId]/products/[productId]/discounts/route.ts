import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function OPTIONS(request: Request) {
  // Simple OK response for OPTIONS
  return new NextResponse(null, { status: 200 });
}

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const body = await req.json();
    const { productPrice, discountToApply } = body;

    const product = await prismadb.product.findUnique({
      where: { id: params.productId },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Determine the new price after applying the discount
    const newPrice = Number(product.ourPrice) * (1 - discountToApply / 100);

    // Update the product, ensuring `originalPrice` is set only if not already set
    const discountedProduct = await prismadb.product.update({
      where: { id: params.productId },
      data: {
        // originalPrice: product.originalPrice ?? product.ourPrice, // Keep the initial price as originalPrice
        originalPrice: (product.timesDiscounted ?? 0) < 1 ? product.ourPrice : product.originalPrice, // Update the product, ensuring `originalPrice` is set only if timesDiscounted < 1
        ourPrice: newPrice,
        isOnSale: true,
        timesDiscounted: { increment: 1 },
      },
    });

    console.log("discountedProduct", discountedProduct);
    return NextResponse.json(
      { message: "Product updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("[DISCOUNT_PATCH_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


// import { NextResponse } from "next/server";
// import prismadb from "@/lib/prismadb";

// export async function OPTIONS(request: Request) {
//   // Simple OK response for OPTIONS
//   return new NextResponse(null, { status: 200 });
// }


// export async function PATCH(
//   req: Request,
//   { params }: { params: { productId: string; storeId: string } }
// ) {
//   try {
//     const body = await req.json();
//     const { productPrice, discountToApply } = body;

//     const product = await prismadb.product.findUnique({
//       where: { id: params.productId },
//     });

//     if (!product) {
//       return new NextResponse("Product not found", { status: 404 });
//     }

//     // Apply discount on the current price (ourPrice)
//     const newPrice = Number(product.ourPrice) * (1 - discountToApply / 100);

//     const discountedProduct = await prismadb.product.update({
//       where: {
//         id: params.productId,
//       },
//       data: {
//         originalPrice: productPrice,
//         ourPrice: newPrice,
//         isOnSale: true,
//         timesDiscounted: { increment: 1 },
//       },
//     });

//     console.log("discountedProduct", discountedProduct);
//     return NextResponse.json(
//       { message: "Product updated successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.log("[DISCOUNT_PATCH_ERROR]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }
