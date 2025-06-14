"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, 
  Search, 
  MoreHorizontal, 
  Clock, 
  Truck, 
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import { toast } from "@/hooks/use-toast";
// Función temporal para toast hasta que se implemente correctamente
const toast = ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
  console.log(`Toast: ${title} - ${description}`);
};

// Tipos para los pedidos basados en el schema de la base de datos
interface Pedido {
  id: number;
  clienteId: number;
  estado: 'pendiente' | 'en_proceso' | 'en_camino' | 'entregado' | 'cancelado';
  total: number;
  direccionEntrega: string;
  fechaEntrega?: Date;
  organizationId: number;
  createdAt: Date;
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
  };
  asignaciones?: {
    id: number;
    repartidorId: number;
    fechaAsignacion: Date;
    estado: 'asignado' | 'en_camino' | 'entregado' | 'cancelado';
    repartidor?: {
      nombre: string;
      apellido: string;
    };
  }[];
  detalles?: {
    id: number;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    producto?: {
      nombre: string;
    };
  }[];
}

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  direccion: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

interface EstadisticasEntrega {
  tiempoPromedioEntrega: number; // en minutos
  pedidosEntregadosATiempo: number;
  pedidosEntregadosTarde: number;
  tiempoMinimoEntrega: number;
  tiempoMaximoEntrega: number;
  tendenciaTiempoEntrega: 'mejorando' | 'empeorando' | 'estable';
}

// Función para obtener el color del badge según el estado
function getEstadoBadge(estado: string) {
  switch (estado) {
    case "entregado":
      return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Entregado</Badge>;
    case "en_camino":
      return <Badge className="bg-blue-500 text-white"><Truck className="w-3 h-3 mr-1" />En camino</Badge>;
    case "en_proceso":
      return <Badge className="bg-orange-500 text-white"><Timer className="w-3 h-3 mr-1" />En proceso</Badge>;
    case "pendiente":
      return <Badge className="bg-yellow-500 text-black"><AlertCircle className="w-3 h-3 mr-1" />Pendiente</Badge>;
    case "cancelado":
      return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
    default:
      return <Badge>{estado}</Badge>;
  }
}

// Función para calcular el tiempo de entrega
function calcularTiempoEntrega(fechaCreacion: Date, fechaEntrega?: Date): number {
  if (!fechaEntrega) return 0;
  const diff = fechaEntrega.getTime() - fechaCreacion.getTime();
  return Math.round(diff / (1000 * 60)); // en minutos
}

// Función para formatear tiempo en formato legible
function formatearTiempo(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas}h ${mins}m`;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [estadisticas, setEstadisticas] = useState<EstadisticasEntrega | null>(null);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    clienteId: '',
    direccionEntrega: '',
    fechaEntrega: '',
    detalles: [{ productoId: '', cantidad: 1, precioUnitario: 0 }]
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadPedidos();
    loadClientes();
    loadProductos();
    loadEstadisticas();
  }, []);

  const loadPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos');
      const data = await response.json();
      if (data.success) {
        setPedidos(data.pedidos);
      }
    } catch (error) {
      console.error('Error loading pedidos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes');
      const data = await response.json();
      if (data.success) {
        setClientes(data.clientes);
      }
    } catch (error) {
      console.error('Error loading clientes:', error);
    }
  };

  const loadProductos = async () => {
    try {
      const response = await fetch('/api/productos');
      const data = await response.json();
      if (data.success) {
        setProductos(data.productos);
      }
    } catch (error) {
      console.error('Error loading productos:', error);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const response = await fetch('/api/pedidos/estadisticas');
      const data = await response.json();
      if (data.success) {
        setEstadisticas(data.estadisticas);
      }
    } catch (error) {
      console.error('Error loading estadísticas:', error);
    }
  };

  const handleCreatePedido = async () => {
    try {
      const total = formData.detalles.reduce((sum, detalle) => {
        return sum + (detalle.cantidad * detalle.precioUnitario);
      }, 0);

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          total,
          fechaEntrega: formData.fechaEntrega ? new Date(formData.fechaEntrega) : null
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Éxito",
          description: "Pedido creado correctamente"
        });
        setIsCreateDialogOpen(false);
        resetForm();
        loadPedidos();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error creating pedido:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el pedido",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePedido = async () => {
    if (!selectedPedido) return;

    try {
      const response = await fetch('/api/pedidos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedPedido.id,
          ...formData
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Éxito",
          description: "Pedido actualizado correctamente"
        });
        setIsEditDialogOpen(false);
        setSelectedPedido(null);
        resetForm();
        loadPedidos();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating pedido:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el pedido",
        variant: "destructive"
      });
    }
  };

  const handleDeletePedido = async (id: number) => {
    try {
      const response = await fetch('/api/pedidos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Éxito",
          description: "Pedido eliminado correctamente"
        });
        loadPedidos();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting pedido:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el pedido",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      clienteId: '',
      direccionEntrega: '',
      fechaEntrega: '',
      detalles: [{ productoId: '', cantidad: 1, precioUnitario: 0 }]
    });
  };

  const openEditDialog = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setFormData({
      clienteId: pedido.clienteId.toString(),
      direccionEntrega: pedido.direccionEntrega,
      fechaEntrega: pedido.fechaEntrega ? new Date(pedido.fechaEntrega).toISOString().slice(0, 16) : '',
      detalles: pedido.detalles ? pedido.detalles.map(detalle => ({
        productoId: detalle.productoId.toString(),
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario
      })) : [{ productoId: '', cantidad: 1, precioUnitario: 0 }]
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsViewDialogOpen(true);
  };

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

  const updateDetalle = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) => 
        i === index ? { ...detalle, [field]: value } : detalle
      )
    }));
  };

  // Filtrar pedidos según los criterios de búsqueda y filtro
  const filteredPedidos = pedidos.filter(pedido => {
    const cliente = pedido.cliente;
    const matchesSearch = searchTerm === "" || 
      pedido.id.toString().includes(searchTerm.toLowerCase()) ||
      (cliente && `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pedido.direccionEntrega.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterEstado === "todos" || pedido.estado === filterEstado;
    
    return matchesSearch && matchesFilter;
  });

  // Calcular estadísticas en tiempo real
  const pedidosEntregados = pedidos.filter(p => p.estado === 'entregado');
  const tiemposEntrega = pedidosEntregados
    .map(p => calcularTiempoEntrega(p.createdAt, p.fechaEntrega))
    .filter(t => t > 0);
  
  const tiempoPromedioEntrega = tiemposEntrega.length > 0 
    ? Math.round(tiemposEntrega.reduce((a, b) => a + b, 0) / tiemposEntrega.length)
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Cargando pedidos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar para desktop */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Contenido principal */}
      <div className="flex-1">
        {/* Header móvil */}
        <header className="lg:hidden flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <MobileSidebar />
          <h1 className="font-semibold text-lg">Pedidos</h1>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
            <Button>
              <Package className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          </div>

          {/* Tarjetas de estadísticas de tiempo de entrega */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pedidos.length}</div>
                <p className="text-xs text-muted-foreground">
                  Pedidos registrados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Entregados</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {pedidosEntregados.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pedidos.length > 0 ? Math.round((pedidosEntregados.length / pedidos.length) * 100) : 0}% del total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatearTiempo(tiempoPromedioEntrega)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tiempo de entrega
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Mínimo</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {tiemposEntrega.length > 0 ? formatearTiempo(Math.min(...tiemposEntrega)) : '0 min'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Entrega más rápida
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Máximo</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {tiemposEntrega.length > 0 ? formatearTiempo(Math.max(...tiemposEntrega)) : '0 min'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Entrega más lenta
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Controles de búsqueda y filtros */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pedidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_proceso">En proceso</SelectItem>
                  <SelectItem value="en_camino">En camino</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Pedido</DialogTitle>
                  <DialogDescription>
                    Complete la información del pedido y sus detalles.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cliente">Cliente</Label>
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
                      placeholder="Ingrese la dirección completa"
                      value={formData.direccionEntrega}
                      onChange={(e) => setFormData(prev => ({ ...prev, direccionEntrega: e.target.value }))}
                    />
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
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreatePedido}>
                    Crear Pedido
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabla de pedidos */}
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
                  {filteredPedidos.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell className="font-medium">#{pedido.id}</TableCell>
                      <TableCell>
                        {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : 'Cliente no encontrado'}
                      </TableCell>
                      <TableCell>
                        {new Date(pedido.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
                          <span className="text-sm text-muted-foreground">
                            {formatearTiempo(calcularTiempoEntrega(pedido.createdAt, pedido.fechaEntrega))}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">${pedido.total.toFixed(2)}</TableCell>
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
                            <DropdownMenuItem onClick={() => openViewDialog(pedido)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(pedido)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar pedido
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar pedido
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el pedido #{pedido.id}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePedido(pedido.id)} className="bg-red-600 hover:bg-red-700">
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>

        {/* Dialog para editar pedido */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Pedido #{selectedPedido?.id}</DialogTitle>
                <DialogDescription>
                  Modifique la información del pedido.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cliente-edit">Cliente</Label>
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
                    <Label htmlFor="fechaEntrega-edit">Fecha de Entrega</Label>
                    <Input
                      id="fechaEntrega-edit"
                      type="datetime-local"
                      value={formData.fechaEntrega}
                      onChange={(e) => setFormData(prev => ({ ...prev, fechaEntrega: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion-edit">Dirección de Entrega</Label>
                  <Textarea
                    id="direccion-edit"
                    placeholder="Ingrese la dirección completa"
                    value={formData.direccionEntrega}
                    onChange={(e) => setFormData(prev => ({ ...prev, direccionEntrega: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdatePedido}>
                  Actualizar Pedido
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog para ver detalles del pedido */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalles del Pedido #{selectedPedido?.id}</DialogTitle>
                <DialogDescription>
                  Información completa del pedido y sus detalles.
                </DialogDescription>
              </DialogHeader>
              {selectedPedido && (
                <div className="grid gap-6 py-4">
                  {/* Información general */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                      <p className="text-sm">
                        {selectedPedido.cliente ? `${selectedPedido.cliente.nombre} ${selectedPedido.cliente.apellido}` : 'Cliente no encontrado'}
                      </p>
                      {selectedPedido.cliente && (
                        <>
                          <p className="text-xs text-muted-foreground">{selectedPedido.cliente.email}</p>
                          <p className="text-xs text-muted-foreground">{selectedPedido.cliente.telefono}</p>
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                      <div>{getEstadoBadge(selectedPedido.estado)}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Fecha de Creación</Label>
                      <p className="text-sm">
                        {new Date(selectedPedido.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Fecha de Entrega</Label>
                      <p className="text-sm">
                        {selectedPedido.fechaEntrega 
                          ? new Date(selectedPedido.fechaEntrega).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'No programada'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Dirección de entrega */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Dirección de Entrega</Label>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedPedido.direccionEntrega}</p>
                  </div>

                  {/* Repartidor asignado */}
                  {selectedPedido.asignaciones && selectedPedido.asignaciones.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Repartidor Asignado</Label>
                      <p className="text-sm">
                        {selectedPedido.asignaciones[0].repartidor 
                          ? `${selectedPedido.asignaciones[0].repartidor.nombre} ${selectedPedido.asignaciones[0].repartidor.apellido}`
                          : 'Sin asignar'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Asignado el {new Date(selectedPedido.asignaciones[0].fechaAsignacion).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  )}

                  {/* Tiempo de entrega */}
                  {selectedPedido.estado === 'entregado' && selectedPedido.fechaEntrega && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Tiempo de Entrega</Label>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatearTiempo(calcularTiempoEntrega(selectedPedido.createdAt, selectedPedido.fechaEntrega))}
                      </p>
                    </div>
                  )}

                  {/* Detalles del pedido */}
                  {selectedPedido.detalles && selectedPedido.detalles.length > 0 && (
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
                            {selectedPedido.detalles.map((detalle) => (
                              <TableRow key={detalle.id}>
                                <TableCell>
                                  {detalle.producto?.nombre || `Producto ID: ${detalle.productoId}`}
                                </TableCell>
                                <TableCell className="text-center">{detalle.cantidad}</TableCell>
                                <TableCell className="text-right">${detalle.precioUnitario.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-medium">${detalle.subtotal.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex justify-end">
                        <div className="text-right">
                          <p className="text-lg font-bold">Total: ${selectedPedido.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
  );
}