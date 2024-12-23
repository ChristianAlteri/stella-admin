"use client";

import { Company, Store } from "@prisma/client";
import { useStoreModal } from "@/hooks/use-store-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import CompanyStoreTiles from "@/components/main-components/company/company-store-tiles";
import CreateStoreModal from "@/components/main-components/store/create-store-modal";
import { BiHome } from "react-icons/bi";

interface CompanyHomePageProps {
  stores: Store[];
  company: Company;
}

const CompanyHomePageComponent: React.FC<CompanyHomePageProps> = ({
  stores,
  company,
}) => {
  const storeModal = useStoreModal();

  return (
    <>
      <Card className="w-full ">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center">
              <BiHome className="mr-2 h-6 w-6" />
              Welcome, {company?.name.toUpperCase()}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Manage your stores and create new ones from this dashboard.
            </p>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Stores</h2>
              <Button onClick={storeModal.onOpen} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create a Store
              </Button>
            </div>
          </div>

          <div className="flex mt-[50px] w-full">
            <CompanyStoreTiles stores={stores} company={company} />
          </div>
        </CardContent>
      </Card>
      <CreateStoreModal />
    </>
  );
};

export default CompanyHomePageComponent;

// "use client";

// import CompanyStoreTiles from "@/components/main-components/company/company-store-tiles";
// import CreateStoreModal from "@/components/main-components/store/create-store-modal";
// import { Separator } from "@/components/ui/separator";
// import { Card, CardHeader } from "@/components/ui/card";
// import { useStoreModal } from "@/hooks/use-store-modal";
// import { useEffect, useState } from "react";
// import { Company, Store } from "@prisma/client";
// import { Button } from "@/components/ui/button";
// import { PlusCircle } from "lucide-react";

// interface CompanyHomePageProps {
//   stores: Store[];
//   company: Company;
// }

// const CompanyHomePageComponent: React.FC<CompanyHomePageProps> = ({
//   stores,
//   company,
// }) => {
//   const storeModal = useStoreModal();

//   return (
//     <div>
//       <Card>
//         <CardHeader>
//           <h1 title={"Company Home Page"}>HELLO {company?.name}</h1>
//         </CardHeader>
//         <Separator />
//         <div className="flex-col bg-secondary md:w-full w-1/2">
//         <Button
//            onClick={storeModal.onOpen} // Open the modal when clicked
//             size="sm"
//           >
//             <PlusCircle className="mr-2 h-4 w-4" />
//             Create a Store
//           </Button>
//         </div>
//         <div className="flex flex-col bg-secondary md:w-full w-1/2 p-4">
//           {company && <CompanyStoreTiles stores={stores} company={company} />}
//         </div>
//         <CreateStoreModal />
//       </Card>
//     </div>
//   );
// };

// export default CompanyHomePageComponent;
