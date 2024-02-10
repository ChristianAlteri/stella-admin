import prismadb from "@/lib/prismadb";
import { DesignerForm } from "./components/designer-form";



const DesignerPage = async ({
  params
}: {
  params: { designerId: string, storeId: string }
}) => {
  const designer = await prismadb.designer.findUnique({
    where: {
      id: params.designerId
    }
  });

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId
    }
  })

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DesignerForm billboards={billboards} initialData={designer} />
      </div>
    </div>
  );
}

export default DesignerPage;
