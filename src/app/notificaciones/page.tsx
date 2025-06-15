'use client'

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { UserAuthNav } from "@/components/user-auth-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Home, Package, Users, ShoppingBag, Truck, Settings, Bell, AlertTriangle, MessageSquare, Clock, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Datos de ejemplo para notificaciones
const notificaciones = {
  pedidos: [
    {
      id: "not-001",
      titulo: "Nuevo pedido recibido",
      descripcion: "Pedido #PED-123 de Juan Pérez por $85.50",
      fecha: "2023-11-15 14:30",
      leida: false,
      tipo: "nuevo_pedido"
    },
    {
      id: "not-002",
      titulo: "Pedido entregado",
      descripcion: "Pedido #PED-120 entregado exitosamente",
      fecha: "2023-11-15 13:45",
      leida: true,
      tipo: "entregado"
    },
    {
      id: "not-003",
      titulo: "Pedido cancelado",
      descripcion: "El cliente canceló el pedido #PED-119",
      fecha: "2023-11-15 12:20",
      leida: false,
      tipo: "cancelado"
    }
  ],
  stock: [
    {
      id: "stock-001",
      titulo: "Stock bajo",
      descripcion: "Pizza Margherita tiene solo 3 unidades disponibles",
      fecha: "2023-11-15 10:00",
      leida: false,
      tipo: "stock_bajo"
    },
    {
      id: "stock-002",
      titulo: "Producto agotado",
      descripcion: "Hamburguesa Clásica está agotada",
      fecha: "2023-11-15 09:30",
      leida: false,
      tipo: "agotado"
    }
  ],
  mensajes: [
    {
      id: "msg-001",
      titulo: "Mensaje de cliente",
      descripcion: "María López pregunta sobre el tiempo de entrega",
      fecha: "2023-11-15 15:20",
      leida: false,
      tipo: "cliente"
    },
    {
      id: "msg-002",
      titulo: "Mensaje de repartidor",
      descripcion: "Carlos Gómez reporta problema con la dirección",
      fecha: "2023-11-15 14:50",
      leida: true,
      tipo: "repartidor"
    }
  ]
};

function getIconoTipo(tipo: string) {
  switch (tipo) {
    case "nuevo_pedido":
      return <Package className="h-4 w-4 text-blue-500" />;
    case "entregado":
      return <Check className="h-4 w-4 text-green-500" />;
    case "cancelado":
      return <X className="h-4 w-4 text-red-500" />;
    case "stock_bajo":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "agotado":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "cliente":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "repartidor":
      return <MessageSquare className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

interface Notificacion {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
  tipo: string;
}

function NotificationCard({ notificacion, onMarcarLeida }: { notificacion: Notificacion, onMarcarLeida: (id: string) => void }) {
  return (
    <Card className={`mb-4 ${!notificacion.leida ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getIconoTipo(notificacion.tipo)}
            <div className="flex-1">
              <h4 className={`font-medium ${!notificacion.leida ? 'font-semibold' : ''}`}>
                {notificacion.titulo}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {notificacion.descripcion}
              </p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
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
            {!notificacion.leida && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarcarLeida(notificacion.id)}
              >
                Marcar como leída
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificacionesPage() {
  const [notificacionesState, setNotificacionesState] = useState(notificaciones);

  const marcarComoLeida = (id: string) => {
    setNotificacionesState(prev => {
      const newState = { ...prev };
      
      // Buscar en todas las categorías
      Object.keys(newState).forEach(categoria => {
        const index = newState[categoria as keyof typeof newState].findIndex((n: Notificacion) => n.id === id);
        if (index !== -1) {
          newState[categoria as keyof typeof newState][index].leida = true;
        }
      });
      
      return newState;
    });
  };

  const contarNoLeidas = (categoria: keyof typeof notificaciones) => {
    return notificacionesState[categoria].filter(n => !n.leida).length;
  };

  const marcarTodasComoLeidas = (categoria: keyof typeof notificaciones) => {
    setNotificacionesState(prev => ({
      ...prev,
      [categoria]: prev[categoria].map(n => ({ ...n, leida: true }))
    }));
  };

  // Definir los elementos del menú principal
  const mainMenuItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Pedidos", url: "/pedidos", icon: Package, badge: 25 },
    { title: "Clientes", url: "/clientes", icon: Users },
    { title: "Productos", url: "/productos", icon: ShoppingBag },
    { title: "Repartidores", url: "/repartidores", icon: Truck },
    { title: "Configuración", url: "/configuracion", icon: Settings },
  ];

  // Definir los elementos del menú de notificaciones
  const notificationItems = [
    { title: "Nuevos pedidos", url: "/notificaciones/pedidos", count: 5 },
    { title: "Alertas de stock", url: "/notificaciones/stock", count: 3 },
    { title: "Mensajes", url: "/notificaciones/mensajes", count: 2 },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Delivery Tracker</span>
              <span className="truncate text-xs text-muted-foreground">Gestión de entregas</span>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
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
                      <a href={item.url} className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.count > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {item.count}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t p-4">
          <div className="flex items-center justify-between">
            <UserAuthNav />
            <ThemeSwitcher />
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Notificaciones</h1>
          </div>
        </header>
        
        {/* Contenido de la página */}
        <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Centro de Notificaciones</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {Object.values(notificacionesState).flat().filter(n => !n.leida).length} sin leer
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="pedidos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pedidos" className="relative">
                Pedidos
                {contarNoLeidas('pedidos') > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {contarNoLeidas('pedidos')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="stock" className="relative">
                Stock
                {contarNoLeidas('stock') > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {contarNoLeidas('stock')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="mensajes" className="relative">
                Mensajes
                {contarNoLeidas('mensajes') > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {contarNoLeidas('mensajes')}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pedidos">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Package className="mr-2 h-5 w-5" />
                        Notificaciones de Pedidos
                      </CardTitle>
                      <CardDescription>
                        Nuevos pedidos, entregas y cancelaciones
                      </CardDescription>
                    </div>
                    {contarNoLeidas('pedidos') > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => marcarTodasComoLeidas('pedidos')}
                      >
                        Marcar todas como leídas
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {notificacionesState.pedidos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay notificaciones de pedidos
                    </p>
                  ) : (
                    notificacionesState.pedidos.map((notificacion) => (
                      <NotificationCard
                        key={notificacion.id}
                        notificacion={notificacion}
                        onMarcarLeida={marcarComoLeida}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stock">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        Alertas de Stock
                      </CardTitle>
                      <CardDescription>
                        Productos con stock bajo o agotados
                      </CardDescription>
                    </div>
                    {contarNoLeidas('stock') > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => marcarTodasComoLeidas('stock')}
                      >
                        Marcar todas como leídas
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {notificacionesState.stock.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay alertas de stock
                    </p>
                  ) : (
                    notificacionesState.stock.map((notificacion) => (
                      <NotificationCard
                        key={notificacion.id}
                        notificacion={notificacion}
                        onMarcarLeida={marcarComoLeida}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mensajes">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Mensajes
                      </CardTitle>
                      <CardDescription>
                        Mensajes de clientes y repartidores
                      </CardDescription>
                    </div>
                    {contarNoLeidas('mensajes') > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => marcarTodasComoLeidas('mensajes')}
                      >
                        Marcar todas como leídas
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {notificacionesState.mensajes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay mensajes
                    </p>
                  ) : (
                    notificacionesState.mensajes.map((notificacion) => (
                      <NotificationCard
                        key={notificacion.id}
                        notificacion={notificacion}
                        onMarcarLeida={marcarComoLeida}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}