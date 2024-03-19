import prismadb from "@/lib/prismadb";
import { MaterialForm } from "./components/material-form";



const MaterialPage = async ({
  params
}: {
  params: { materialId: string }
}) => {
  const material = await prismadb.material.findUnique({
    where: {
      id: params.materialId
    }
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <MaterialForm initialData={material} />

      </div>
    </div>
  );
}

export default MaterialPage;
