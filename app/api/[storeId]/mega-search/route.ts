import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

// export async function GET(
//   req: Request,
//   { params }: { params: { storeId: string } }
// ) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const name = searchParams.get("name") || undefined;

//     if (!params.storeId) {
//       return new NextResponse("Store id is required", { status: 400 });
//     }

//     const [sellers, designers, categories] = await Promise.all([
//       prismadb.seller.findMany({
//         where: {
//           storeId: params.storeId,
//           instagramHandle: {
//             contains: name,
//             mode: "insensitive",
//           },
//         },
//         include: {
//           billboard: true,
//           products: {
//             where: {
//               isArchived: false,
//             },
//             include: {
//               images: true,
//               designer: true,
//               seller: true,
//               category: true,
//               size: true,
//               color: true,
//             },
//           },
//         },
//       }),
//       prismadb.designer.findMany({
//         where: {
//           storeId: params.storeId,
//           name: {
//             contains: name,
//             mode: "insensitive",
//           },
//         },
//         include: {
//           billboard: true,
//           products: {
//             where: {
//               isArchived: false,
//             },
//             include: {
//               images: true,
//               designer: true,
//               seller: true,
//               category: true,
//               size: true,
//               color: true,
//             },
//           },
//         },
//       }),
//       prismadb.category.findMany({
//         where: {
//           storeId: params.storeId,
//           name: {
//             contains: name,
//             mode: "insensitive",
//           },
//         },
//         include: {
//           billboard: true,
//           products: {
//             where: {
//               isArchived: false,
//             },
//             include: {
//               images: true,
//               designer: true,
//               seller: true,
//               category: true,
//               size: true,
//               color: true,
//             },
//           },
//         },
//       }),
//     ]);

//     return NextResponse.json({ sellers, designers, categories });
//   } catch (error) {
//     console.log("[SEARCH_GET]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const productName = searchParams.get("productName") || undefined;
    const designerName = searchParams.get("designerName") || undefined;

    // console.log("searchParams", searchParams);

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }


    const sellers = await prismadb.seller.findMany({
      where: {
        storeId: params.storeId,
        instagramHandle: {
          contains: productName,
          mode: "insensitive",
        },
      },
    });
    const sellerIds = sellers.map(seller => seller.id);


    const designers = await prismadb.designer.findMany({
      where: {
        storeId: params.storeId,
        name: {
          contains: productName,
          mode: "insensitive",
        },
      },
    });
    const designerIds = designers.map(designer => designer.id);


    const categories = await prismadb.category.findMany({
      where: {
        storeId: params.storeId,
        name: {
          contains: productName,
          mode: "insensitive",
        },
      },
    });
    const categoryIds = categories.map(category => category.id);


    const materials = await prismadb.material.findMany({
      where: {
        storeId: params.storeId,
        name: {
          contains: productName,
          mode: "insensitive",
        },
      },
    });
    const materialIds = materials.map(material => material.id);


    const subcategories = await prismadb.subcategory.findMany({
      where: {
        storeId: params.storeId,
        name: {
          contains: productName,
          mode: "insensitive",
        },
      },
    });
    const subcategoryIds = subcategories.map(subcategory => subcategory.id);


    const colors = await prismadb.color.findMany({
      where: {
        storeId: params.storeId,
        name: {
          contains: productName,
          mode: "insensitive",
        },
      },
    });
    const colorIds = colors.map(color => color.id);


    const sizes = await prismadb.size.findMany({
      where: {
        storeId: params.storeId,
        name: {
          contains: productName,
          mode: "insensitive",
        },
      },
    });
    const sizeIds = sizes.map(size => size.id);


    const conditions = await prismadb.condition.findMany({
      where: {
        storeId: params.storeId,
        name: {
          contains: productName,
          mode: "insensitive",
        },
      },
    });
    const conditionIds = conditions.map(condition => condition.id);


    const genders = await prismadb.gender.findMany({
      where: {
        storeId: params.storeId,
        name: {
          contains: productName,
          mode: "insensitive",
        },
      },
    });
    const genderIds = genders.map(gender => gender.id);

    // Get products
    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        isArchived: false,
        OR: [
          { designerId: { in: designerIds } },
          { sellerId: { in: sellerIds } },
          { categoryId: { in: categoryIds } },
          { subcategoryId: { in: subcategoryIds } },
          { colorId: { in: colorIds } },
          { sizeId: { in: sizeIds } },
          { conditionId: { in: conditionIds } },
          { genderId: { in: genderIds } },
          { materialId: { in: materialIds } },
          { name: { contains: productName, mode: "insensitive" } },
        ],
      },
      include: {
        images: true,
        category: true,
        designer: true,
        color: true,
        size: true,
        condition: true,
        material: true,
        seller: true,
        subcategory: true,
        gender: true,
      },
      orderBy: {
        createdAt: "desc" as Prisma.SortOrder,
      },
    });

    // console.log(products);
    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
