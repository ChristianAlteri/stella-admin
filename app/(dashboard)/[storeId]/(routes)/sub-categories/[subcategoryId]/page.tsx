import prismadb from "@/lib/prismadb";
import { SubcategoryForm } from "./components/subcategory-form";



const SubcategoryPage = async ({
  params
}: {
  params: { subcategoryId: string }
}) => {
  const subcategory = await prismadb.subcategory.findUnique({
    where: {
      id: params.subcategoryId
    }
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SubcategoryForm initialData={subcategory} />

      </div>
    </div>
  );
}

export default SubcategoryPage;
