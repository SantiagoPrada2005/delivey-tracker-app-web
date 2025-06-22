"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { mes: "Enero", completados: 65, pendientes: 28, cancelados: 12 },
  { mes: "Febrero", completados: 59, pendientes: 32, cancelados: 10 },
  { mes: "Marzo", completados: 80, pendientes: 27, cancelados: 15 },
  { mes: "Abril", completados: 81, pendientes: 30, cancelados: 8 },
  { mes: "Mayo", completados: 56, pendientes: 23, cancelados: 11 },
  { mes: "Junio", completados: 55, pendientes: 25, cancelados: 9 },
];

export function OrderChart() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Pedidos por Mes</CardTitle>
        <CardDescription className="text-sm">Distribución de pedidos por estado y mes</CardDescription>
      </CardHeader>
      <CardContent className="pl-1 sm:pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="mes" 
              fontSize={12}
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              fontSize={12}
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="rect"
            />
            <Bar dataKey="completados" fill="#4ade80" name="Completados" radius={[2, 2, 0, 0]} />
            <Bar dataKey="pendientes" fill="#fbbf24" name="Pendientes" radius={[2, 2, 0, 0]} />
            <Bar dataKey="cancelados" fill="#f87171" name="Cancelados" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}