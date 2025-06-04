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
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Pedidos por Mes</CardTitle>
        <CardDescription>Distribución de pedidos por estado y mes</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
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
            <Tooltip />
            <Legend />
            <Bar dataKey="completados" fill="#22c55e" name="Completados" />
            <Bar dataKey="pendientes" fill="#f59e0b" name="Pendientes" />
            <Bar dataKey="cancelados" fill="#ef4444" name="Cancelados" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}