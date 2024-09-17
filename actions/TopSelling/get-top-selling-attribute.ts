import prismadb from "@/lib/prismadb";

export const getTopSellingSizeCount = async (storeId: string) => {
  const topSellingSize = await prismadb.$queryRaw<{ name: string; count: bigint }[]>`
      SELECT s.name, COUNT(*) as count
      FROM "Order" o
      JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "Size" s ON p."sizeId" = s.id
      GROUP BY s.name
      ORDER BY count DESC
    `;

  return topSellingSize.map(item => ({
    name: item.name,
    count: Number(item.count),
  }));
};

export const getTopSellingColorCount = async (storeId: string) => {
  const topSellingColor = await prismadb.$queryRaw<{ name: string; count: bigint }[]>`
      SELECT c.name, COUNT(*) as count
      FROM "Order" o
      JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "Color" c ON p."colorId" = c.id
      GROUP BY c.name
      ORDER BY count DESC
    `;

  // Convert count from bigint to number
  return topSellingColor.map(item => ({
    name: item.name,
    count: Number(item.count),
  }));
};

export const getTopSellingMaterialCount = async (storeId: string) => {
  const topSellingMaterial = await prismadb.$queryRaw<{ name: string; count: bigint }[]>`
      SELECT c.name, COUNT(*) as count
      FROM "Order" o
      JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "Material" c ON p."materialId" = c.id
      GROUP BY c.name
      ORDER BY count DESC
    `;

  // Convert count from bigint to number
  return topSellingMaterial.map(item => ({
    name: item.name,
    count: Number(item.count),
  }));
};

export const getTopSellingGenderCount = async (storeId: string) => {
  const topSellingGender = await prismadb.$queryRaw<{ name: string; count: bigint }[]>`
      SELECT c.name, COUNT(*) as count
      FROM "Order" o
      JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "Gender" c ON p."genderId" = c.id
      GROUP BY c.name
      ORDER BY count DESC
    `;

  // Convert count from bigint to number
  return topSellingGender.map(item => ({
    name: item.name,
    count: Number(item.count),
  }));
};

export const getTopSellingSubcategoryCount = async (storeId: string) => {
  const topSellingSubcategory = await prismadb.$queryRaw<{ name: string; count: bigint }[]>`
      SELECT c.name, COUNT(*) as count
      FROM "Order" o
      JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "Subcategory" c ON p."subcategoryId" = c.id
      GROUP BY c.name
      ORDER BY count DESC
    `;

  // Convert count from bigint to number
  return topSellingSubcategory.map(item => ({
    name: item.name,
    count: Number(item.count),
  }));
};

export const getTopSellingConditionCount = async (storeId: string) => {
  const topSellingCondition = await prismadb.$queryRaw<{ name: string; count: bigint }[]>`
      SELECT c.name, COUNT(*) as count
      FROM "Order" o
      JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "Condition" c ON p."conditionId" = c.id
      GROUP BY c.name
      ORDER BY count DESC
    `;

  // Convert count from bigint to number
  return topSellingCondition.map(item => ({
    name: item.name,
    count: Number(item.count),
  }));
};