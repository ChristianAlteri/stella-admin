"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowUpDown } from "lucide-react";
import { TbStar } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@prisma/client";

type SortFlag =
  | "totalPurchases"
  | "totalItemsPurchased"
  | "totalTransactionCount";

interface TopUsersCardProps {
  users: User[];
  sortBy?: SortFlag;
}

export default function TopUsersCard({
  users,
  sortBy = "totalPurchases",
}: TopUsersCardProps) {
  const [showBottomUsers, setShowBottomUsers] = useState(false);
  const [currentSortBy, setCurrentSortBy] = useState<SortFlag>(sortBy);

  const sortedUsers = useMemo(() => {
    return [...users].sort(
      (a, b) => (b[currentSortBy] ?? 0) - (a[currentSortBy] ?? 0)
    );
  }, [users, currentSortBy]);

  const displayedUsers = useMemo(() => {
    return showBottomUsers ? sortedUsers.slice().reverse() : sortedUsers;
  }, [sortedUsers, showBottomUsers]);

  const getFlagLabel = (flag: SortFlag) => {
    switch (flag) {
      case "totalPurchases":
        return "Total Purchases";
      case "totalItemsPurchased":
        return "Items Purchased";
      case "totalTransactionCount":
        return "Transactions";
    }
  };

  return (
    <Card className="w-full h-[280px] flex flex-col">
      <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <TbStar className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-xl font-bold">
            {showBottomUsers ? "Bottom Users" : "Top Users"}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBottomUsers(!showBottomUsers)}
            className="ml-2"
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex flex-row items-center justify-between space-x-2">
          <Switch
            id="sort-toggle"
            checked={currentSortBy === "totalPurchases"}
            onCheckedChange={(checked) =>
              setCurrentSortBy(
                checked ? "totalPurchases" : "totalItemsPurchased"
              )
            }
          />
          <Label htmlFor="sort-toggle" className="text-sm">
            {currentSortBy === "totalPurchases" ? "Value" : "Volume"}
          </Label>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 p-4">
            {displayedUsers.slice(0, 5).map((user, index) => (
              <div
                className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent transition-colors duration-200 cursor-pointer"
                key={user.id}
              >
                <Avatar className="w-16 h-16">
                  <AvatarFallback>
                    <AvatarFallback>
                      {user.name
                        ? `${user.name[0]?.toUpperCase() || ""}${
                            user.name[1]?.toUpperCase() || ""
                          }`
                        : "CA"}
                    </AvatarFallback>
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto flex-shrink-0">
                  {currentSortBy === "totalPurchases"
                    ? `$${(user.totalPurchases ?? 0).toLocaleString()}`
                    : `${user.totalItemsPurchased} items`}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// "use client";

// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { User } from "@prisma/client";
// import { TbStar } from "react-icons/tb";

// type SortFlag = "totalPurchases" | "totalItemsPurchased" | "totalTransactionCount";

// export default function TopUsersCard({ users, sortBy = "totalPurchases" }: { users: User[], sortBy?: SortFlag }) {
//   const getTopUsers = (users: User[], flag: SortFlag) => {
//     const sortedUsers = users.sort((a, b) => (b[flag] ?? 0) - (a[flag] ?? 0));
//     return sortedUsers.slice(0, 3); // Take the top 3 users
//   };

//   const topUsers = getTopUsers(users, sortBy);

//   const getFlagLabel = (flag: SortFlag) => {
//     switch (flag) {
//       case "totalPurchases":
//         return "Total Spent";
//       case "totalItemsPurchased":
//         return "Items Purchased";
//       case "totalTransactionCount":
//         return "Transactions";
//     }
//   };

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <TbStar className="h-5 w-5 text-purple-400" />
//           Top Users by {getFlagLabel(sortBy)}
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <ul className="space-y-4">
//           {topUsers.map((user, index) => (
//             <li key={user.id} className="flex items-center gap-3">
//               <span className="font-bold text-lg text-muted-foreground">
//                 {index + 1}
//               </span>
//               <div className="flex-1">
//                 <p className="font-semibold">{user.name}</p>
//                 <p className="text-sm text-muted-foreground">{user.email}</p>
//               </div>
//               <Badge variant="secondary">
//                 {user[sortBy]} {getFlagLabel(sortBy)}
//               </Badge>
//             </li>
//           ))}
//         </ul>
//       </CardContent>
//     </Card>
//   );
// }
