"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { convertDecimalsToNumbers, currencyConvertor } from "@/lib/utils";
import { Category, Designer, Product, Seller } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { RiErrorWarningLine } from "react-icons/ri";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { TbFaceId, TbFaceIdError } from "react-icons/tb";

// Custom Toast Error
const toastError = (message: string) => {
  toast.error(message, {
    style: {
      background: "white",
      color: "black",
    },
    icon: <TbFaceIdError size={30} />,
  });
};
// Custom Toast Success
const toastSuccess = (message: string) => {
  toast.error(message, {
    style: {
      background: "white",
      color: "green",
    },
    icon: <TbFaceId size={30} />,
  });
};

export type ProductWithRelations = Product & {
  seller?: Seller;
  designer?: Designer;
  category?: Category;
};

interface OldStockProps {
  countryCode: string;
}

const OldStock: React.FC<OldStockProps> = ({ countryCode }) => {
  const currencySymbol = currencyConvertor(countryCode);
  const router = useRouter();
  const params = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isOldestFirst, setIsOldestFirst] = useState(true);
  const [frontendProducts, setFrontendProducts] = useState<
    ProductWithRelations[] | null
  >(null);
  const [discounts, setDiscounts] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState<"6-weeks" | "8-weeks">("6-weeks");

  // Helper function to handle discount change
  const handleDiscountChange = (productId: string, value: number) => {
    setDiscounts((prevDiscounts) => ({
      ...prevDiscounts,
      [productId]: value,
    }));
  };

  // Helper function to filter products by weeks range
  const filterOldStock = (
    products: ProductWithRelations[],
    weeksBackStart: number,
    weeksBackEnd?: number,
    maxDiscounts?: number
  ) => {
    const now = new Date();
    const startThreshold = new Date(
      now.setDate(now.getDate() - weeksBackStart * 7)
    );

    let filteredProducts = products.filter((product) => {
      const createdAt = new Date(product.createdAt);

      // Products older than weeksBackStart
      if (createdAt < startThreshold) {
        // If weeksBackEnd is defined, filter products within this range
        if (weeksBackEnd) {
          const endThreshold = new Date(
            now.setDate(now.getDate() - weeksBackEnd * 7)
          );
          return createdAt >= endThreshold;
        }
        return true; // No end limit, include all older products
      }
      return false;
    });

    // Filter by timesDiscounted
    filteredProducts = filteredProducts.filter(
      (product) => (product.timesDiscounted ?? 0) <= (maxDiscounts ?? Infinity)
    );

    return filteredProducts;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`/api/${params.storeId}/products`, {
          params: { isArchived: false },
        });

        const processedData = convertDecimalsToNumbers(response.data);
        setFrontendProducts(processedData);
      } catch (error) {
        console.error("Error fetching products for old stock:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [params.storeId]);

  const filteredProducts =
    activeTab === "6-weeks"
      ? frontendProducts
        ? filterOldStock(frontendProducts, 6, 8, 0) // 6-8 weeks old products, not discounted more than 0 times
        : []
      : frontendProducts
      ? filterOldStock(frontendProducts, 8, undefined, 1) // Products older than 8 weeks, discounted 1 or fewer times
      : [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (isOldestFirst) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const applyDiscount = async (productId: string) => {
    try {
      const defaultDiscount = activeTab === "6-weeks" ? 50 : 30;
      const discountToApply = discounts[productId] || defaultDiscount;
      const productToDiscount = frontendProducts?.find(
        (p) => p.id === productId
      );
      if (!productToDiscount) return;

      const response = await axios.patch(
        `/api/${params.storeId}/products/${productId}/discounts`,
        {
          productPrice: productToDiscount.ourPrice,
          discountToApply: discountToApply,
        }
      );

      if (response.status === 200) {
        toastSuccess("Discount applied successfully");
      } else {
        toastError(`Error applying discount: ${response.data}`);
      }
    } catch (error: any) {
      toastError(`Failed to apply discount: ${error.data}`);
    }
  };

  const resetDate = async (productId: string) => {
    try {
      const response = await axios.post(
        `/api/${params.storeId}/products/${productId}/reset-date`
      );
      if (response.status === 200) {
        toastSuccess("Product date reset successfully");
        // Optionally refresh the products list
        const updatedProducts = frontendProducts?.map((p) =>
          p.id === productId ? { ...p, createdAt: new Date() } : p
        );
        setFrontendProducts(updatedProducts || null);
      } else {
        toastError("Failed to reset product date");
      }
    } catch (error) {
      toastError("Error resetting product date");
    }
  };

  return (
    <>
      <div className="flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="text-md font-bold flex items-center gap-2">
            Stock Older Than {activeTab === "6-weeks" ? "6 Weeks" : "8 Weeks"}:
            <RiErrorWarningLine className="text-orange-300 h-5 w-5" />
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOldestFirst(!isOldestFirst)}
          >
            {isOldestFirst ? "Show Latest First" : "Show Oldest First"}
          </Button>
        </div>
        <Tabs
          defaultValue="6-weeks"
          onValueChange={(val) => setActiveTab(val as "6-weeks" | "8-weeks")}
        >
          <TabsList>
            <TabsTrigger value="6-weeks">6 Weeks</TabsTrigger>
            <TabsTrigger value="8-weeks">8 Weeks</TabsTrigger>
          </TabsList>

          <TabsContent value="6-weeks">
            <ScrollArea className="flex-grow w-full flex-col h-[200px]">
              {sortedProducts.length === 0 ? (
                <div className="justify-center items-center text-sm text-muted-foreground w-full">
                  No products older than 6 weeks
                </div>
              ) : (
                <table className="w-full text-sm text-left text-muted-foreground">
                  <thead className="text-xs uppercase bg-gray-50 sticky top-0 rounded-md">
                    <tr className="rounded-md">
                      <th className="px-2 py-2">Product Name</th>
                      <th className="px-2 py-2">Seller</th>
                      <th className="px-2 py-2">Designer</th>
                      <th className="px-2 py-2">Category</th>
                      <th className="px-2 py-2">Price</th>
                      <th className="px-2 py-2">Date Created</th>
                      <th className="px-2 py-2">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-100 rounded-md hover:cursor-pointer"
                      >
                        <td
                          className="px-2 py-2 hover:underline hover:cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/${params.storeId}/products/${product.id}/details`
                            )
                          }
                        >
                          {product.name}
                        </td>
                        <td
                          className="px-2 py-2 hover:underline hover:cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/${params.storeId}/sellers/${product.sellerId}/details`
                            )
                          }
                        >
                          {product.seller?.storeName ??
                            product.seller?.instagramHandle}
                        </td>
                        <td className="px-2 py-2 hover:underline hover:cursor-pointer">
                          {product.designer?.name ?? "N/A"}
                        </td>
                        <td className="px-2 py-2 hover:underline hover:cursor-pointer">
                          {product.category?.name ?? "N/A"}
                        </td>
                        <td className="px-2 py-2">
                          {currencySymbol}
                          {product.ourPrice.toString()}
                        </td>
                        <td className="px-4 py-4 flex flex-row gap-1 items-center justify-center">
                          <span className="text-sm">
                            {Math.floor(
                              (Number(new Date()) -
                                Number(new Date(product.createdAt))) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            days ago
                          </span>
                          <button
                            className="text-xs text-blue-500 hover:underline hover:cursor-pointer"
                            onClick={() => resetDate(product.id)}
                          >
                            Reset
                          </button>
                        </td>

                        <th className="px-4 py-2">
                          <td className="flex flex-row items-center gap-1">
                            <input
                              type="number"
                              placeholder="% Amount"
                              className="w-10 border rounded-md text-xs text-muted-foreground p-1"
                              value={discounts[product.id] || 50}
                              min={1}
                              max={99}
                              onChange={(e) => {
                                const value = Math.min(
                                  Math.max(
                                    parseInt(e.target.value, 10) || 0,
                                    1
                                  ),
                                  99
                                );
                                handleDiscountChange(product.id, value);
                              }}
                            />
                            <button
                              className="text-xs text-red-500 hover:underline hover:cursor-pointer"
                              onClick={() => applyDiscount(product.id)}
                            >
                              Apply
                            </button>
                          </td>
                        </th>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="8-weeks">
            <ScrollArea className="flex-grow w-full flex-col h-[200px]">
              {sortedProducts.length === 0 ? (
                <div className="text-sm text-muted-foreground w-full">
                  No products older than 8 weeks
                </div>
              ) : (
                <table className="w-full text-sm text-left text-muted-foreground">
                  <thead className="text-xs uppercase bg-gray-50 sticky top-0 rounded-md">
                    <tr className="rounded-md">
                      <th className="px-2 py-2">Product Name</th>
                      <th className="px-2 py-2">Seller</th>
                      <th className="px-2 py-2">Designer</th>
                      <th className="px-2 py-2">Category</th>
                      <th className="px-2 py-2">Price</th>
                      <th className="px-2 py-2">Date Created</th>
                      <th className="px-2 py-2">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-100 rounded-md hover:cursor-pointer"
                      >
                        <td
                          className="px-2 py-2 hover:underline hover:cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/${params.storeId}/products/${product.id}/details`
                            )
                          }
                        >
                          {product.name}
                        </td>
                        <td
                          className="px-2 py-2 hover:underline hover:cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/${params.storeId}/sellers/${product.sellerId}/details`
                            )
                          }
                        >
                          {product.seller?.storeName ??
                            product.seller?.instagramHandle}
                        </td>
                        <td className="px-2 py-2 ">
                          {product.designer?.name ?? "N/A"}
                        </td>
                        <td className="px-2 py-2 ">
                          {product.category?.name ?? "N/A"}
                        </td>
                        <td className="px-2 py-2">
                          {currencySymbol}
                          {product.ourPrice.toString()}
                        </td>
                        <td className="px-4 py-4 flex flex-row gap-1 items-center justify-center">
                          <span className="text-sm">
                            {Math.floor(
                              (Number(new Date()) -
                                Number(new Date(product.createdAt))) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            days ago
                          </span>
                          <button
                            className="text-xs text-blue-500 hover:underline hover:cursor-pointer"
                            onClick={() => resetDate(product.id)}
                          >
                            Reset
                          </button>
                        </td>

                        <th className="px-4 py-2">
                          <td className="flex flex-row items-center gap-1">
                            <input
                              type="number"
                              placeholder="% Amount"
                              className="w-10 border rounded-md text-xs text-muted-foreground p-1"
                              value={discounts[product.id] || 30}
                              min={1}
                              max={99}
                              onChange={(e) => {
                                const value = Math.min(
                                  Math.max(
                                    parseInt(e.target.value, 10) || 0,
                                    1
                                  ),
                                  99
                                );
                                handleDiscountChange(product.id, value);
                              }}
                            />
                            <button
                              className="text-xs text-red-500 hover:underline hover:cursor-pointer"
                              onClick={() => applyDiscount(product.id)}
                            >
                              Apply
                            </button>
                          </td>
                        </th>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default OldStock;
