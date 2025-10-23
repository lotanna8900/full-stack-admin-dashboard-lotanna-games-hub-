// src/components/TrendLineChart.jsx
"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Function to format date labels (e.g., "Oct 22")
const formatDateTick = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function TrendLineChart({ data, xDataKey, yDataKey, yAxisLabel }) {
  if (!data || data.length === 0) {
    return <p>No data available for trend chart.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {/* XAxis shows formatted dates */}
        <XAxis dataKey={xDataKey} tickFormatter={formatDateTick} />
        {/* YAxis shows the count */}
        <YAxis />
        <Tooltip labelFormatter={formatDateTick} />
        <Legend />
        {/* Line represents the count over time */}
        <Line type="monotone" dataKey={yDataKey} stroke="#82ca9d" name={yAxisLabel} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}