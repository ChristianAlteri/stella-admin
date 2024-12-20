"use client";

import { Company, Store } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreIcon } from 'lucide-react';

interface CompanyStoreTilesProps {
  stores: Store[];
  company: Company | null;
}

const CompanyStoreTiles: React.FC<CompanyStoreTilesProps> = ({
  stores,
  company,
}) => {
  const router = useRouter();
  const handleRedirect = (storeId: string) => {
    router.push(`/${storeId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {stores.map((store) => (
        <Card
          key={store.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleRedirect(store.id)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{store.name}</CardTitle>
            {/* TODO: add things like store type and address */}
            <StoreIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Click to manage this store</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CompanyStoreTiles;


// "use client";

// import { Company, Store } from "@prisma/client";
// import { useRouter } from "next/navigation";

// interface CompanyStoreTilesProps {
//   stores: Store[];
//   company: Company | null;
// }

// const CompanyStoreTiles: React.FC<CompanyStoreTilesProps> = ({
//   stores,
//   company,
// }) => {
//   const router = useRouter();
//   const handleRedirect = (storeId: string) => {
//     router.push(`/${storeId}`);
//   };

//   return (
//     <>
//       <div className="grid grid-cols-2 gap-4">
//         {stores.map((store) => (
//           <button
//             key={store.id}
//             onClick={() => handleRedirect(store.id)}
//             className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/80 transition"
//           >
//             {store.name}
//           </button>
//         ))}
//       </div>
//     </>
//   );
// };

// export default CompanyStoreTiles;
