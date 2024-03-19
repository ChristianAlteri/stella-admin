import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ColorCount {
  name: string;
  count: BigInt; // Use BigInt here if your initial data structure uses BigInt
}

interface TopSellingColorsProps {
  data: ColorCount[]; // Your original data might be using BigInt for count
}

export const TopSellingColorsGraph: React.FC<TopSellingColorsProps> = ({ data }) => {
  // Convert BigInt to number for Recharts
  const preparedData = data.map(({ name, count }) => ({
    name,
    count: Number(count), // Convert BigInt to number
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={preparedData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: 'transparent' }} />
        <Legend />
        <Bar dataKey="count" name="Sales Count" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
