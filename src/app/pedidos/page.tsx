"use client";

import { useState, useEffect } from "react";
import { usePedidos } from "@/hooks/usePedidos";
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
  PedidoViewDialog,
  PedidoActions,
  Pedido,
} from "@/components/pedidos";
import PedidoFormAdvanced from "@/components/pedidos/pedido-form-advanced";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function PedidosPage() {
  const { toast } = useToast();
  const { loading: clientesLoading, fetchClientes } = useClientes();
  const { loading: productosLoading } = useProductos();
  
  // Use the usePedidos hook for all pedido operations
  const {
    pedidos,
    loading: pedidosLoading,
    error: pedidosError,
    fetchPedidos,
    deletePedido,
    searchPedidos,
    filterPedidosByEstado,
    getEstadisticasPedidos,
    clearErrors
  } = usePedidos();

  // Estados principales
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estados de diálogos
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Estados de selección y filtros
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [editingPedidoId, setEditingPedidoId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  // Cargar datos iniciales
  useEffect(() => {
    fetchPedidos();
    fetchClientes();
  }, [fetchPedidos, fetchClientes]);

  // Actualizar hora actual cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Mostrar errores de pedidos
  useEffect(() => {
    if (pedidosError) {
      toast({
        title: "Error",
        description: pedidosError,
        variant: "destructive",
      });
      clearErrors();
    }
  }, [pedidosError, toast, clearErrors]);

  // Manejar éxito en la creación/edición de pedidos
  const handlePedidoSuccess = () => {
    toast({
      title: "Éxito",
      description: editingPedidoId ? "Pedido actualizado correctamente" : "Pedido creado correctamente",
    });
    setIsFormDialogOpen(false);
    setEditingPedidoId(null);
    fetchPedidos();
  };

  // Manejar cancelación del formulario
  const handlePedidoCancel = () => {
    setIsFormDialogOpen(false);
    setEditingPedidoId(null);
  };

  const handleDelete = async (pedido: Pedido) => {
    try {
      const success = await deletePedido(pedido.id);
      if (success) {
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
  const handleEdit = (pedido: Pedido) => {
    setEditingPedidoId(pedido.id);
    setIsFormDialogOpen(true);
  };

  const handleView = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsViewDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditingPedidoId(null);
    setIsFormDialogOpen(true);
  };

  // Filtrar pedidos usando las funciones del hook
  let filteredPedidos = pedidos;
  
  if (searchTerm) {
    filteredPedidos = searchPedidos(searchTerm);
  }
  
  if (statusFilter !== "todos") {
    filteredPedidos = filterPedidosByEstado(statusFilter as Pedido['estado']);
  }
  
  if (searchTerm && statusFilter !== "todos") {
    // Si hay ambos filtros, aplicar ambos
    filteredPedidos = searchPedidos(searchTerm).filter(pedido => 
      statusFilter === "todos" || pedido.estado === statusFilter
    );
  }

  // Obtener estadísticas usando el hook
  const stats = getEstadisticasPedidos();

  if (pedidosLoading || clientesLoading || productosLoading) {
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
          
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPedidoId ? 'Editar Pedido' : 'Crear Nuevo Pedido'}
                </DialogTitle>
                <DialogDescription>
                  {editingPedidoId 
                    ? 'Modifica los detalles del pedido existente.' 
                    : 'Complete la información para crear un nuevo pedido.'}
                </DialogDescription>
              </DialogHeader>
              <PedidoFormAdvanced
                pedidoId={editingPedidoId || undefined}
                onSuccess={handlePedidoSuccess}
                onCancel={handlePedidoCancel}
              />
            </DialogContent>
          </Dialog>
          
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