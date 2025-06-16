"use client";

import { useState, useEffect } from "react";
import { useClientes } from "@/hooks/useClientes";
import { useProductos } from "@/hooks/useProductos";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import {
  PedidoStats,
  PedidoFilters,
  PedidosTable,
  PedidoForm,
  ClienteForm,
  PedidoViewDialog,
  PedidoActions,
  Pedido,
  PedidoFormData,
  ClienteFormData,
  generarFechaEntregaPorDefecto
} from "@/components/pedidos";

export default function PedidosPage() {
  const { toast } = useToast();
  const { clientes, loading: clientesLoading, createCliente, fetchClientes } = useClientes();
  const { productos, loading: productosLoading } = useProductos();


  // Estados principales
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estados de diálogos
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Estados de formularios
  const [formData, setFormData] = useState<PedidoFormData>({
    clienteId: "",
    fechaEntrega: generarFechaEntregaPorDefecto(),
    direccionEntrega: "",
    detalles: []
  });



  // Estados de selección y filtros
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  // Cargar datos iniciales
  useEffect(() => {
    fetchPedidos();
    fetchClientes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizar hora actual cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Funciones de API
  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pedidos');
      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      } else {
        throw new Error('Error al cargar pedidos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingPedido ? `/api/pedidos/${editingPedido.id}` : '/api/pedidos';
      const method = editingPedido ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: editingPedido ? "Pedido actualizado correctamente" : "Pedido creado correctamente",
        });
        setIsFormDialogOpen(false);
        resetForm();
        fetchPedidos();
      } else {
        throw new Error(editingPedido ? 'Error al actualizar pedido' : 'Error al crear pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: editingPedido ? "No se pudo actualizar el pedido" : "No se pudo crear el pedido",
        variant: "destructive",
      });
    }
  };

  const handleCreateCliente = async (clienteData: ClienteFormData) => {
    try {
      const nuevoCliente = await createCliente(clienteData);
      if (nuevoCliente) {
        setFormData(prev => ({ ...prev, clienteId: nuevoCliente.id.toString() }));
      }
      toast({
        title: "Éxito",
        description: "Cliente creado correctamente",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (pedido: Pedido) => {
    try {
      const response = await fetch(`/api/pedidos/${pedido.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Pedido eliminado correctamente",
        });
        fetchPedidos();
      } else {
        throw new Error('Error al eliminar pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el pedido",
        variant: "destructive",
      });
    }
  };

  // Funciones de utilidad
  const resetForm = () => {
    setFormData({
      clienteId: "",
      fechaEntrega: generarFechaEntregaPorDefecto(),
      direccionEntrega: "",
      detalles: []
    });
    setEditingPedido(null);
  };



  const handleEdit = (pedido: Pedido) => {
    setEditingPedido(pedido);
    setFormData({
      clienteId: pedido.clienteId.toString(),
      fechaEntrega: typeof pedido.fechaEntrega === 'string' ? pedido.fechaEntrega : (pedido.fechaEntrega?.toISOString().split('T')[0] || generarFechaEntregaPorDefecto()),
      direccionEntrega: pedido.direccionEntrega,
      detalles: pedido.detalles?.map(detalle => ({
        productoId: detalle.productoId.toString(),
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario
      })) || []
    });
    setIsFormDialogOpen(true);
  };

  const handleView = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsViewDialogOpen(true);
  };

  const handleCreateClick = () => {
    resetForm();
    setIsFormDialogOpen(true);
  };

  // Filtrar pedidos
  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = 
      pedido.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.direccionEntrega.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === "todos" || pedido.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calcular estadísticas
  const stats = {
    total: pedidos.length,
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    entregados: pedidos.filter(p => p.estado === 'entregado').length,
    totalVentas: pedidos.reduce((sum, p) => sum + p.total, 0),
    promedioVenta: pedidos.length > 0 ? pedidos.reduce((sum, p) => sum + p.total, 0) / pedidos.length : 0
  };

  if (loading || clientesLoading || productosLoading) {
    return (
    <SidebarProvider>
      <SidebarInset>
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando pedidos...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Pedidos</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <main className="flex-1 space-y-4 p-4 md:p-6 pt-6">
          <PedidoActions onCreateClick={handleCreateClick} />
          
          <PedidoStats 
            pedidos={pedidos}
            horaActual={currentTime.toLocaleTimeString('es-CO')}
            stats={stats}
            currentTime={currentTime}
          />
          
          <PedidoFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterEstado={statusFilter}
            setFilterEstado={setStatusFilter}
          />
          
          <PedidosTable
            pedidos={filteredPedidos}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          
          <PedidoForm
            isOpen={isFormDialogOpen}
            onOpenChange={setIsFormDialogOpen}
            formData={formData}
            setFormData={setFormData}
            clientes={clientes}
            productos={productos}
            onSubmit={handleSubmit}
            onCreateCliente={handleCreateCliente}
            fetchClientes={fetchClientes}
            resetForm={resetForm}
          />
          
          <ClienteForm
            onCreateCliente={handleCreateCliente}
            fetchClientes={fetchClientes}
          />
          
          <PedidoViewDialog
            isOpen={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
            pedido={selectedPedido}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}