'use client'

import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Users, 
  Settings, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  Plus,
  Download,
  RefreshCw,
  BarChart3,
  FileText,
  Lock,
  Unlock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Datos de ejemplo para usuarios
const usuariosEjemplo = [
  {
    id: "user-001",
    nombre: "Juan Pérez",
    email: "juan.perez@delivey.com",
    rol: "admin",
    estado: "activo",
    ultimoAcceso: "2023-11-15 14:30",
    fechaCreacion: "2023-01-15",
    avatar: "/avatars/juan.jpg"
  },
  {
    id: "user-002",
    nombre: "María González",
    email: "maria.gonzalez@delivey.com",
    rol: "manager",
    estado: "activo",
    ultimoAcceso: "2023-11-15 13:45",
    fechaCreacion: "2023-02-20",
    avatar: "/avatars/maria.jpg"
  },
  {
    id: "user-003",
    nombre: "Carlos Ruiz",
    email: "carlos.ruiz@delivey.com",
    rol: "empleado",
    estado: "inactivo",
    ultimoAcceso: "2023-11-10 16:20",
    fechaCreacion: "2023-03-10",
    avatar: "/avatars/carlos.jpg"
  },
  {
    id: "user-004",
    nombre: "Ana López",
    email: "ana.lopez@delivey.com",
    rol: "repartidor",
    estado: "activo",
    ultimoAcceso: "2023-11-15 12:15",
    fechaCreacion: "2023-04-05",
    avatar: "/avatars/ana.jpg"
  }
];

// Datos de ejemplo para logs del sistema
const logsEjemplo = [
  {
    id: "log-001",
    fecha: "2023-11-15 14:30:25",
    nivel: "info",
    modulo: "auth",
    usuario: "juan.perez@delivey.com",
    accion: "login",
    descripcion: "Usuario inició sesión exitosamente",
    ip: "192.168.1.100"
  },
  {
    id: "log-002",
    fecha: "2023-11-15 14:25:10",
    nivel: "warning",
    modulo: "pedidos",
    usuario: "maria.gonzalez@delivey.com",
    accion: "update_order",
    descripcion: "Intento de actualizar pedido ya entregado",
    ip: "192.168.1.101"
  },
  {
    id: "log-003",
    fecha: "2023-11-15 14:20:45",
    nivel: "error",
    modulo: "payment",
    usuario: "sistema",
    accion: "process_payment",
    descripcion: "Error al procesar pago - Gateway timeout",
    ip: "192.168.1.1"
  },
  {
    id: "log-004",
    fecha: "2023-11-15 14:15:30",
    nivel: "info",
    modulo: "productos",
    usuario: "ana.lopez@delivey.com",
    accion: "create_product",
    descripcion: "Nuevo producto creado: Pizza Hawaiana",
    ip: "192.168.1.102"
  }
];

// Configuraciones del sistema
const configuracionesSistema = {
  mantenimiento: false,
  registroNuevosUsuarios: true,
  notificacionesEmail: true,
  backupAutomatico: true,
  modoDebug: false,
  limitePedidosDiarios: 1000,
  tiempoSesion: 480, // minutos
  intentosLoginMaximos: 5
};

function getRolBadgeVariant(rol: string) {
  switch (rol) {
    case "admin":
      return "destructive";
    case "manager":
      return "default";
    case "empleado":
      return "secondary";
    case "repartidor":
      return "outline";
    default:
      return "outline";
  }
}

function getEstadoBadgeVariant(estado: string) {
  return estado === "activo" ? "default" : "secondary";
}

function getNivelLogColor(nivel: string) {
  switch (nivel) {
    case "error":
      return "text-red-600";
    case "warning":
      return "text-yellow-600";
    case "info":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
}

function getNivelLogIcon(nivel: string) {
  switch (nivel) {
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "info":
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

export default function AdminPage() {
  const [usuarios] = useState(usuariosEjemplo);
  const [logs] = useState(logsEjemplo);
  const [configuraciones, setConfiguraciones] = useState(configuracionesSistema);
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroNivelLog, setFiltroNivelLog] = useState("todos");
  const [busquedaUsuarios, setBusquedaUsuarios] = useState("");
  const [busquedaLogs, setBusquedaLogs] = useState("");

  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = usuario.nombre.toLowerCase().includes(busquedaUsuarios.toLowerCase()) ||
                            usuario.email.toLowerCase().includes(busquedaUsuarios.toLowerCase());
    const coincideRol = filtroRol === "todos" || usuario.rol === filtroRol;
    const coincideEstado = filtroEstado === "todos" || usuario.estado === filtroEstado;
    
    return coincideBusqueda && coincideRol && coincideEstado;
  });

  const logsFiltrados = logs.filter(log => {
    const coincideBusqueda = log.descripcion.toLowerCase().includes(busquedaLogs.toLowerCase()) ||
                            log.usuario.toLowerCase().includes(busquedaLogs.toLowerCase()) ||
                            log.modulo.toLowerCase().includes(busquedaLogs.toLowerCase());
    const coincideNivel = filtroNivelLog === "todos" || log.nivel === filtroNivelLog;
    
    return coincideBusqueda && coincideNivel;
  });

  const toggleConfiguracion = (key: string) => {
    setConfiguraciones(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const contarUsuariosPorRol = (rol: string) => usuarios.filter(u => u.rol === rol).length;
  const contarUsuariosPorEstado = (estado: string) => usuarios.filter(u => u.estado === estado).length;
  const contarLogsPorNivel = (nivel: string) => logs.filter(l => l.nivel === nivel).length;

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
          <h1 className="font-semibold text-lg">Administración</h1>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Shield className="mr-3 h-6 w-6" />
                Panel de Administración
              </h1>
              <p className="text-muted-foreground">
                Gestiona usuarios, configuraciones y monitorea el sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar datos
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo usuario
              </Button>
            </div>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {contarUsuariosPorEstado('activo')}
                  </div>
                  <div className="text-sm text-muted-foreground">Usuarios activos</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {contarLogsPorNivel('error')}
                  </div>
                  <div className="text-sm text-muted-foreground">Errores hoy</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {contarUsuariosPorRol('admin')}
                  </div>
                  <div className="text-sm text-muted-foreground">Administradores</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {contarLogsPorNivel('warning')}
                  </div>
                  <div className="text-sm text-muted-foreground">Advertencias</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs principales */}
          <Tabs defaultValue="usuarios" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="usuarios" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Logs del Sistema
              </TabsTrigger>
              <TabsTrigger value="configuracion" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </TabsTrigger>
              <TabsTrigger value="reportes" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reportes
              </TabsTrigger>
            </TabsList>

            {/* Tab de Usuarios */}
            <TabsContent value="usuarios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Administra los usuarios del sistema y sus permisos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filtros de usuarios */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label>Buscar usuario</Label>
                      <Input
                        placeholder="Nombre o email..."
                        value={busquedaUsuarios}
                        onChange={(e) => setBusquedaUsuarios(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rol</Label>
                      <Select value={filtroRol} onValueChange={setFiltroRol}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos los roles</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="empleado">Empleado</SelectItem>
                          <SelectItem value="repartidor">Repartidor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBusquedaUsuarios("");
                          setFiltroRol("todos");
                          setFiltroEstado("todos");
                        }}
                        className="w-full"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  </div>

                  {/* Tabla de usuarios */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Último acceso</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuariosFiltrados.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={usuario.avatar} alt={usuario.nombre} />
                                <AvatarFallback>
                                  {usuario.nombre.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{usuario.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRolBadgeVariant(usuario.rol)}>
                              {usuario.rol}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getEstadoBadgeVariant(usuario.estado)}>
                              {usuario.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {usuario.ultimoAcceso}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                {usuario.estado === 'activo' ? 
                                  <Lock className="h-4 w-4" /> : 
                                  <Unlock className="h-4 w-4" />
                                }
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Logs */}
            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logs del Sistema</CardTitle>
                  <CardDescription>
                    Monitorea la actividad y eventos del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filtros de logs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label>Buscar en logs</Label>
                      <Input
                        placeholder="Descripción, usuario, módulo..."
                        value={busquedaLogs}
                        onChange={(e) => setBusquedaLogs(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nivel</Label>
                      <Select value={filtroNivelLog} onValueChange={setFiltroNivelLog}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos los niveles</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBusquedaLogs("");
                          setFiltroNivelLog("todos");
                        }}
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                      </Button>
                    </div>
                  </div>

                  {/* Tabla de logs */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha/Hora</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>Módulo</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsFiltrados.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm font-mono">
                            {log.fecha}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getNivelLogIcon(log.nivel)}
                              <span className={`text-sm font-medium ${getNivelLogColor(log.nivel)}`}>
                                {log.nivel.toUpperCase()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.modulo}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.usuario}</TableCell>
                          <TableCell className="text-sm">{log.descripcion}</TableCell>
                          <TableCell className="text-sm font-mono">{log.ip}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Configuración */}
            <TabsContent value="configuracion" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                  <CardDescription>
                    Ajusta las configuraciones generales del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Configuraciones booleanas */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configuraciones Generales</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Modo mantenimiento</Label>
                          <p className="text-sm text-muted-foreground">
                            Activa el modo mantenimiento del sistema
                          </p>
                        </div>
                        <Switch
                          checked={configuraciones.mantenimiento}
                          onCheckedChange={() => toggleConfiguracion('mantenimiento')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Registro de nuevos usuarios</Label>
                          <p className="text-sm text-muted-foreground">
                            Permite el registro de nuevos usuarios
                          </p>
                        </div>
                        <Switch
                          checked={configuraciones.registroNuevosUsuarios}
                          onCheckedChange={() => toggleConfiguracion('registroNuevosUsuarios')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notificaciones por email</Label>
                          <p className="text-sm text-muted-foreground">
                            Envía notificaciones por correo electrónico
                          </p>
                        </div>
                        <Switch
                          checked={configuraciones.notificacionesEmail}
                          onCheckedChange={() => toggleConfiguracion('notificacionesEmail')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Backup automático</Label>
                          <p className="text-sm text-muted-foreground">
                            Realiza backups automáticos diarios
                          </p>
                        </div>
                        <Switch
                          checked={configuraciones.backupAutomatico}
                          onCheckedChange={() => toggleConfiguracion('backupAutomatico')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Modo debug</Label>
                          <p className="text-sm text-muted-foreground">
                            Activa logs detallados para desarrollo
                          </p>
                        </div>
                        <Switch
                          checked={configuraciones.modoDebug}
                          onCheckedChange={() => toggleConfiguracion('modoDebug')}
                        />
                      </div>
                    </div>
                    
                    {/* Configuraciones numéricas */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Límites y Tiempos</h3>
                      
                      <div className="space-y-2">
                        <Label>Límite de pedidos diarios</Label>
                        <Input
                          type="number"
                          value={configuraciones.limitePedidosDiarios}
                          onChange={(e) => setConfiguraciones(prev => ({
                            ...prev,
                            limitePedidosDiarios: parseInt(e.target.value) || 0
                          }))}
                        />
                        <p className="text-sm text-muted-foreground">
                          Número máximo de pedidos por día
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tiempo de sesión (minutos)</Label>
                        <Input
                          type="number"
                          value={configuraciones.tiempoSesion}
                          onChange={(e) => setConfiguraciones(prev => ({
                            ...prev,
                            tiempoSesion: parseInt(e.target.value) || 0
                          }))}
                        />
                        <p className="text-sm text-muted-foreground">
                          Duración máxima de las sesiones de usuario
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Intentos de login máximos</Label>
                        <Input
                          type="number"
                          value={configuraciones.intentosLoginMaximos}
                          onChange={(e) => setConfiguraciones(prev => ({
                            ...prev,
                            intentosLoginMaximos: parseInt(e.target.value) || 0
                          }))}
                        />
                        <p className="text-sm text-muted-foreground">
                          Número máximo de intentos de login fallidos
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">
                      Cancelar
                    </Button>
                    <Button>
                      Guardar configuración
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Reportes */}
            <TabsContent value="reportes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes del Sistema</CardTitle>
                  <CardDescription>
                    Genera y descarga reportes de actividad del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Reporte de Usuarios</CardTitle>
                        <CardDescription>
                          Actividad y estadísticas de usuarios
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Total usuarios:</span> {usuarios.length}
                            </div>
                            <div>
                              <span className="font-medium">Usuarios activos:</span> {contarUsuariosPorEstado('activo')}
                            </div>
                            <div>
                              <span className="font-medium">Administradores:</span> {contarUsuariosPorRol('admin')}
                            </div>
                            <div>
                              <span className="font-medium">Repartidores:</span> {contarUsuariosPorRol('repartidor')}
                            </div>
                          </div>
                          <Button className="w-full">
                            <FileText className="h-4 w-4 mr-2" />
                            Generar reporte
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Reporte de Logs</CardTitle>
                        <CardDescription>
                          Actividad del sistema y errores
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Total logs:</span> {logs.length}
                            </div>
                            <div>
                              <span className="font-medium">Errores:</span> {contarLogsPorNivel('error')}
                            </div>
                            <div>
                              <span className="font-medium">Advertencias:</span> {contarLogsPorNivel('warning')}
                            </div>
                            <div>
                              <span className="font-medium">Info:</span> {contarLogsPorNivel('info')}
                            </div>
                          </div>
                          <Button className="w-full">
                            <FileText className="h-4 w-4 mr-2" />
                            Generar reporte
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}