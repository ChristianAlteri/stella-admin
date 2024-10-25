'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from 'lucide-react';



export default function TopUsersCard({ users } : any ) {
  // TODO: This function sorts alphabetically - change to user who has bought the most
  const getTopUsers = (users: any) => {
    const sortedUsers = users.sort((a: any, b: any) => a.name.localeCompare(b.name));
    return sortedUsers.slice(0, 3); // Take the top 3 users
  };

  const topUsers = getTopUsers(users);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-400" />
          Top Users (alphabetically)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {topUsers.map((user: any, index: any) => (
            <li key={user.id} className="flex items-center gap-3">
              <span className="font-bold text-lg text-muted-foreground">{index + 1}</span>
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant="secondary">{user.orders.length.toString()} orders</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
