import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Pedido } from "./types";
import { getEstadoBadge, formatearFechaBogota, calcularTiempoEntrega, formatearTiempo } from "./utils";

interface PedidosTableProps {
  pedidos: Pedido[];
  onView: (pedido: Pedido) => void;
  onEdit: (pedido: Pedido) => void;
  onDelete: (pedido: Pedido) => void;
}

export default function PedidosTable({ pedidos, onView, onEdit, onDelete }: PedidosTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recientes</CardTitle>
        <CardDescription>Gestiona todos los pedidos desde aquí</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha/Hora</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Repartidor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tiempo Entrega</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell className="font-medium">#{pedido.id}</TableCell>
                <TableCell>
                  {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : 'Cliente no encontrado'}
                </TableCell>
                <TableCell>
                  {formatearFechaBogota(pedido.createdAt)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{pedido.direccionEntrega}</TableCell>
                <TableCell>
                  {pedido.asignaciones && pedido.asignaciones.length > 0 
                    ? `${pedido.asignaciones[0].repartidor?.nombre || ''} ${pedido.asignaciones[0].repartidor?.apellido || ''}`.trim() || 'Sin asignar'
                    : 'Sin asignar'
                  }
                </TableCell>
                <TableCell>{getEstadoBadge(pedido.estado)}</TableCell>
                <TableCell>
                  {pedido.estado === 'entregado' && pedido.fechaEntrega ? (
                    <span className="text-green-600 font-medium">
                      {formatearTiempo(calcularTiempoEntrega(pedido.createdAt, pedido.fechaEntrega))}
                    </span>
                  ) : pedido.fechaEntrega ? (
                    <span className="text-orange-600">
                      Est: {formatearTiempo(calcularTiempoEntrega(pedido.createdAt, pedido.fechaEntrega))}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${pedido.total.toLocaleString('es-CO')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onView(pedido)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(pedido)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(pedido)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pedidos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron pedidos
          </div>
        )}
      </CardContent>
    </Card>
  );
}