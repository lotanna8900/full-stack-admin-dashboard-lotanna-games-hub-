"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Component to display data simply in a bar chart
export default function ViewsBarChart({ data, dataKey, nameKey }) {
  if (!data || data.length === 0) {
    return <p>No data available for chart.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {/* XAxis displays the 'nameKey' */}
        <XAxis dataKey={nameKey} tickFormatter={(value) => value.substring(0, 15) + '...'} />
        {/* YAxis displays the view count */}
        <YAxis />
        {/* Tooltip shows details on hover */}
        <Tooltip />
        <Legend />
        {/* Bar represents the 'dataKey' (e.g., view_count) */}
        <Bar dataKey={dataKey} fill="#8884d8" name="Views" />
      </BarChart>
    </ResponsiveContainer>
  );
}