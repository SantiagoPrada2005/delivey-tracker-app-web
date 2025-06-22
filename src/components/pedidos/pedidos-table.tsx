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
import { MoreHorizontal, Edit, Trash2, Eye, MapPin, User, Clock, DollarSign } from "lucide-react";
import { Pedido } from "./types";
import { getEstadoBadge, formatearFechaBogota, calcularTiempoEntrega, formatearTiempo } from "./utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PedidosTableProps {
  pedidos: Pedido[];
  onView: (pedido: Pedido) => void;
  onEdit: (pedido: Pedido) => void;
  onDelete: (pedido: Pedido) => void;
}

// Componente para vista móvil de pedidos
function PedidoCardMobile({ pedido, onView, onEdit, onDelete }: { pedido: Pedido; onView: (pedido: Pedido) => void; onEdit: (pedido: Pedido) => void; onDelete: (pedido: Pedido) => void }) {
  const clienteNombre = pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : 'Cliente no encontrado';
  const repartidorNombre = pedido.asignaciones && pedido.asignaciones.length > 0 
    ? `${pedido.asignaciones[0].repartidor?.nombre || ''} ${pedido.asignaciones[0].repartidor?.apellido || ''}`.trim() || 'Sin asignar'
    : 'Sin asignar';

  return (
    <Card className="mb-3 shadow-sm">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">#{pedido.id}</span>
              {getEstadoBadge(pedido.estado)}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{clienteNombre}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{pedido.direccionEntrega}</span>
            </div>
          </div>
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
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="text-xs">Fecha</span>
              </div>
              <span className="text-xs font-medium">{formatearFechaBogota(pedido.createdAt)}</span>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <DollarSign className="h-3 w-3 flex-shrink-0" />
                <span className="text-xs">Total</span>
              </div>
              <span className="font-semibold text-sm">${pedido.total.toLocaleString('es-CO')}</span>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs">Repartidor</div>
            <span className="text-sm">{repartidorNombre}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PedidosTable({ pedidos, onView, onEdit, onDelete }: PedidosTableProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="px-1">
          <h3 className="text-lg font-semibold">Pedidos Recientes</h3>
          <p className="text-sm text-muted-foreground">Gestiona todos los pedidos desde aquí</p>
        </div>
        {pedidos.length === 0 ? (
          <Card className="mx-1">
            <CardContent className="text-center py-8 text-muted-foreground">
              <div className="space-y-2">
                <div className="text-4xl">📦</div>
                <p className="text-sm">No se encontraron pedidos</p>
                <p className="text-xs">Los pedidos aparecerán aquí cuando se creen</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="px-1">
            {pedidos.map((pedido) => (
              <PedidoCardMobile 
                key={pedido.id} 
                pedido={pedido} 
                onView={onView} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recientes</CardTitle>
        <CardDescription>Gestiona todos los pedidos desde aquí</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] sm:w-[100px]">ID</TableHead>
                <TableHead className="min-w-[120px]">Cliente</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">Fecha/Hora</TableHead>
                <TableHead className="min-w-[150px]">Dirección</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[100px]">Repartidor</TableHead>
                <TableHead className="min-w-[80px]">Estado</TableHead>
                <TableHead className="hidden xl:table-cell min-w-[100px]">Tiempo Entrega</TableHead>
                <TableHead className="text-right min-w-[80px]">Total</TableHead>
                <TableHead className="w-[50px] sm:w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell className="font-medium text-xs sm:text-sm">#{pedido.id}</TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <div className="max-w-[120px] truncate">
                      {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : 'Cliente no encontrado'}
                    </div>
                    <div className="md:hidden text-xs text-muted-foreground mt-1">
                      {formatearFechaBogota(pedido.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                    {formatearFechaBogota(pedido.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <div className="max-w-[150px] sm:max-w-[200px] truncate">{pedido.direccionEntrega}</div>
                    <div className="lg:hidden text-xs text-muted-foreground mt-1">
                      {pedido.asignaciones && pedido.asignaciones.length > 0 
                        ? `${pedido.asignaciones[0].repartidor?.nombre || ''} ${pedido.asignaciones[0].repartidor?.apellido || ''}`.trim() || 'Sin asignar'
                        : 'Sin asignar'
                      }
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                    <div className="max-w-[100px] truncate">
                      {pedido.asignaciones && pedido.asignaciones.length > 0 
                        ? `${pedido.asignaciones[0].repartidor?.nombre || ''} ${pedido.asignaciones[0].repartidor?.apellido || ''}`.trim() || 'Sin asignar'
                        : 'Sin asignar'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    {getEstadoBadge(pedido.estado)}
                    <div className="xl:hidden text-xs text-muted-foreground mt-1">
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
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-xs sm:text-sm">
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
                  <TableCell className="text-right font-medium text-xs sm:text-sm">
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
        </div>
        {pedidos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron pedidos
          </div>
        )}
      </CardContent>
    </Card>
  );
}