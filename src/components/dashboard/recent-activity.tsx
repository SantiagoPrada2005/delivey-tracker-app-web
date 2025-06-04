"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  description: string;
  timestamp: string;
  type: 'pedido' | 'cliente' | 'producto' | 'repartidor';
  status?: 'pendiente' | 'en_proceso' | 'en_camino' | 'entregado' | 'cancelado';
}

const activityData: ActivityItem[] = [
  {
    id: "ACT-001",
    description: "Nuevo pedido creado: PED-007",
    timestamp: "Hace 5 minutos",
    type: "pedido",
    status: "pendiente"
  },
  {
    id: "ACT-002",
    description: "Pedido PED-003 actualizado a En Camino",
    timestamp: "Hace 15 minutos",
    type: "pedido",
    status: "en_camino"
  },
  {
    id: "ACT-003",
    description: "Nuevo cliente registrado: Elena Martínez",
    timestamp: "Hace 45 minutos",
    type: "cliente"
  },
  {
    id: "ACT-004",
    description: "Pedido PED-002 marcado como Entregado",
    timestamp: "Hace 1 hora",
    type: "pedido",
    status: "entregado"
  },
  {
    id: "ACT-005",
    description: "Stock actualizado: Producto PRD-012",
    timestamp: "Hace 2 horas",
    type: "producto"
  },
  {
    id: "ACT-006",
    description: "Repartidor asignado a pedido PED-005",
    timestamp: "Hace 3 horas",
    type: "repartidor"
  },
];

function getStatusBadgeVariant(status: string | undefined) {
  if (!status) return "secondary";
  
  switch (status) {
    case "pendiente":
      return "secondary";
    case "en_proceso":
      return "outline";
    case "en_camino":
      return "outline";
    case "entregado":
      return "default";
    case "cancelado":
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: string | undefined) {
  if (!status) return "";
  
  switch (status) {
    case "pendiente":
      return "Pendiente";
    case "en_proceso":
      return "En Proceso";
    case "en_camino":
      return "En Camino";
    case "entregado":
      return "Entregado";
    case "cancelado":
      return "Cancelado";
    default:
      return status;
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas actividades en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityData.map((item) => (
            <div key={item.id} className="flex items-start justify-between border-b pb-3 last:border-0">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{item.description}</p>
                <p className="text-xs text-muted-foreground">{item.timestamp}</p>
              </div>
              <div>
                {item.status && (
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}