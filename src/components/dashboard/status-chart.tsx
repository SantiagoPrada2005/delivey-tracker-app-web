"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Entregados', value: 65, color: '#4ade80' },
  { name: 'En camino', value: 15, color: '#60a5fa' },
  { name: 'Pendientes', value: 28, color: '#fbbf24' },
  { name: 'Cancelados', value: 12, color: '#f87171' },
];

export function StatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Pedidos</CardTitle>
        <CardDescription>Distribución actual de pedidos por estado</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} pedidos`, 'Cantidad']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}