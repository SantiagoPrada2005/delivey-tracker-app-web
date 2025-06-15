"use client";

import { useState, useEffect } from "react";
import { useRepartidores } from '@/hooks/useRepartidores';
import { useAuth } from '@/hooks/useAuth';
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
} from '@/components/ui/sidebar'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserAuthNav } from '@/components/user-auth-nav'
import { Bell, Home, Package, Users, ShoppingBag, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Search, ArrowUpDown, MoreHorizontal, Phone, Calendar } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Función para obtener el nombre completo del repartidor
function getNombreCompleto(repartidor: { nombre: string; apellido: string }) {
  return `${repartidor.nombre} ${repartidor.apellido}`;
}

// Función para obtener las iniciales del nombre
function getInitials(nombre: string, apellido: string) {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

// Función para obtener el color del badge según el estado
function getEstadoBadge(disponible: boolean) {
  if (disponible) {
    return <Badge className="bg-green-500">Disponible</Badge>;
  } else {
    return <Badge variant="secondary">No disponible</Badge>;
  }
}

export default function RepartidoresPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { 
    repartidores, 
    loading, 
    error, 
    fetchRepartidores, 
    updateRepartidor, 
    deleteRepartidor,
    clearError 
  } = useRepartidores();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("todos");

  // Cargar repartidores al montar el componente
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchRepartidores();
    }
  }, [isAuthenticated, authLoading, fetchRepartidores]);

  // Limpiar errores cuando se desmonta el componente
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

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

  // Filtrar repartidores según el término de búsqueda y tab seleccionado
  const filteredRepartidores = repartidores.filter(repartidor => {
    const matchesSearch = searchTerm === "" || 
      repartidor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repartidor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repartidor.email && repartidor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (repartidor.telefono && repartidor.telefono.includes(searchTerm));
    
    const matchesTab = selectedTab === "todos" || 
      (selectedTab === "disponibles" && repartidor.disponible) ||
      (selectedTab === "no-disponibles" && !repartidor.disponible);
    
    return matchesSearch && matchesTab;
  });

  // Mostrar loading si está autenticando o cargando datos
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando repartidores...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Debes iniciar sesión para ver esta página.</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-lg font-semibold">Repartidores</h1>
          </div>
        </header>
        
        {/* Contenido de la página */}
        <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold">Gestión de Repartidores</h1>
            <Button>
              <Truck className="mr-2 h-4 w-4" />
              Nuevo Repartidor
            </Button>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Repartidores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{repartidores.length}</div>
                <p className="text-xs text-muted-foreground">Repartidores registrados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Repartidores Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{repartidores.filter(r => r.disponible).length}</div>
                <p className="text-xs text-muted-foreground">{repartidores.length > 0 ? Math.round((repartidores.filter(r => r.disponible).length / repartidores.length) * 100) : 0}% del total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">No Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{repartidores.filter(r => !r.disponible).length}</div>
                <p className="text-xs text-muted-foreground">Repartidores no disponibles</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Registrados Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {repartidores.filter(r => {
                    const today = new Date().toISOString().split('T')[0];
                    const createdDate = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '';
                    return createdDate === today;
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">Nuevos registros</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, apellido, email o teléfono..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="todos">Todos ({repartidores.length})</TabsTrigger>
                  <TabsTrigger value="disponibles">Disponibles ({repartidores.filter(r => r.disponible).length})</TabsTrigger>
                  <TabsTrigger value="no-disponibles">No disponibles ({repartidores.filter(r => !r.disponible).length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Tabla de repartidores */}
          <Card>
            <CardHeader>
              <CardTitle>Repartidores</CardTitle>
              <CardDescription>Gestiona tu equipo de repartidores desde aquí</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <div className="flex items-center">
                        ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Repartidor</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRepartidores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {error ? (
                            <div className="text-red-500">
                              Error: {error}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="ml-2"
                                onClick={() => fetchRepartidores()}
                              >
                                Reintentar
                              </Button>
                            </div>
                          ) : (
                            "No se encontraron repartidores"
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRepartidores.map((repartidor) => (
                      <TableRow key={repartidor.id}>
                        <TableCell className="font-medium">#{repartidor.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(repartidor.nombre, repartidor.apellido)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{getNombreCompleto(repartidor)}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {repartidor.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                            {repartidor.telefono}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{repartidor.email}</div>
                        </TableCell>
                        <TableCell>{getEstadoBadge(repartidor.disponible)}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                            {repartidor.createdAt ? new Date(repartidor.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                              <DropdownMenuItem>Editar información</DropdownMenuItem>
                              <DropdownMenuItem>Ver pedidos asignados</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {repartidor.disponible ? (
                                <DropdownMenuItem 
                                  className="text-amber-600"
                                  onClick={() => updateRepartidor(repartidor.id.toString(), { disponible: false })}
                                >
                                  Marcar como no disponible
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-green-600"
                                  onClick={() => updateRepartidor(repartidor.id.toString(), { disponible: true })}
                                >
                                  Marcar como disponible
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm('¿Estás seguro de que quieres eliminar este repartidor?')) {
                                    deleteRepartidor(repartidor.id.toString());
                                  }
                                }}
                              >
                                Eliminar repartidor
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}