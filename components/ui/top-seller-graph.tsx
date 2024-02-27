'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import React from "react";

interface TopSellerGraphProps {
  data: any[]; // Assuming this is the transformed data
};

export const TopSellerGraph: React.FC<TopSellerGraphProps> = ({ data }) => {
  // Transform the original data to fit the graph requirements
  // This assumes the incoming data is already processed to include only top sellers for each month
  const graphData = data.map(month => {
    // Assuming 'sellers' array is sorted, or you find the top seller here
    const topSeller = month.sellers[0] || { name: 'No Seller', totalItemsSold: 0 };
    return { name: month.name, sellerName: topSeller.name, total: topSeller.totalItemsSold };
  });

  console.log("graphData", graphData);
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={graphData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="custom-tooltip" style={{ backgroundColor: '#ffff', padding: '10px', border: '1px solid #cccccc' }}>
                  <p className="label">{`Month: ${label}`}</p>
                  <p className="intro">{`Top Seller: ${payload[0].payload.sellerName}`}</p>
                  <p className="intro">{`Total Sold: ${payload[0].value}`}</p>
                </div>
              );
            }
            return null;
          }} 
        />
        <Bar dataKey="total" name="Total Items Sold" fill="#3498db" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
