"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, ArrowUpDown, MoreHorizontal, Calendar, Clock, MapPin, Truck } from "lucide-react";
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

// Datos de ejemplo para pedidos
const pedidos = [
  {
    id: "PED-001",
    cliente: "Juan Pérez",
    fecha: "2023-11-15",
    hora: "14:30",
    direccion: "Calle Principal 123",
    repartidor: "Carlos Gómez",
    estado: "entregado",
    total: 78.50,
    items: 5
  },
  {
    id: "PED-002",
    cliente: "María López",
    fecha: "2023-11-15",
    hora: "15:45",
    direccion: "Avenida Central 456",
    repartidor: "Ana Martínez",
    estado: "en_camino",
    total: 45.75,
    items: 3
  },
  {
    id: "PED-003",
    cliente: "Roberto Sánchez",
    fecha: "2023-11-15",
    hora: "16:20",
    direccion: "Plaza Mayor 789",
    repartidor: "Luis Rodríguez",
    estado: "pendiente",
    total: 120.30,
    items: 8
  },
  {
    id: "PED-004",
    cliente: "Carmen Ruiz",
    fecha: "2023-11-14",
    hora: "11:15",
    direccion: "Calle Secundaria 234",
    repartidor: "Pedro Díaz",
    estado: "entregado",
    total: 65.90,
    items: 4
  },
  {
    id: "PED-005",
    cliente: "Francisco Torres",
    fecha: "2023-11-14",
    hora: "13:40",
    direccion: "Avenida Norte 567",
    repartidor: "Elena Castro",
    estado: "cancelado",
    total: 92.45,
    items: 6
  },
];

// Función para obtener el color del badge según el estado
function getEstadoBadge(estado: string) {
  switch (estado) {
    case "entregado":
      return <Badge className="bg-green-500">Entregado</Badge>;
    case "en_camino":
      return <Badge className="bg-blue-500">En camino</Badge>;
    case "pendiente":
      return <Badge className="bg-yellow-500">Pendiente</Badge>;
    case "cancelado":
      return <Badge className="bg-red-500">Cancelado</Badge>;
    default:
      return <Badge>{estado}</Badge>;
  }
}

export default function PedidosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");

  // Filtrar pedidos según los criterios de búsqueda y filtro
  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = searchTerm === "" || 
      pedido.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.direccion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterEstado === "todos" || pedido.estado === filterEstado;
    
    return matchesSearch && matchesFilter;
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

          {/* Tarjetas de estadísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">125</div>
                <p className="text-xs text-muted-foreground">+5.2% respecto al mes anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Entregados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">71.2% del total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-muted-foreground">22.4% del total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$68.45</div>
                <p className="text-xs text-muted-foreground">+$3.20 respecto al mes anterior</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por ID, cliente o dirección..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="estado" className="whitespace-nowrap">Estado:</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger id="estado" className="w-[180px]">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="en_camino">En camino</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    <TableHead className="w-[100px]">
                      <div className="flex items-center">
                        ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Cliente
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Repartidor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPedidos.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell className="font-medium">{pedido.id}</TableCell>
                      <TableCell>{pedido.cliente}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {pedido.fecha}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {pedido.hora}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {pedido.direccion}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                          {pedido.repartidor}
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(pedido.estado)}</TableCell>
                      <TableCell className="text-right">${pedido.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                            <DropdownMenuItem>Editar pedido</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Cambiar estado</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Cancelar pedido</DropdownMenuItem>
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