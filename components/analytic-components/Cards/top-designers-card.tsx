"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Award, ArrowUpDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { convertDecimalsToNumbers, currencyConvertor } from "@/lib/utils";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  ourPrice: number;
  isArchived: boolean;
  designer: {
    id: string;
    name: string;
  };
}

interface TopDesignersCardProps {
  countryCode: string;
}

interface DesignerStats {
  id: string;
  name: string;
  totalValue: number;
  count: number;
}

const TopDesignersCard: React.FC<TopDesignersCardProps> = ({ countryCode }) => {
  const currencySymbol = currencyConvertor(countryCode);
  const router = useRouter();
  const params = useParams();
  const [sortByValue, setSortByValue] = useState(true);
  const [showBottomDesigners, setShowBottomDesigners] = useState(false);
  const [frontendProducts, setFrontendProducts] = useState<Product[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`/api/${params.storeId}/products`, {
          params: {
            isArchived: true,
          },
        });
        const processedData = convertDecimalsToNumbers(response.data);
        setFrontendProducts(processedData);
      } catch (error) {
        console.error("Error fetching products for top-designer-card:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // const designerStats = useMemo(() => {
  //   const stats: { [key: string]: DesignerStats } = {};

  //   frontendProducts?.forEach((product) => {
  //     if (product.isArchived) {
  //       const { id, name } = product.designer;
  //       if (!stats[id]) {
  //         stats[id] = { id, name, totalValue: 0, count: 0 };
  //       }
  //       stats[id].totalValue += product.ourPrice;
  //       stats[id].count += 1;
  //     }
  //   });

  //   return Object.values(stats);
  // }, [frontendProducts]);

  const designerStats = useMemo(() => {
    const stats: { [key: string]: DesignerStats } = {};
    const topDesigners: DesignerStats[] = [];

    frontendProducts?.forEach((product) => {
      if (!product.isArchived) return;

      const { id, name } = product.designer;
      if (!stats[id]) {
        stats[id] = { id, name, totalValue: 0, count: 0 };
      }
      stats[id].totalValue += product.ourPrice;
      stats[id].count += 1;

      // Check if designer is already in the top designers
      const existingIndex = topDesigners.findIndex((d) => d.id === id);
      if (existingIndex !== -1) {
        topDesigners[existingIndex] = stats[id];
      } else {
        topDesigners.push(stats[id]);
      }

      // Keep only the top 10 designers sorted
      topDesigners.sort((a, b) => b.totalValue - a.totalValue);
      if (topDesigners.length > 10) {
        topDesigners.pop(); // Remove the lowest value designer
      }
    });

    return topDesigners;
  }, [frontendProducts]);

  // const sortedDesigners = useMemo(() => {
  //   return [...designerStats].sort((a, b) => {
  //     if (sortByValue) {
  //       return b.totalValue - a.totalValue;
  //     } else {
  //       return b.count - a.count;
  //     }
  //   });
  // }, [designerStats, sortByValue]);

  const sortedDesigners = designerStats;

  const displayedDesigners = useMemo(() => {
    return showBottomDesigners
      ? [...sortedDesigners].reverse()
      : sortedDesigners;
  }, [sortedDesigners, showBottomDesigners]);

  return (
    <Card className="col-span-3 h-[280px] flex flex-col w-full">
      {isLoading ? (
        <div className="flex w-full items-center justify-center mt-4">
          Loading...
        </div>
      ) : (
        <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-xl font-bold">
              {showBottomDesigners ? "Bottom Designers" : "Top Designers"}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBottomDesigners(!showBottomDesigners)}
              className="ml-2"
            >
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <Switch
              id="sort-toggle"
              checked={sortByValue}
              onCheckedChange={setSortByValue}
            />
            <Label htmlFor="sort-toggle" className="text-sm">
              {sortByValue ? "Volume" : "Value"}
            </Label>
          </div>
        </CardHeader>
      )}
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 p-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-2 rounded-lg"
                >
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            ) : Array.isArray(displayedDesigners) &&
              displayedDesigners.length > 0 ? (
              displayedDesigners.map((designer) => (
                <div
                  className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent transition-colors duration-200 cursor-pointer"
                  key={designer.id}
                  onClick={() =>
                    params?.storeId &&
                    router.push(`/${params.storeId}/designers/${designer.id}`)
                  }
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback>
                      {designer.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate hover:underline hover:cursor-pointer">
                      {designer.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {designer.count} products sold
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-auto flex-shrink-0">
                    {sortByValue
                      ? `${currencySymbol}${designer.totalValue.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}`
                      : `${designer.count} sold`}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TopDesignersCard;
