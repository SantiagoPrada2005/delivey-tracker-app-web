'use client'

import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Search, Filter, Clock, User, ArrowLeft, Mail, Phone, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

// Datos de ejemplo para notificaciones de mensajes
const notificacionesMensajes = [
  {
    id: "msg-001",
    titulo: "Nueva reseña de cliente",
    descripcion: "María González ha dejado una reseña de 5 estrellas para su pedido #PED-001.",
    fecha: "2023-11-15 14:30",
    leida: false,
    tipo: "resena",
    remitente: {
      nombre: "María González",
      email: "maria.gonzalez@email.com",
      telefono: "+34 612 345 678",
      avatar: "/avatars/maria.jpg"
    },
    contenido: "Excelente servicio, la pizza llegó caliente y en tiempo récord. El repartidor fue muy amable. ¡Definitivamente volveré a pedir!",
    calificacion: 5,
    pedidoId: "PED-001",
    prioridad: "media"
  },
  {
    id: "msg-002",
    titulo: "Queja de cliente",
    descripcion: "Carlos Ruiz ha enviado una queja sobre el pedido #PED-002.",
    fecha: "2023-11-15 13:45",
    leida: false,
    tipo: "queja",
    remitente: {
      nombre: "Carlos Ruiz",
      email: "carlos.ruiz@email.com",
      telefono: "+34 698 765 432",
      avatar: "/avatars/carlos.jpg"
    },
    contenido: "El pedido llegó 45 minutos tarde y la comida estaba fría. Además, faltaba una de las bebidas que había pedido. Muy decepcionado con el servicio.",
    calificacion: 2,
    pedidoId: "PED-002",
    prioridad: "alta"
  },
  {
    id: "msg-003",
    titulo: "Consulta sobre alérgenos",
    descripcion: "Ana López pregunta sobre ingredientes alérgenos en el menú.",
    fecha: "2023-11-15 12:15",
    leida: true,
    tipo: "consulta",
    remitente: {
      nombre: "Ana López",
      email: "ana.lopez@email.com",
      telefono: "+34 654 321 987",
      avatar: "/avatars/ana.jpg"
    },
    contenido: "Hola, tengo alergia al gluten. ¿Podrían indicarme qué opciones del menú son aptas para celíacos? Gracias.",
    calificacion: null,
    pedidoId: null,
    prioridad: "media"
  },
  {
    id: "msg-004",
    titulo: "Solicitud de cambio de dirección",
    descripcion: "Pedro Martín solicita cambiar la dirección de entrega del pedido #PED-003.",
    fecha: "2023-11-15 11:30",
    leida: false,
    tipo: "solicitud",
    remitente: {
      nombre: "Pedro Martín",
      email: "pedro.martin@email.com",
      telefono: "+34 687 543 210",
      avatar: "/avatars/pedro.jpg"
    },
    contenido: "Disculpen, necesito cambiar la dirección de entrega de mi pedido. La nueva dirección es: Calle Nueva 123, 2º B. ¿Es posible hacer el cambio?",
    calificacion: null,
    pedidoId: "PED-003",
    prioridad: "alta"
  },
  {
    id: "msg-005",
    titulo: "Felicitación por el servicio",
    descripcion: "Laura Fernández envía felicitaciones por el excelente servicio.",
    fecha: "2023-11-15 10:00",
    leida: true,
    tipo: "felicitacion",
    remitente: {
      nombre: "Laura Fernández",
      email: "laura.fernandez@email.com",
      telefono: "+34 623 456 789",
      avatar: "/avatars/laura.jpg"
    },
    contenido: "Quería felicitarlos por el excelente servicio. Siempre llegan puntuales y la comida está deliciosa. Sigan así!",
    calificacion: 5,
    pedidoId: "PED-004",
    prioridad: "baja"
  }
];

function getIconoTipo(tipo: string) {
  switch (tipo) {
    case "resena":
      return <Star className="h-4 w-4 text-yellow-500" />;
    case "queja":
      return <MessageSquare className="h-4 w-4 text-red-500" />;
    case "consulta":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "solicitud":
      return <MessageSquare className="h-4 w-4 text-orange-500" />;
    case "felicitacion":
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
}

function getBadgeVariant(tipo: string) {
  switch (tipo) {
    case "resena":
      return "secondary";
    case "queja":
      return "destructive";
    case "consulta":
      return "outline";
    case "solicitud":
      return "outline";
    case "felicitacion":
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

function renderCalificacion(calificacion: number | null) {
  if (calificacion === null) return null;
  
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= calificacion ? 'text-yellow-500 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm font-medium ml-1">{calificacion}/5</span>
    </div>
  );
}

interface NotificacionMensaje {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
  tipo: string;
  remitente: {
    nombre: string;
    email: string;
    telefono: string;
    avatar: string;
  };
  contenido: string;
  calificacion?: number | null;
  pedidoId?: string | null;
  prioridad: string;
}

function MessageCard({ mensaje, onMarcarLeida, onResponder }: { mensaje: NotificacionMensaje, onMarcarLeida: (id: string) => void, onResponder: (id: string) => void }) {
  return (
    <Card className={`mb-4 ${!mensaje.leida ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={mensaje.remitente.avatar} alt={mensaje.remitente.nombre} />
              <AvatarFallback>
                {mensaje.remitente.nombre.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {getIconoTipo(mensaje.tipo)}
                <h4 className={`font-medium ${!mensaje.leida ? 'font-semibold' : ''}`}>
                  {mensaje.titulo}
                </h4>
                <Badge variant={getBadgeVariant(mensaje.tipo)} className="text-xs">
                  {mensaje.tipo.toUpperCase()}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getPrioridadColor(mensaje.prioridad)}`}>
                  {mensaje.prioridad.toUpperCase()}
                </Badge>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {mensaje.remitente.nombre}
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {mensaje.remitente.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {mensaje.remitente.telefono}
                  </div>
                </div>
                
                {mensaje.calificacion && (
                  <div className="mb-2">
                    {renderCalificacion(mensaje.calificacion)}
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="text-sm">
                  {mensaje.contenido}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {mensaje.fecha}
                  </div>
                  {mensaje.pedidoId && (
                    <div>
                      <span className="font-medium">Pedido:</span> {mensaje.pedidoId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!mensaje.leida && (
              <Badge variant="secondary" className="text-xs">
                Nuevo
              </Badge>
            )}
            <div className="flex flex-col space-y-2">
              {!mensaje.leida && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarcarLeida(mensaje.id)}
                >
                  Marcar como leído
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResponder(mensaje.id)}
              >
                Responder
              </Button>
              {mensaje.pedidoId && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/pedidos?id=${mensaje.pedidoId}`}>
                    Ver pedido
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/clientes?search=${mensaje.remitente.email}`}>
                  Ver cliente
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificacionesMensajesPage() {
  const [mensajes, setMensajes] = useState(notificacionesMensajes);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const marcarComoLeida = (id: string) => {
    setMensajes(prev => 
      prev.map(m => m.id === id ? { ...m, leida: true } : m)
    );
  };

  const marcarTodasComoLeidas = () => {
    setMensajes(prev => prev.map(m => ({ ...m, leida: true })));
  };

  const responderMensaje = (id: string) => {
    // Aquí iría la lógica para abrir un modal de respuesta o redirigir
    console.log('Responder mensaje:', id);
  };

  const mensajesFiltrados = mensajes.filter(mensaje => {
    const coincideBusqueda = mensaje.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            mensaje.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                            mensaje.contenido.toLowerCase().includes(busqueda.toLowerCase()) ||
                            mensaje.remitente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            mensaje.remitente.email.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideTipo = filtroTipo === "todos" || mensaje.tipo === filtroTipo;
    const coincidePrioridad = filtroPrioridad === "todos" || mensaje.prioridad === filtroPrioridad;
    const coincideEstado = filtroEstado === "todos" || 
                          (filtroEstado === "leidas" && mensaje.leida) ||
                          (filtroEstado === "no_leidas" && !mensaje.leida);
    
    return coincideBusqueda && coincideTipo && coincidePrioridad && coincideEstado;
  });

  const contarNoLeidas = () => mensajes.filter(m => !m.leida).length;
  const contarPorTipo = (tipo: string) => mensajes.filter(m => m.tipo === tipo).length;

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
          <h1 className="font-semibold text-lg">Mensajes</h1>
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
                  <MessageSquare className="mr-3 h-6 w-6" />
                  Mensajes de Clientes
                </h1>
                <p className="text-muted-foreground">
                  Gestiona reseñas, quejas, consultas y mensajes de tus clientes
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {contarNoLeidas()} sin leer
              </Badge>
              {contarNoLeidas() > 0 && (
                <Button onClick={marcarTodasComoLeidas}>
                  Marcar todos como leídos
                </Button>
              )}
            </div>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {contarPorTipo('queja')}
                  </div>
                  <div className="text-sm text-muted-foreground">Quejas</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {contarPorTipo('resena')}
                  </div>
                  <div className="text-sm text-muted-foreground">Reseñas</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {contarPorTipo('consulta')}
                  </div>
                  <div className="text-sm text-muted-foreground">Consultas</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {contarPorTipo('solicitud')}
                  </div>
                  <div className="text-sm text-muted-foreground">Solicitudes</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {contarPorTipo('felicitacion')}
                  </div>
                  <div className="text-sm text-muted-foreground">Felicitaciones</div>
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
                      placeholder="Buscar mensajes..."
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
                      <SelectItem value="queja">Quejas</SelectItem>
                      <SelectItem value="resena">Reseñas</SelectItem>
                      <SelectItem value="consulta">Consultas</SelectItem>
                      <SelectItem value="solicitud">Solicitudes</SelectItem>
                      <SelectItem value="felicitacion">Felicitaciones</SelectItem>
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
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="no_leidas">No leídos</SelectItem>
                      <SelectItem value="leidas">Leídos</SelectItem>
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

          {/* Lista de mensajes */}
          <div className="space-y-4">
            {mensajesFiltrados.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay mensajes</h3>
                    <p className="text-muted-foreground">
                      {busqueda || filtroTipo !== "todos" || filtroPrioridad !== "todos" || filtroEstado !== "todos"
                        ? "No se encontraron mensajes que coincidan con los filtros aplicados."
                        : "No tienes mensajes de clientes en este momento."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              mensajesFiltrados.map((mensaje) => (
                <MessageCard
                  key={mensaje.id}
                  mensaje={mensaje}
                  onMarcarLeida={marcarComoLeida}
                  onResponder={responderMensaje}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}