"use client";
import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Company } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heading } from "@/components/ui/heading";

interface TheGrandExchangeComponentProps {
  company: Company;
}

const TheGrandExchangeComponent: React.FC<TheGrandExchangeComponentProps> = ({
  company,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Placeholder function for search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };
  return (
    <Card className="w-full h-full  bg-[#382f1f] text-[#ff981f]">
      <div className="flex flex-col items-center justify-center w-full h-full p-4">
        <div className="w-full max-w-4xl p-4 bg-[#4a412e] border-4 border-[#382f1f] rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-4">
            The Grand Exchange
          </h1>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-[#2e2820] p-4 rounded-lg border-2 border-[#5a4f36]">
              <form onSubmit={handleSearch} className="flex mb-4">
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow mr-2 bg-[#5a4f36] text-[#ff981f] border-[#7a6a4a]"
                />
                <Button
                  type="submit"
                  className="bg-[#5a4f36] hover:bg-[#7a6a4a] text-[#ff981f]"
                >
                  Search
                </Button>
              </form>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-[#5a4f36] p-2 rounded-lg border border-[#7a6a4a] h-24 flex items-center justify-center"
                  >
                    Item Slot
                  </div>
                ))}
              </div>
            </div>
            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger className="w-full" value="categories">Categories</TabsTrigger>
                <TabsTrigger className="w-full" value="designers">Designers</TabsTrigger>
              </TabsList>
              <TabsContent value="categories" className="w-full">
                {["All", "Weapons", "Armour", "Magic", "Food", "Misc"].map(
                  (category) => (
                    <Button
                      key={category}
                      className="w-full mb-2 bg-[#5a4f36] hover:bg-[#7a6a4a] text-[#ff981f]"
                    >
                      {category}
                    </Button>
                  )
                )}
              </TabsContent>
              <TabsContent value="designers">
                {[
                  "Prada",
                  "Alexander McQueen",
                  "Gucci",
                  "Dior",
                  "Versace",
                  "Hermes",
                ].map((category) => (
                  <Button
                    key={category}
                    className="w-full mb-2 bg-[#5a4f36] hover:bg-[#7a6a4a] text-[#ff981f]"
                  >
                    {category}
                  </Button>
                ))}
              </TabsContent>
            </Tabs>
          </div>
          <div className="mt-4 text-center">
            Welcome to {company.name}&apos;s Grand Exchange
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TheGrandExchangeComponent;
