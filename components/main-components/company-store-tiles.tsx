"use client";

import { Store } from "@prisma/client";
import { useRouter } from "next/navigation";

interface CompanyStoreTilesProps {
  stores: Store[];
  singleStore: Store | null;
}

const CompanyStoreTiles: React.FC<CompanyStoreTilesProps> = ({
  stores,
  singleStore,
}) => {
  const router = useRouter();
  const handleRedirect = (storeId: string) => {
    router.push(`/${storeId}`);
  };

  return (
    <>
      <h1 className="text-lg font-bold mb-4">Welcome, {singleStore?.name}!</h1>

      <div className="grid grid-cols-2 gap-4">
        {stores.map((store) => (
          <button
            key={store.id}
            onClick={() => handleRedirect(store.id)}
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/80 transition"
          >
            {store.name}
          </button>
        ))}
      </div>
    </>
  );
};

export default CompanyStoreTiles;
