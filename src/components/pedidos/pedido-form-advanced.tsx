/**
 * @fileoverview Formulario avanzado para crear y editar pedidos
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Componente de formulario avanzado que utiliza el hook usePedidos
 * para manejar la creación y edición de pedidos con validaciones
 * en tiempo real, cálculos automáticos y manejo de stock.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CalendarIcon,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Package,
  User,
  MapPin,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePedidos, PedidoCompleto, DetallePedido } from '@/hooks/usePedidos';
import { useClientes } from '@/hooks/useClientes';
import { useProductos } from '@/hooks/useProductos';
import { useRepartidores } from '@/hooks/useRepartidores';

interface PedidoFormAdvancedProps {
  pedidoId?: number;
  onSuccess?: (pedidoId: number) => void;
  onCancel?: () => void;
  className?: string;
}

const PedidoFormAdvanced: React.FC<PedidoFormAdvancedProps> = ({
  pedidoId,
  onSuccess,
  onCancel,
  className
}) => {
  const {
    loading: pedidosLoading,
    error: pedidosError,
    validationErrors,
    stockValidations,
    createPedido,
    updatePedido,
    getPedidoById,
    calculateSubtotal,
    initializeEmptyPedido,
    addDetalle,
    removeDetalle,
    updateDetalle,
    clearErrors,
    clearValidations
  } = usePedidos();

  const { clientes, loading: clientesLoading } = useClientes();
  const { productos, loading: productosLoading } = useProductos();
  const { repartidores, loading: repartidoresLoading } = useRepartidores();

  const [pedido, setPedido] = useState<PedidoCompleto>(initializeEmptyPedido());
  const [isEditing, setIsEditing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [precioUnitario, setPrecioUnitario] = useState<number>(0);
  const [notaProducto, setNotaProducto] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar pedido existente si se proporciona un ID
  useEffect(() => {
    if (pedidoId) {
      setIsEditing(true);
      const loadPedido = async () => {
        const pedidoData = await getPedidoById(pedidoId, true);
        if (pedidoData) {
          setPedido(pedidoData as PedidoCompleto);
        }
      };
      loadPedido();
    } else {
      setPedido(initializeEmptyPedido());
    }
  }, [pedidoId, getPedidoById, initializeEmptyPedido]);

  // Limpiar errores cuando cambie el pedido
  useEffect(() => {
    clearErrors();
    clearValidations();
  }, [pedido, clearErrors, clearValidations]);

  // Actualizar precio unitario cuando se selecciona un producto
  useEffect(() => {
    if (selectedProducto) {
      const producto = productos.find(p => p.id === selectedProducto);
      if (producto) {
        setPrecioUnitario(parseFloat(producto.precio));
      }
    }
  }, [selectedProducto, productos]);

  // Manejar cambios en los campos del pedido
  const handlePedidoChange = useCallback((field: keyof PedidoCompleto, value: string | number | Date | null | undefined) => {
    setPedido(prev => ({ ...prev, [field]: value }));
  }, []);

  // Agregar producto al pedido
  const handleAddProducto = useCallback(() => {
    if (!selectedProducto || cantidad <= 0 || precioUnitario <= 0) {
      return;
    }

    const nuevoDetalle: Omit<DetallePedido, 'subtotal'> = {
      productoId: selectedProducto,
      cantidad,
      precioUnitario,
      notaProducto: notaProducto.trim() || undefined
    };

    const pedidoActualizado = addDetalle(pedido, nuevoDetalle);
    setPedido(pedidoActualizado);

    // Limpiar formulario de producto
    setSelectedProducto(null);
    setCantidad(1);
    setPrecioUnitario(0);
    setNotaProducto('');
  }, [selectedProducto, cantidad, precioUnitario, notaProducto, pedido, addDetalle]);

  // Remover producto del pedido
  const handleRemoveProducto = useCallback((index: number) => {
    const pedidoActualizado = removeDetalle(pedido, index);
    setPedido(pedidoActualizado);
  }, [pedido, removeDetalle]);

  // Actualizar detalle del pedido
  const handleUpdateDetalle = useCallback((index: number, field: keyof DetallePedido, value: string | number | undefined) => {
    const pedidoActualizado = updateDetalle(pedido, index, { [field]: value });
    setPedido(pedidoActualizado);
  }, [pedido, updateDetalle]);



  // Enviar formulario
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && pedidoId) {
        const success = await updatePedido(pedidoId, pedido);
        if (success) {
          onSuccess?.(pedidoId);
        }
      } else {
        const result = await createPedido(pedido);
        if (result.success && result.pedidoId) {
          onSuccess?.(result.pedidoId);
        }
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditing, pedidoId, pedido, updatePedido, createPedido, onSuccess]);

  // Obtener producto por ID
  const getProductoById = useCallback((id: number) => {
    return productos.find(p => p.id === id);
  }, [productos]);



  // Verificar si hay errores de validación para un campo específico
  const getFieldError = useCallback((field: string) => {
    return validationErrors.find(error => error.field === field);
  }, [validationErrors]);

  // Verificar si hay errores de stock para un producto específico
  const getStockValidation = useCallback((productoId: number) => {
    return stockValidations.find(validation => validation.productoId === productoId);
  }, [stockValidations]);

  const isLoading = pedidosLoading || clientesLoading || productosLoading || repartidoresLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Errores generales */}
        {pedidosError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{pedidosError}</AlertDescription>
          </Alert>
        )}

        {/* Información del cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Cliente
            </CardTitle>
            <CardDescription>
              Selecciona el cliente y la dirección de entrega
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Select
                  value={pedido.clienteId.toString()}
                  onValueChange={(value) => handlePedidoChange('clienteId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nombre} {cliente.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError('clienteId') && (
                  <p className="text-sm text-red-500">{getFieldError('clienteId')?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={pedido.estado}
                  onValueChange={(value) => handlePedidoChange('estado', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="en_camino">En Camino</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección de Entrega *
              </Label>
              <Textarea
                id="direccion"
                placeholder="Ingresa la dirección completa de entrega"
                value={pedido.direccionEntrega}
                onChange={(e) => handlePedidoChange('direccionEntrega', e.target.value)}
                className={getFieldError('direccionEntrega') ? 'border-red-500' : ''}
              />
              {getFieldError('direccionEntrega') && (
                <p className="text-sm text-red-500">{getFieldError('direccionEntrega')?.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Entrega</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !pedido.fechaEntrega && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pedido.fechaEntrega ? (
                        format(pedido.fechaEntrega, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={pedido.fechaEntrega}
                      onSelect={(date: Date | undefined) => {
                        handlePedidoChange('fechaEntrega', date);
                        setShowCalendar(false);
                      }}
                      disabled={(date: Date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repartidor">Repartidor</Label>
                <Select
                  value={pedido.repartidorId?.toString() || 'unassigned'}
                  onValueChange={(value) => handlePedidoChange('repartidorId', value === 'unassigned' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar repartidor (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                    {repartidores
                      .filter(r => r.disponible)
                      .map((repartidor) => (
                        <SelectItem key={repartidor.id} value={repartidor.id.toString()}>
                          {repartidor.nombre} {repartidor.apellido}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                {getFieldError('repartidorId') && (
                  <p className="text-sm text-red-500">{getFieldError('repartidorId')?.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productos del pedido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos del Pedido
            </CardTitle>
            <CardDescription>
              Agrega los productos que incluirá este pedido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulario para agregar productos */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-2">
                <Label htmlFor="producto">Producto</Label>
                <Select
                  value={selectedProducto?.toString() || ''}
                  onValueChange={(value) => setSelectedProducto(value ? parseInt(value) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id.toString()}>
                        {producto.nombre} (Stock: {producto.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio Unitario</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nota">Nota (opcional)</Label>
                <Input
                  id="nota"
                  placeholder="Nota del producto"
                  value={notaProducto}
                  onChange={(e) => setNotaProducto(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAddProducto}
                  disabled={!selectedProducto || cantidad <= 0 || precioUnitario <= 0}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>

            {/* Lista de productos agregados */}
            {pedido.detalles.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-center">Precio Unit.</TableHead>
                      <TableHead className="text-center">Subtotal</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedido.detalles.map((detalle, index) => {
                      const producto = getProductoById(detalle.productoId);
                      const stockValidation = getStockValidation(detalle.productoId);
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{producto?.nombre || 'Producto no encontrado'}</p>
                              {detalle.notaProducto && (
                                <p className="text-sm text-gray-500">{detalle.notaProducto}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min="1"
                              value={detalle.cantidad}
                              onChange={(e) => handleUpdateDetalle(index, 'cantidad', parseInt(e.target.value) || 1)}
                              className="w-20 text-center"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={detalle.precioUnitario}
                              onChange={(e) => handleUpdateDetalle(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                              className="w-24 text-center"
                            />
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            ${calculateSubtotal(detalle.cantidad, detalle.precioUnitario).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {stockValidation ? (
                              <Badge variant={stockValidation.esValido ? 'default' : 'destructive'}>
                                {stockValidation.esValido ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                )}
                                {stockValidation.stockDisponible}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveProducto(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Errores de stock */}
                {stockValidations.some(s => !s.esValido) && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Stock insuficiente:</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {stockValidations
                          .filter(s => !s.esValido)
                          .map((stock, index) => (
                            <li key={index}>
                              {stock.nombreProducto}: disponible {stock.stockDisponible}, solicitado {stock.cantidadSolicitada}
                            </li>
                          ))
                        }
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />

                {/* Total del pedido */}
                <div className="flex justify-end">
                  <Card className="w-64">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Total:
                        </span>
                        <span>${pedido.total.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay productos agregados al pedido</p>
                <p className="text-sm">Usa el formulario de arriba para agregar productos</p>
              </div>
            )}

            {getFieldError('detalles') && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{getFieldError('detalles')?.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || pedido.detalles.length === 0 || stockValidations.some(s => !s.esValido)}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Actualizar Pedido' : 'Crear Pedido'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PedidoFormAdvanced;