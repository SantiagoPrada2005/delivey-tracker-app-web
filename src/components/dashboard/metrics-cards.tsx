"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, Package, Users, DollarSign, Clock } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  trend: number;
  icon: React.ReactNode;
}

function MetricCard({ title, value, description, trend, icon }: MetricCardProps) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {!isNeutral && (
            <span className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
          {isNeutral && <span>Sin cambios</span>}
          <span className="ml-1">{description}</span>
        </p>
      </CardContent>
    </Card>
  );
}

export function MetricsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Pedidos Totales"
        value="120"
        description="desde el mes pasado"
        trend={10}
        icon={<Package className="h-4 w-4" />}
      />
      <MetricCard
        title="Pedidos Pendientes"
        value="25"
        description="desde el mes pasado"
        trend={-5}
        icon={<Clock className="h-4 w-4" />}
      />
      <MetricCard
        title="Clientes Activos"
        value="45"
        description="desde el mes pasado"
        trend={15}
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard
        title="Ingresos"
        value="$12,450"
        description="desde el mes pasado"
        trend={20}
        icon={<DollarSign className="h-4 w-4" />}
      />
    </div>
  );
}