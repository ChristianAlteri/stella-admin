import prismadb from "@/lib/prismadb";

export const getTopSellingColorCount = async (storeId: string) => {
  const topSellingColor = await prismadb.$queryRaw`
      SELECT c.name, COUNT(*) as count
      FROM "Order" o
      JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "Color" c ON p."colorId" = c.id
      GROUP BY c.name
      ORDER BY count DESC
    `;

  return topSellingColor;
};

