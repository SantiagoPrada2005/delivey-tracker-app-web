"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Search, ArrowUpDown, MoreHorizontal, Phone, MapPin, Calendar, Star } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Datos de ejemplo para repartidores
const repartidores = [
  {
    id: "REP-001",
    nombre: "Carlos Gómez",
    avatar: "",
    telefono: "555-123-4567",
    zona: "Centro",
    estado: "activo",
    pedidosHoy: 8,
    pedidosTotal: 245,
    valoracion: 4.8,
    fechaAlta: "2023-01-15"
  },
  {
    id: "REP-002",
    nombre: "Ana Martínez",
    avatar: "",
    telefono: "555-234-5678",
    zona: "Norte",
    estado: "activo",
    pedidosHoy: 6,
    pedidosTotal: 189,
    valoracion: 4.9,
    fechaAlta: "2023-02-20"
  },
  {
    id: "REP-003",
    nombre: "Luis Rodríguez",
    avatar: "",
    telefono: "555-345-6789",
    zona: "Sur",
    estado: "inactivo",
    pedidosHoy: 0,
    pedidosTotal: 156,
    valoracion: 4.5,
    fechaAlta: "2023-03-10"
  },
  {
    id: "REP-004",
    nombre: "Pedro Díaz",
    avatar: "",
    telefono: "555-456-7890",
    zona: "Este",
    estado: "activo",
    pedidosHoy: 5,
    pedidosTotal: 178,
    valoracion: 4.7,
    fechaAlta: "2023-02-05"
  },
  {
    id: "REP-005",
    nombre: "Elena Castro",
    avatar: "",
    telefono: "555-567-8901",
    zona: "Oeste",
    estado: "activo",
    pedidosHoy: 7,
    pedidosTotal: 210,
    valoracion: 4.6,
    fechaAlta: "2023-01-25"
  },
];

// Función para obtener el color del badge según el estado
function getEstadoBadge(estado: string) {
  switch (estado) {
    case "activo":
      return <Badge className="bg-green-500">Activo</Badge>;
    case "inactivo":
      return <Badge variant="secondary">Inactivo</Badge>;
    case "en_ruta":
      return <Badge className="bg-blue-500">En ruta</Badge>;
    default:
      return <Badge>{estado}</Badge>;
  }
}

// Función para obtener las iniciales del nombre
function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export default function RepartidoresPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar repartidores según el término de búsqueda
  const filteredRepartidores = repartidores.filter(repartidor => {
    return searchTerm === "" || 
      repartidor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repartidor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repartidor.zona.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
          <h1 className="font-semibold text-lg">Repartidores</h1>
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
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 respecto al mes anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Repartidores Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">10</div>
                <p className="text-xs text-muted-foreground">83.3% del total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Entregados Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">+12% respecto a ayer</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valoración Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold mr-2">4.7</div>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-xs text-muted-foreground">+0.2 respecto al mes anterior</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, ID o zona..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Tabs defaultValue="todos">
                <TabsList>
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="activos">Activos</TabsTrigger>
                  <TabsTrigger value="inactivos">Inactivos</TabsTrigger>
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
                    <TableHead>Zona</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pedidos Hoy</TableHead>
                    <TableHead>Valoración</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRepartidores.map((repartidor) => (
                    <TableRow key={repartidor.id}>
                      <TableCell className="font-medium">{repartidor.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={repartidor.avatar} />
                            <AvatarFallback>{getInitials(repartidor.nombre)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{repartidor.nombre}</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              Desde {repartidor.fechaAlta}
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
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {repartidor.zona}
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(repartidor.estado)}</TableCell>
                      <TableCell>{repartidor.pedidosHoy}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {repartidor.valoracion}
                          <Star className="ml-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
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
                            {repartidor.estado === "activo" ? (
                              <DropdownMenuItem className="text-amber-600">Marcar como inactivo</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600">Marcar como activo</DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">Eliminar repartidor</DropdownMenuItem>
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
      </div>
    </div>
  );
}