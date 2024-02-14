import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { CategoryColumn } from "./components/columns"
import { CategoryClient } from "./components/client";

const CategoriesPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      billboard: true,
      products: true,
      // order: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // console.log("CATEGORIES", categories);

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    billboardLabel: item.billboard?.label,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
    imageUrl: item.billboard?.imageUrl,
    productsUrl: `/api/${params.storeId}/categories/products`,
    ordersUrl: `/api/${params.storeId}/categories/orders`,
    categoryId: item.id,
    storeId: item.storeId,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryClient data={formattedCategories} />
      </div>
    </div>
  );
};

export default CategoriesPage;
