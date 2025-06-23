"use client";

import { useState, useEffect, useCallback } from "react";
import { useRepartidores, type AvailableUser } from '@/hooks/useRepartidores';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowUpDown, MoreHorizontal, Phone, Calendar } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, User } from "lucide-react";

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
    createRepartidor,
    updateRepartidor, 
    deleteRepartidor,
    getAvailableUsers,
    clearError 
  } = useRepartidores();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("todos");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    disponible: true
  });
  const [isCreating, setIsCreating] = useState(false);

  // Cargar repartidores al montar el componente
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchRepartidores();
    }
  }, [isAuthenticated, authLoading, fetchRepartidores]);

  const loadAvailableUsers = useCallback(async () => {
    try {
      const users = await getAvailableUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error al cargar usuarios disponibles:', error);
    }
  }, [getAvailableUsers]);

  // Cargar usuarios disponibles cuando se abre el diálogo
  useEffect(() => {
    if (isCreateDialogOpen && isAuthenticated) {
      loadAvailableUsers();
    }
  }, [isCreateDialogOpen, isAuthenticated, loadAvailableUsers]);

  const handleCreateRepartidor = async () => {
    if (!selectedUserId || !formData.nombre || !formData.apellido || !formData.telefono) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createRepartidor({
        userId: parseInt(selectedUserId),
        ...formData
      });

      if (result) {
        setIsCreateDialogOpen(false);
        setSelectedUserId("");
        setFormData({
          nombre: "",
          apellido: "",
          telefono: "",
          email: "",
          disponible: true
        });
        await fetchRepartidores();
      }
    } catch (error) {
      console.error('Error al crear repartidor:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const selectedUser = availableUsers.find(user => user.id.toString() === userId);
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        email: selectedUser.email,
        nombre: selectedUser.displayName?.split(' ')[0] || '',
        apellido: selectedUser.displayName?.split(' ').slice(1).join(' ') || ''
      }));
    }
  };

  // Limpiar errores cuando se desmonta el componente
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);



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
    <DashboardLayout 
      currentPage="Repartidores"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Repartidores", href: "/repartidores" }
      ]}
    >
      <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Repartidores</h1>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto min-h-[44px] touch-target">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo Repartidor</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100vw-2rem)] max-w-[500px] mx-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-lg sm:text-xl">Crear Nuevo Repartidor</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Asigna un usuario existente como repartidor y completa su información.
                </DialogDescription>
              </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-select" className="text-sm font-medium">Usuario *</Label>
                    <Select value={selectedUserId} onValueChange={handleUserSelect}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue placeholder="Selecciona un usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()} className="min-h-[44px]">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{user.displayName || user.email}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Nombre"
                        className="min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido" className="text-sm font-medium">Apellido *</Label>
                      <Input
                        id="apellido"
                        value={formData.apellido}
                        onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                        placeholder="Apellido"
                        className="min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-medium">Teléfono *</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="Número de teléfono"
                      className="min-h-[44px]"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email (opcional)"
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
                <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isCreating}
                    className="w-full sm:w-auto min-h-[44px] touch-target order-2 sm:order-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleCreateRepartidor}
                    disabled={isCreating || !selectedUserId || !formData.nombre || !formData.apellido || !formData.telefono}
                    className="w-full sm:w-auto min-h-[44px] touch-target order-1 sm:order-2"
                  >
                    {isCreating ? 'Creando...' : 'Crear Repartidor'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total</p>
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{repartidores.length}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">Registrados</p>
              </div>
            </Card>
            <Card className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Disponibles</p>
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{repartidores.filter(r => r.disponible).length}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">Activos</p>
              </div>
            </Card>
            <Card className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">No Disponibles</p>
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{repartidores.filter(r => !r.disponible).length}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">Inactivos</p>
              </div>
            </Card>
            <Card className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Hoy</p>
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                  {repartidores.filter(r => {
                    const today = new Date().toISOString().split('T')[0];
                    const createdDate = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '';
                    return createdDate === today;
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">Nuevos</p>
              </div>
            </Card>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar repartidores..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
                  <TabsTrigger value="todos" className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">Todos ({repartidores.length})</span>
                    <span className="sm:hidden">Todos</span>
                  </TabsTrigger>
                  <TabsTrigger value="disponibles" className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">Disponibles ({repartidores.filter(r => r.disponible).length})</span>
                    <span className="sm:hidden">Disp.</span>
                  </TabsTrigger>
                  <TabsTrigger value="no-disponibles" className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">No disponibles ({repartidores.filter(r => !r.disponible).length})</span>
                    <span className="sm:hidden">No disp.</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Tabla de repartidores */}
          <Card className="overflow-hidden">
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
              <CardTitle className="text-base sm:text-lg">Repartidores</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Gestiona tu equipo de repartidores desde aquí</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="w-12 sm:w-16 px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center text-xs sm:text-sm">
                          <span className="hidden sm:inline">ID</span>
                          <span className="sm:hidden">#</span>
                          <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[140px] px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Repartidor</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[120px] px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Contacto</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[160px] px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Email</TableHead>
                      <TableHead className="min-w-[80px] px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Estado</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Fecha</TableHead>
                      <TableHead className="text-right w-12 sm:w-16 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredRepartidores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 sm:py-8 px-2 sm:px-4">
                        <div className="text-muted-foreground text-xs sm:text-sm">
                          {error ? (
                            <div className="text-red-500 space-y-2">
                              <div>Error: {error}</div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="min-h-[36px] touch-target"
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
                      <TableRow key={repartidor.id} className="border-b hover:bg-muted/50">
                        <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">#{repartidor.id}</TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                              <AvatarFallback className="text-xs sm:text-sm">{getInitials(repartidor.nombre, repartidor.apellido)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-xs sm:text-sm truncate">{getNombreCompleto(repartidor)}</div>
                              <div className="text-xs text-muted-foreground space-y-0.5">
                                <div className="sm:hidden truncate">{repartidor.telefono}</div>
                                {repartidor.userDisplayName && (
                                  <div className="hidden sm:block truncate">Usuario: {repartidor.userDisplayName}</div>
                                )}
                                {repartidor.userRole && (
                                  <div className="hidden sm:block truncate">Rol: {repartidor.userRole}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex items-center text-xs sm:text-sm">
                            <Phone className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{repartidor.telefono}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3">
                          <div className="text-xs sm:text-sm space-y-1">
                            {repartidor.email && (
                              <div className="truncate">{repartidor.email}</div>
                            )}
                            {repartidor.userEmail && repartidor.userEmail !== repartidor.email && (
                              <div className="text-xs text-muted-foreground truncate">
                                Usuario: {repartidor.userEmail}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">{getEstadoBadge(repartidor.disponible)}</TableCell>
                        <TableCell className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex items-center text-xs sm:text-sm">
                            <Calendar className="mr-1 h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">
                              {repartidor.createdAt ? new Date(repartidor.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-2 sm:px-4 py-2 sm:py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 touch-target">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 sm:w-48">
                              <DropdownMenuLabel className="text-xs sm:text-sm px-3 py-2">Acciones</DropdownMenuLabel>
                              <DropdownMenuItem className="text-xs sm:text-sm min-h-[36px] px-3 py-2 touch-target">
                                Ver perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs sm:text-sm min-h-[36px] px-3 py-2 touch-target">
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs sm:text-sm min-h-[36px] px-3 py-2 touch-target">
                                <span className="hidden sm:inline">Ver pedidos asignados</span>
                                <span className="sm:hidden">Pedidos</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {repartidor.disponible ? (
                                <DropdownMenuItem 
                                  className="text-amber-600 text-xs sm:text-sm min-h-[36px] px-3 py-2 touch-target"
                                  onClick={() => updateRepartidor(repartidor.id.toString(), { disponible: false })}
                                >
                                  <span className="hidden sm:inline">Marcar como no disponible</span>
                                  <span className="sm:hidden">No disponible</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-green-600 text-xs sm:text-sm min-h-[36px] px-3 py-2 touch-target"
                                  onClick={() => updateRepartidor(repartidor.id.toString(), { disponible: true })}
                                >
                                  <span className="hidden sm:inline">Marcar como disponible</span>
                                  <span className="sm:hidden">Disponible</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-red-600 text-xs sm:text-sm min-h-[36px] px-3 py-2 touch-target"
                                onClick={() => {
                                  if (confirm('¿Estás seguro de que quieres eliminar este repartidor?')) {
                                    deleteRepartidor(repartidor.id.toString());
                                  }
                                }}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                       ))
                     )}
                   </TableBody>
                 </Table>
               </div>
             </CardContent>
           </Card>
        </main>
    </DashboardLayout>
  );
}