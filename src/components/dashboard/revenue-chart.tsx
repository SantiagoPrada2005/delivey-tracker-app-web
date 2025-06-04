"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { mes: "Enero", ingresos: 4500 },
  { mes: "Febrero", ingresos: 5200 },
  { mes: "Marzo", ingresos: 6800 },
  { mes: "Abril", ingresos: 8900 },
  { mes: "Mayo", ingresos: 9200 },
  { mes: "Junio", ingresos: 12450 },
];

export function RevenueChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Tendencia de Ingresos</CardTitle>
        <CardDescription>Ingresos mensuales en los últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="ingresos" 
              stroke="#8b5cf6" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
              name="Ingresos ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}