import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Pedido } from "./types";
import { getEstadoBadge, formatearFechaCompletaBogota, formatearSoloFechaBogota, calcularTiempoEntrega, formatearTiempo } from "./utils";

interface PedidoViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: Pedido | null;
}

export default function PedidoViewDialog({ isOpen, onOpenChange, pedido }: PedidoViewDialogProps) {
  if (!pedido) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Pedido #{pedido.id}</DialogTitle>
          <DialogDescription>
            Información completa del pedido y sus detalles.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Información general */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
              <p className="text-sm">
                {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : 'Cliente no encontrado'}
              </p>
              {pedido.cliente && (
                <>
                  <p className="text-xs text-muted-foreground">{pedido.cliente.email}</p>
                  <p className="text-xs text-muted-foreground">{pedido.cliente.telefono}</p>
                </>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
              <div>{getEstadoBadge(pedido.estado)}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Fecha de Creación</Label>
              <p className="text-sm">
                {formatearFechaCompletaBogota(pedido.createdAt)}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Fecha de Entrega</Label>
              <p className="text-sm">
                {pedido.fechaEntrega 
                  ? formatearFechaCompletaBogota(pedido.fechaEntrega)
                  : 'No programada'
                }
              </p>
            </div>
          </div>

          {/* Dirección de entrega */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Dirección de Entrega</Label>
            <p className="text-sm bg-muted p-3 rounded-md">{pedido.direccionEntrega}</p>
          </div>

          {/* Repartidor asignado */}
          {pedido.asignaciones && pedido.asignaciones.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Repartidor Asignado</Label>
              <p className="text-sm">
                {pedido.asignaciones[0].repartidor 
                  ? `${pedido.asignaciones[0].repartidor.nombre} ${pedido.asignaciones[0].repartidor.apellido}`
                  : 'Sin asignar'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                Asignado el {formatearSoloFechaBogota(pedido.asignaciones[0].fechaAsignacion)}
              </p>
            </div>
          )}

          {/* Tiempo de entrega */}
          {pedido.estado === 'entregado' && pedido.fechaEntrega && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Tiempo de Entrega</Label>
              <p className="text-lg font-semibold text-blue-600">
                {formatearTiempo(calcularTiempoEntrega(pedido.createdAt, pedido.fechaEntrega))}
              </p>
            </div>
          )}

          {/* Detalles del pedido */}
          {pedido.detalles && pedido.detalles.length > 0 && (
            <div className="space-y-4">
              <Label className="text-sm font-medium text-muted-foreground">Productos del Pedido</Label>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedido.detalles.map((detalle) => (
                      <TableRow key={detalle.id}>
                        <TableCell>
                          {detalle.producto?.nombre || `Producto ID: ${detalle.productoId}`}
                        </TableCell>
                        <TableCell className="text-center">{detalle.cantidad}</TableCell>
                        <TableCell className="text-right">
                          ${detalle.precioUnitario.toLocaleString('es-CO')}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${detalle.subtotal.toLocaleString('es-CO')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <Label className="text-sm font-medium text-muted-foreground">Total del Pedido</Label>
                  <p className="text-xl font-bold">
                    ${pedido.total.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}