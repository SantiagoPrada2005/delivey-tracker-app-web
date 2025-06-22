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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold">Gestión de Repartidores</h1>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Repartidor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Repartidor</DialogTitle>
                  <DialogDescription>
                    Asigna un usuario de tu organización como repartidor.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="user-select">Usuario *</Label>
                    <Select value={selectedUserId} onValueChange={handleUserSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Nombre"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="apellido">Apellido *</Label>
                      <Input
                        id="apellido"
                        value={formData.apellido}
                        onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                        placeholder="Apellido"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="Número de teléfono"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email (opcional)"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleCreateRepartidor}
                    disabled={isCreating || !selectedUserId || !formData.nombre || !formData.apellido || !formData.telefono}
                  >
                    {isCreating ? 'Creando...' : 'Crear Repartidor'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                                {repartidor.userDisplayName && (
                                  <div>Usuario: {repartidor.userDisplayName}</div>
                                )}
                                {repartidor.userRole && (
                                  <div>Rol: {repartidor.userRole}</div>
                                )}
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
                          <div className="text-sm">
                            {repartidor.email && (
                              <div>{repartidor.email}</div>
                            )}
                            {repartidor.userEmail && repartidor.userEmail !== repartidor.email && (
                              <div className="text-xs text-muted-foreground">
                                Usuario: {repartidor.userEmail}
                              </div>
                            )}
                          </div>
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
    </DashboardLayout>
  );
}