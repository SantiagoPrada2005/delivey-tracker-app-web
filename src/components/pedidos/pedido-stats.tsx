import { TrendingUp, CheckCircle, Package, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pedido } from "./types";

interface PedidoStatsProps {
  pedidos: Pedido[];
  horaActual: string;
  stats?: {
    total: number;
    pendientes: number;
    entregados: number;
    totalVentas: number;
    promedioVenta: number;
  };
  currentTime?: Date;
}

export default function PedidoStats({ pedidos, horaActual, stats, currentTime }: PedidoStatsProps) {
  // Usar estadísticas pasadas como props o calcularlas
  const totalPedidos = stats?.total ?? pedidos.length;
  const pedidosPendientes = stats?.pendientes ?? pedidos.filter(p => p.estado === 'pendiente').length;
  const pedidosEnProceso = pedidos.filter(p => p.estado === 'en_proceso').length;
  const pedidosEntregados = stats?.entregados ?? pedidos.filter(p => p.estado === 'entregado').length;
  
  const totalVentas = stats?.totalVentas ?? pedidos.reduce((sum, pedido) => sum + pedido.total, 0);
  const promedioVenta = stats?.promedioVenta ?? (totalPedidos > 0 ? totalVentas / totalPedidos : 0);
  
  // Usar currentTime si está disponible, sino usar horaActual
  const displayTime = currentTime ? currentTime.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit'
  }) : horaActual;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Hora actual de Bogotá */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hora Bogotá</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayTime}</div>
          <p className="text-xs text-muted-foreground">Zona horaria local</p>
        </CardContent>
      </Card>

      {/* Total de pedidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPedidos}</div>
          <p className="text-xs text-muted-foreground">
            {pedidosPendientes} pendientes, {pedidosEnProceso} en proceso
          </p>
        </CardContent>
      </Card>

      {/* Pedidos entregados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entregados</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{pedidosEntregados}</div>
          <p className="text-xs text-muted-foreground">
            {totalPedidos > 0 ? Math.round((pedidosEntregados / totalPedidos) * 100) : 0}% del total
          </p>
        </CardContent>
      </Card>

      {/* Total de ventas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalVentas.toLocaleString('es-CO')}
          </div>
          <p className="text-xs text-muted-foreground">
            Promedio: ${Math.round(promedioVenta).toLocaleString('es-CO')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}