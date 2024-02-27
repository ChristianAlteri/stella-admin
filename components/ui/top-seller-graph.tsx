'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import React from "react";

interface TopSellerGraphProps {
  data: any[]; // Assuming this is the transformed data
};

interface MonthData {
  name: string;
  [key: string]: string | number; // This allows any number of additional string keys mapping to either string or number values
}

export const TopSellerGraph: React.FC<TopSellerGraphProps> = ({ data }) => {
  const graphData = data.map(month => {
    // Sort sellers by totalItemsSold, then take the top 3
    const topSellers = [...month.sellers].sort((a, b) => b.totalItemsSold - a.totalItemsSold).slice(0, 3);

    // Map top sellers to a format suitable for the graph
    const monthData: MonthData = {
      name: month.name,
    };

    topSellers.forEach((seller, index) => {
      monthData[`seller${index + 1}Name`] = seller.name;
      monthData[`seller${index + 1}Total`] = seller.totalItemsSold;
    });

    return monthData;
  });

  // console.log("graphData", graphData);
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={graphData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="custom-tooltip" style={{ backgroundColor: '#ffff', padding: '10px', border: '1px solid #cccccc' }}>
                  {/* <p className="label">{`Month: ${label}`}</p> */}
                  {payload.map((entry, index) => (
                    <React.Fragment key={index}>
                      <p className="intro">{`- ${entry.payload[`seller${index + 1}Name`]}`}</p>
                      <p className="intro">{`Total Sold: ${entry.payload[`seller${index + 1}Total`]}`}</p>
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            return null;
          }} 
        />
        <Legend />
        <Bar dataKey="seller1Total" name="Top 1" fill="#3498db" radius={[4, 4, 0, 0]} />
        <Bar dataKey="seller2Total" name="Top 2" fill="#82ca9d" radius={[4, 4, 0, 0]} />
        <Bar dataKey="seller3Total" name="Top 3" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
