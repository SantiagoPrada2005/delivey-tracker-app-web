import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { PedidoFormData, ClienteFormData } from "./types";
import { generarFechaEntregaPorDefecto } from "./utils";
import ClienteForm from './cliente-form';
import { Producto } from "@/hooks/useProductos";
import { Cliente } from "@/hooks/useClientes";

interface PedidoFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PedidoFormData;
  setFormData: (data: PedidoFormData | ((prev: PedidoFormData) => PedidoFormData)) => void;
  clientes: Cliente[];
  productos: Producto[];
  onSubmit: () => void;
  onCreateCliente: (clienteData: ClienteFormData) => void;
  fetchClientes: () => void;
  resetForm: () => void;
  title?: string;
  submitLabel?: string;
}

export default function PedidoForm({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  clientes,
  productos,
  onSubmit,
  onCreateCliente,
  fetchClientes,
  resetForm,
  title = "Crear Nuevo Pedido",
  submitLabel = "Crear Pedido"
}: PedidoFormProps) {

  const addDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, { productoId: '', cantidad: 1, precioUnitario: 0 }]
    }));
  };

  const removeDetalle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const updateDetalle = (index: number, field: keyof PedidoFormData['detalles'][0], value: string | number) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) => 
        i === index ? { ...detalle, [field]: value } : detalle
      )
    }));
  };

  // Inicializar fecha de entrega por defecto cuando se abre el formulario
  useEffect(() => {
    if (isOpen && !formData.fechaEntrega) {
      setFormData(prev => ({
        ...prev,
        fechaEntrega: generarFechaEntregaPorDefecto()
      }));
    }
  }, [isOpen, formData.fechaEntrega, setFormData]);

  const clienteSeleccionado = clientes.find(c => c.id.toString() === formData.clienteId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (open) {
        fetchClientes();
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Complete la información del pedido y sus detalles.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cliente">Cliente</Label>
                <ClienteForm
                  onCreateCliente={onCreateCliente}
                  fetchClientes={fetchClientes}
                />
              </div>
              <Select value={formData.clienteId} onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaEntrega">Fecha de Entrega</Label>
              <Input
                id="fechaEntrega"
                type="datetime-local"
                value={formData.fechaEntrega}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaEntrega: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección de Entrega</Label>
            <Textarea
              id="direccion"
              placeholder={clienteSeleccionado?.direccion || "Ingrese la dirección completa"}
              value={formData.direccionEntrega}
              onChange={(e) => setFormData(prev => ({ ...prev, direccionEntrega: e.target.value }))}
            />
            {clienteSeleccionado && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Cliente:</strong> {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</p>
                <p><strong>Teléfono:</strong> {clienteSeleccionado.telefono}</p>
                <p><strong>Email:</strong> {clienteSeleccionado.email}</p>
                {clienteSeleccionado.direccion && (
                  <p><strong>Dirección registrada:</strong> {clienteSeleccionado.direccion}</p>
                )}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Detalles del Pedido</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDetalle}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar Producto
              </Button>
            </div>
            {formData.detalles.map((detalle, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 items-end">
                <div className="space-y-2">
                  <Label>Producto</Label>
                  <Select 
                    value={detalle.productoId} 
                    onValueChange={(value) => {
                      const producto = productos.find(p => p.id.toString() === value);
                      updateDetalle(index, 'productoId', value);
                      if (producto) {
                        updateDetalle(index, 'precioUnitario', producto.precio);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((producto) => (
                        <SelectItem key={producto.id} value={producto.id.toString()}>
                          {producto.nombre} - ${producto.precio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={detalle.cantidad}
                    onChange={(e) => updateDetalle(index, 'cantidad', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio Unit.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={detalle.precioUnitario}
                    onChange={(e) => updateDetalle(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeDetalle(index)}
                  disabled={formData.detalles.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="text-right">
              <p className="text-lg font-semibold">
                Total: ${formData.detalles.reduce((sum, detalle) => sum + (detalle.cantidad * detalle.precioUnitario), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}