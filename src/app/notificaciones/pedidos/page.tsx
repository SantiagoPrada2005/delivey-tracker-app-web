'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Clock, Package, ArrowLeft, Home, Users, Settings, BarChart3, Truck, MessageSquare, Check, X } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserAuthNav } from "@/components/user-auth-nav";

// Datos de ejemplo para notificaciones de pedidos
const notificacionesPedidos = [
  {
    id: "not-001",
    titulo: "Nuevo pedido recibido",
    descripcion: "Pedido #PED-123 de Juan Pérez por $85.50",
    fecha: "2023-11-15 14:30",
    leida: false,
    tipo: "nuevo_pedido",
    pedidoId: "PED-123",
    cliente: "Juan Pérez",
    monto: 85.50
  },
  {
    id: "not-002",
    titulo: "Pedido entregado",
    descripcion: "Pedido #PED-120 entregado exitosamente por Carlos Gómez",
    fecha: "2023-11-15 13:45",
    leida: true,
    tipo: "entregado",
    pedidoId: "PED-120",
    cliente: "María López",
    repartidor: "Carlos Gómez",
    monto: 67.25
  },
  {
    id: "not-003",
    titulo: "Pedido cancelado",
    descripcion: "El cliente canceló el pedido #PED-119 - Motivo: Cambio de planes",
    fecha: "2023-11-15 12:20",
    leida: false,
    tipo: "cancelado",
    pedidoId: "PED-119",
    cliente: "Ana Martínez",
    monto: 42.75
  },
  {
    id: "not-004",
    titulo: "Pedido en preparación",
    descripcion: "Pedido #PED-124 está siendo preparado en cocina",
    fecha: "2023-11-15 14:45",
    leida: false,
    tipo: "preparacion",
    pedidoId: "PED-124",
    cliente: "Roberto Silva",
    monto: 95.00
  },
  {
    id: "not-005",
    titulo: "Pedido en camino",
    descripcion: "Pedido #PED-122 salió para entrega con Ana Martínez",
    fecha: "2023-11-15 14:15",
    leida: true,
    tipo: "en_camino",
    pedidoId: "PED-122",
    cliente: "Luis García",
    repartidor: "Ana Martínez",
    monto: 73.50
  }
];

function getIconoTipo(tipo: string) {
  switch (tipo) {
    case "nuevo_pedido":
      return <Package className="h-4 w-4 text-blue-500" />;
    case "entregado":
      return <Check className="h-4 w-4 text-green-500" />;
    case "cancelado":
      return <X className="h-4 w-4 text-red-500" />;
    case "preparacion":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "en_camino":
      return <Package className="h-4 w-4 text-purple-500" />;
    default:
      return <Package className="h-4 w-4" />;
  }
}

function getBadgeVariant(tipo: string) {
  switch (tipo) {
    case "nuevo_pedido":
      return "default";
    case "entregado":
      return "secondary";
    case "cancelado":
      return "destructive";
    case "preparacion":
      return "outline";
    case "en_camino":
      return "secondary";
    default:
      return "outline";
  }
}

interface NotificacionPedido {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
  tipo: string;
  pedidoId: string;
  cliente: string;
  monto: number;
  repartidor?: string;
}

function NotificationCard({ notificacion, onMarcarLeida }: { notificacion: NotificacionPedido, onMarcarLeida: (id: string) => void }) {
  return (
    <Card className={`mb-4 ${!notificacion.leida ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {getIconoTipo(notificacion.tipo)}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className={`font-medium ${!notificacion.leida ? 'font-semibold' : ''}`}>
                  {notificacion.titulo}
                </h4>
                <Badge variant={getBadgeVariant(notificacion.tipo)} className="text-xs">
                  {notificacion.tipo.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {notificacion.descripcion}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Pedido:</span> {notificacion.pedidoId}
                </div>
                <div>
                  <span className="font-medium">Cliente:</span> {notificacion.cliente}
                </div>
                <div>
                  <span className="font-medium">Monto:</span> ${notificacion.monto.toFixed(2)}
                </div>
                {notificacion.repartidor && (
                  <div>
                    <span className="font-medium">Repartidor:</span> {notificacion.repartidor}
                  </div>
                )}
              </div>
              
              <div className="flex items-center mt-3 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {notificacion.fecha}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!notificacion.leida && (
              <Badge variant="secondary" className="text-xs">
                Nueva
              </Badge>
            )}
            <div className="flex flex-col space-y-2">
              {!notificacion.leida && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarcarLeida(notificacion.id)}
                >
                  Marcar como leída
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/pedidos?id=${notificacion.pedidoId}`}>
                  Ver pedido
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificacionesPedidosPage() {
  const [notificaciones, setNotificaciones] = useState(notificacionesPedidos);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const marcarComoLeida = (id: string) => {
    setNotificaciones(prev => 
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    );
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const notificacionesFiltradas = notificaciones.filter(notificacion => {
    const coincideBusqueda = notificacion.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            notificacion.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                            notificacion.pedidoId.toLowerCase().includes(busqueda.toLowerCase()) ||
                            notificacion.cliente.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideTipo = filtroTipo === "todos" || notificacion.tipo === filtroTipo;
    const coincideEstado = filtroEstado === "todos" || 
                          (filtroEstado === "leidas" && notificacion.leida) ||
                          (filtroEstado === "no_leidas" && !notificacion.leida);
    
    return coincideBusqueda && coincideTipo && coincideEstado;
  });

  const contarNoLeidas = () => notificaciones.filter(n => !n.leida).length;

  // Elementos del menú principal
  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Pedidos",
      url: "/pedidos",
      icon: Package,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: Users,
    },
    {
      title: "Productos",
      url: "/productos",
      icon: Package,
    },
    {
      title: "Repartidores",
      url: "/repartidores",
      icon: Truck,
    },
    {
      title: "Configuración",
      url: "/configuracion",
      icon: Settings,
    },
  ];

  // Elementos del menú de notificaciones
  const notificationItems = [
    {
      title: "Pedidos",
      url: "/notificaciones/pedidos",
      icon: Package,
      badge: "3",
    },
    {
      title: "Stock",
      url: "/notificaciones/stock",
      icon: BarChart3,
      badge: "2",
    },
    {
      title: "Mensajes",
      url: "/notificaciones/mensajes",
      icon: MessageSquare,
      badge: "5",
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Package className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">DeliveryTracker</span>
                    <span className="truncate text-xs">Gestión de entregas</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Notificaciones</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {notificationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <UserAuthNav />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <ThemeSwitcher />
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="px-4 py-2 text-xs text-muted-foreground">
            © 2023 DeliveryTracker. Todos los derechos reservados.
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-xl font-semibold">Notificaciones de Pedidos</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <main className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/notificaciones">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <Package className="mr-3 h-6 w-6" />
                  Notificaciones de Pedidos
                </h1>
                <p className="text-muted-foreground">
                  Gestiona todas las notificaciones relacionadas con pedidos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {contarNoLeidas()} sin leer
              </Badge>
              {contarNoLeidas() > 0 && (
                <Button onClick={marcarTodasComoLeidas}>
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar notificaciones..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los tipos</SelectItem>
                      <SelectItem value="nuevo_pedido">Nuevos pedidos</SelectItem>
                      <SelectItem value="entregado">Entregados</SelectItem>
                      <SelectItem value="cancelado">Cancelados</SelectItem>
                      <SelectItem value="preparacion">En preparación</SelectItem>
                      <SelectItem value="en_camino">En camino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="no_leidas">No leídas</SelectItem>
                      <SelectItem value="leidas">Leídas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBusqueda("");
                      setFiltroTipo("todos");
                      setFiltroEstado("todos");
                    }}
                    className="w-full"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de notificaciones */}
          <div className="space-y-4">
            {notificacionesFiltradas.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
                    <p className="text-muted-foreground">
                      {busqueda || filtroTipo !== "todos" || filtroEstado !== "todos"
                        ? "No se encontraron notificaciones que coincidan con los filtros aplicados."
                        : "No tienes notificaciones de pedidos en este momento."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              notificacionesFiltradas.map((notificacion) => (
                <NotificationCard
                  key={notificacion.id}
                  notificacion={notificacion}
                  onMarcarLeida={marcarComoLeida}
                />
              ))
            )}
          </div>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {notificaciones.filter(n => n.tipo === 'nuevo_pedido').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Nuevos pedidos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {notificaciones.filter(n => n.tipo === 'entregado').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Entregados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {notificaciones.filter(n => n.tipo === 'cancelado').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Cancelados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {contarNoLeidas()}
                  </div>
                  <div className="text-sm text-muted-foreground">Sin leer</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}