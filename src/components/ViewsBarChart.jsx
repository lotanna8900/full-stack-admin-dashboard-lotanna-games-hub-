"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--grey-darker)',
        border: '1px solid var(--grey-light)',
        borderRadius: '8px',
        padding: '0.75rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        maxWidth: '250px'
      }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: 'var(--white)', fontSize: '0.9rem' }}>
          {payload[0].payload.title}
        </p>
        <p style={{ margin: 0, color: payload[0].color, fontSize: '0.9rem' }}>
          Views: <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

// Color gradient for bars
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#6366f1', '#a855f7', '#ef4444', '#f97316'];

export default function ViewsBarChart({ data, dataKey, nameKey }) {
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
        No data available for chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grey-light)" opacity={0.3} />
        <XAxis 
          dataKey={nameKey} 
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
          tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
          stroke="var(--text-secondary)"
          style={{ fontSize: '0.75rem' }}
        />
        <YAxis 
          stroke="var(--text-secondary)"
          style={{ fontSize: '0.85rem' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--primary-rgb), 0.1)' }} />
        <Legend wrapperStyle={{ paddingTop: '1rem' }} />
        <Bar dataKey={dataKey} name="Views" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}