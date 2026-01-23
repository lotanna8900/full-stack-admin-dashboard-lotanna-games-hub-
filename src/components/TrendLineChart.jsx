"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Format date labels
const formatDateTick = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--grey-darker)',
        border: '1px solid var(--grey-light)',
        borderRadius: '8px',
        padding: '0.75rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: 'var(--white)' }}>
          {formatDateTick(label)}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color, fontSize: '0.9rem' }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendLineChart({ data, xDataKey, yDataKey, yAxisLabel }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontStyle: 'italic'
      }}>
        No data available for trend chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grey-light)" opacity={0.3} />
        <XAxis 
          dataKey={xDataKey} 
          tickFormatter={formatDateTick}
          stroke="var(--text-secondary)"
          style={{ fontSize: '0.85rem' }}
        />
        <YAxis 
          stroke="var(--text-secondary)"
          style={{ fontSize: '0.85rem' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '1rem' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey={yDataKey} 
          stroke="#22c55e" 
          strokeWidth={3}
          name={yAxisLabel} 
          activeDot={{ r: 6, fill: '#22c55e' }}
          dot={{ fill: '#22c55e', r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}