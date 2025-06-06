'use client'

import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Search, Filter, Clock, Package, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

// Datos de ejemplo para notificaciones de stock
const notificacionesStock = [
  {
    id: "stock-001",
    titulo: "Stock bajo - Pizza Margherita",
    descripcion: "Solo quedan 3 unidades disponibles. Se recomienda reabastecer pronto.",
    fecha: "2023-11-15 10:00",
    leida: false,
    tipo: "stock_bajo",
    productoId: "PROD-001",
    producto: "Pizza Margherita",
    stockActual: 3,
    stockMinimo: 5,
    categoria: "Pizzas",
    prioridad: "media"
  },
  {
    id: "stock-002",
    titulo: "Producto agotado - Hamburguesa Clásica",
    descripcion: "El producto está completamente agotado. No hay unidades disponibles.",
    fecha: "2023-11-15 09:30",
    leida: false,
    tipo: "agotado",
    productoId: "PROD-002",
    producto: "Hamburguesa Clásica",
    stockActual: 0,
    stockMinimo: 10,
    categoria: "Hamburguesas",
    prioridad: "alta"
  },
  {
    id: "stock-003",
    titulo: "Stock crítico - Coca Cola 500ml",
    descripcion: "Solo queda 1 unidad. Stock en nivel crítico.",
    fecha: "2023-11-15 11:15",
    leida: true,
    tipo: "critico",
    productoId: "PROD-003",
    producto: "Coca Cola 500ml",
    stockActual: 1,
    stockMinimo: 20,
    categoria: "Bebidas",
    prioridad: "alta"
  },
  {
    id: "stock-004",
    titulo: "Stock reabastecido - Papas Fritas",
    descripcion: "El stock ha sido reabastecido exitosamente. Ahora hay 50 unidades disponibles.",
    fecha: "2023-11-15 08:45",
    leida: true,
    tipo: "reabastecido",
    productoId: "PROD-004",
    producto: "Papas Fritas",
    stockActual: 50,
    stockMinimo: 15,
    categoria: "Acompañamientos",
    prioridad: "baja"
  },
  {
    id: "stock-005",
    titulo: "Stock bajo - Ensalada César",
    descripcion: "Quedan 4 unidades. Considerar reabastecimiento.",
    fecha: "2023-11-15 12:30",
    leida: false,
    tipo: "stock_bajo",
    productoId: "PROD-005",
    producto: "Ensalada César",
    stockActual: 4,
    stockMinimo: 8,
    categoria: "Ensaladas",
    prioridad: "media"
  }
];

function getIconoTipo(tipo: string) {
  switch (tipo) {
    case "stock_bajo":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "agotado":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "critico":
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case "reabastecido":
      return <Package className="h-4 w-4 text-green-500" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
}

function getBadgeVariant(tipo: string) {
  switch (tipo) {
    case "stock_bajo":
      return "outline";
    case "agotado":
      return "destructive";
    case "critico":
      return "destructive";
    case "reabastecido":
      return "secondary";
    default:
      return "outline";
  }
}

function getPrioridadColor(prioridad: string) {
  switch (prioridad) {
    case "alta":
      return "text-red-600";
    case "media":
      return "text-yellow-600";
    case "baja":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
}

interface NotificacionStock {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
  tipo: string;
  productoId: string;
  producto: string;
  stockActual: number;
  stockMinimo: number;
  categoria: string;
  prioridad: string;
}

function NotificationCard({ notificacion, onMarcarLeida }: { notificacion: NotificacionStock, onMarcarLeida: (id: string) => void }) {
  const porcentajeStock = (notificacion.stockActual / notificacion.stockMinimo) * 100;
  
  return (
    <Card className={`mb-4 ${!notificacion.leida ? 'border-l-4 border-l-yellow-500' : ''}`}>
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
                <Badge variant="outline" className={`text-xs ${getPrioridadColor(notificacion.prioridad)}`}>
                  {notificacion.prioridad.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {notificacion.descripcion}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <span className="font-medium">Producto:</span> {notificacion.producto}
                </div>
                <div>
                  <span className="font-medium">Categoría:</span> {notificacion.categoria}
                </div>
                <div>
                  <span className="font-medium">Stock actual:</span> 
                  <span className={`ml-1 font-semibold ${
                    notificacion.stockActual === 0 ? 'text-red-600' :
                    notificacion.stockActual <= notificacion.stockMinimo ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {notificacion.stockActual} unidades
                  </span>
                </div>
                <div>
                  <span className="font-medium">Stock mínimo:</span> {notificacion.stockMinimo} unidades
                </div>
                <div>
                  <span className="font-medium">Código:</span> {notificacion.productoId}
                </div>
                <div>
                  <span className="font-medium">Nivel:</span> 
                  <span className={`ml-1 font-semibold ${
                    porcentajeStock === 0 ? 'text-red-600' :
                    porcentajeStock <= 50 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {porcentajeStock.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              {/* Barra de progreso del stock */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Nivel de stock</span>
                  <span>{notificacion.stockActual}/{notificacion.stockMinimo}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      porcentajeStock === 0 ? 'bg-red-500' :
                      porcentajeStock <= 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(porcentajeStock, 100)}%` }}
                  ></div>
                </div>
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
                <Link href={`/productos?id=${notificacion.productoId}`}>
                  Ver producto
                </Link>
              </Button>
              {(notificacion.tipo === 'agotado' || notificacion.tipo === 'critico' || notificacion.tipo === 'stock_bajo') && (
                <Button size="sm">
                  Reabastecer
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificacionesStockPage() {
  const [notificaciones, setNotificaciones] = useState(notificacionesStock);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
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
                            notificacion.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
                            notificacion.categoria.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideTipo = filtroTipo === "todos" || notificacion.tipo === filtroTipo;
    const coincidePrioridad = filtroPrioridad === "todos" || notificacion.prioridad === filtroPrioridad;
    const coincideEstado = filtroEstado === "todos" || 
                          (filtroEstado === "leidas" && notificacion.leida) ||
                          (filtroEstado === "no_leidas" && !notificacion.leida);
    
    return coincideBusqueda && coincideTipo && coincidePrioridad && coincideEstado;
  });

  const contarNoLeidas = () => notificaciones.filter(n => !n.leida).length;
  const contarPorTipo = (tipo: string) => notificaciones.filter(n => n.tipo === tipo).length;
  const contarPorPrioridad = (prioridad: string) => notificaciones.filter(n => n.prioridad === prioridad).length;

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
          <h1 className="font-semibold text-lg">Alertas de Stock</h1>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
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
                  <AlertTriangle className="mr-3 h-6 w-6" />
                  Alertas de Stock
                </h1>
                <p className="text-muted-foreground">
                  Monitorea el inventario y gestiona alertas de stock bajo
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

          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {contarPorTipo('agotado')}
                  </div>
                  <div className="text-sm text-muted-foreground">Agotados</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {contarPorTipo('stock_bajo') + contarPorTipo('critico')}
                  </div>
                  <div className="text-sm text-muted-foreground">Stock bajo</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {contarPorPrioridad('alta')}
                  </div>
                  <div className="text-sm text-muted-foreground">Alta prioridad</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {contarNoLeidas()}
                  </div>
                  <div className="text-sm text-muted-foreground">Sin leer</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar productos..."
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
                      <SelectItem value="agotado">Agotado</SelectItem>
                      <SelectItem value="critico">Crítico</SelectItem>
                      <SelectItem value="stock_bajo">Stock bajo</SelectItem>
                      <SelectItem value="reabastecido">Reabastecido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridad</label>
                  <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
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
                      setFiltroPrioridad("todos");
                      setFiltroEstado("todos");
                    }}
                    className="w-full"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpiar
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
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay alertas de stock</h3>
                    <p className="text-muted-foreground">
                      {busqueda || filtroTipo !== "todos" || filtroPrioridad !== "todos" || filtroEstado !== "todos"
                        ? "No se encontraron alertas que coincidan con los filtros aplicados."
                        : "No tienes alertas de stock en este momento."}
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
        </main>
      </div>
    </div>
  );
}