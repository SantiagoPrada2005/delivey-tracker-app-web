"use client";

import { useState } from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Home, Package, Users, ShoppingBag, Truck, Bell } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserAuthNav } from "@/components/auth/user-auth-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, Globe, Lock, CreditCard, Mail, Phone, MapPin, Building, Shield } from "lucide-react";

export default function ConfiguracionPage() {
  const [notificacionesEmail, setNotificacionesEmail] = useState(true);
  const [notificacionesPush, setNotificacionesPush] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState("es");

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
            <h1 className="text-lg font-semibold">Configuración</h1>
          </div>
        </header>
        
        {/* Contenido de la página */}
        <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
          </div>

          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="empresa">Empresa</TabsTrigger>
              <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
              <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
              <TabsTrigger value="pagos">Pagos</TabsTrigger>
            </TabsList>
            
            {/* Pestaña General */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Configuración General
                  </CardTitle>
                  <CardDescription>
                    Configura las opciones generales del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="idioma">Idioma</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <Select value={idiomaSeleccionado} onValueChange={setIdiomaSeleccionado}>
                        <SelectTrigger id="idioma" className="w-full">
                          <SelectValue placeholder="Seleccionar idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zona-horaria">Zona Horaria</Label>
                    <Select defaultValue="europe-madrid">
                      <SelectTrigger id="zona-horaria" className="w-full">
                        <SelectValue placeholder="Seleccionar zona horaria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="europe-madrid">Europa/Madrid (GMT+1)</SelectItem>
                        <SelectItem value="america-mexico">América/México (GMT-6)</SelectItem>
                        <SelectItem value="america-bogota">América/Bogotá (GMT-5)</SelectItem>
                        <SelectItem value="america-buenos_aires">América/Buenos Aires (GMT-3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="modo-oscuro">Modo Oscuro</Label>
                      <p className="text-sm text-muted-foreground">Activar el tema oscuro en la interfaz</p>
                    </div>
                    <Switch
                      id="modo-oscuro"
                      checked={modoOscuro}
                      onCheckedChange={setModoOscuro}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Pestaña Empresa */}
            <TabsContent value="empresa" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Información de la Empresa
                  </CardTitle>
                  <CardDescription>
                    Configura los datos de tu empresa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre-empresa">Nombre de la Empresa</Label>
                      <Input id="nombre-empresa" placeholder="Tu Empresa S.L." defaultValue="Distribuciones Rápidas S.L." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nif">NIF/CIF</Label>
                      <Input id="nif" placeholder="B12345678" defaultValue="B87654321" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input id="direccion" placeholder="Calle, número, código postal" defaultValue="Calle Principal 123, 28001" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefono-empresa">Teléfono</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Input id="telefono-empresa" placeholder="+34 600 000 000" defaultValue="+34 912 345 678" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-empresa">Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input id="email-empresa" placeholder="contacto@tuempresa.com" defaultValue="info@distribucionesrapidas.com" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo de la Empresa</Label>
                    <Input id="logo" type="file" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Pestaña Notificaciones */}
            <TabsContent value="notificaciones" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    Configuración de Notificaciones
                  </CardTitle>
                  <CardDescription>
                    Gestiona cómo y cuándo recibes notificaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificaciones-email">Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">Recibir alertas y actualizaciones por email</p>
                    </div>
                    <Switch
                      id="notificaciones-email"
                      checked={notificacionesEmail}
                      onCheckedChange={setNotificacionesEmail}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificaciones-push">Notificaciones Push</Label>
                      <p className="text-sm text-muted-foreground">Recibir notificaciones push en el navegador</p>
                    </div>
                    <Switch
                      id="notificaciones-push"
                      checked={notificacionesPush}
                      onCheckedChange={setNotificacionesPush}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Tipos de Notificaciones</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch id="notif-nuevos-pedidos" defaultChecked />
                        <Label htmlFor="notif-nuevos-pedidos">Nuevos pedidos</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="notif-cambios-estado" defaultChecked />
                        <Label htmlFor="notif-cambios-estado">Cambios de estado en pedidos</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="notif-stock-bajo" defaultChecked />
                        <Label htmlFor="notif-stock-bajo">Alertas de stock bajo</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="notif-reportes" />
                        <Label htmlFor="notif-reportes">Reportes semanales</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Pestaña Seguridad */}
            <TabsContent value="seguridad" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Seguridad y Acceso
                  </CardTitle>
                  <CardDescription>
                    Gestiona la seguridad de tu cuenta y los permisos de usuario
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cambiar-password">Cambiar Contraseña</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <Input id="password-actual" type="password" placeholder="Contraseña actual" />
                      </div>
                      <Input type="password" placeholder="Nueva contraseña" />
                      <Input type="password" placeholder="Confirmar nueva contraseña" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Autenticación de Dos Factores</Label>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm">Activar 2FA para mayor seguridad</p>
                        <p className="text-sm text-muted-foreground">Protege tu cuenta con una capa adicional de seguridad</p>
                      </div>
                      <Switch id="two-factor" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Sesiones Activas</Label>
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Este dispositivo</p>
                          <p className="text-sm text-muted-foreground">Madrid, España · Última actividad: Ahora</p>
                        </div>
                        <Button variant="outline" size="sm">Actual</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Pestaña Pagos */}
            <TabsContent value="pagos" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Configuración de Pagos
                  </CardTitle>
                  <CardDescription>
                    Gestiona los métodos de pago y facturación
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Métodos de Pago Aceptados</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch id="pago-tarjeta" defaultChecked />
                        <Label htmlFor="pago-tarjeta">Tarjeta de crédito/débito</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="pago-efectivo" defaultChecked />
                        <Label htmlFor="pago-efectivo">Efectivo</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="pago-transferencia" defaultChecked />
                        <Label htmlFor="pago-transferencia">Transferencia bancaria</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="pago-paypal" />
                        <Label htmlFor="pago-paypal">PayPal</Label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="cuenta-bancaria">Cuenta Bancaria para Transferencias</Label>
                    <Input id="cuenta-bancaria" placeholder="ES91 2100 0418 4502 0005 1332" defaultValue="ES91 2100 0418 4502 0005 1332" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="impuestos">Impuestos</Label>
                    <Select defaultValue="21">
                      <SelectTrigger id="impuestos">
                        <SelectValue placeholder="Seleccionar tipo de IVA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="21">IVA General (21%)</SelectItem>
                        <SelectItem value="10">IVA Reducido (10%)</SelectItem>
                        <SelectItem value="4">IVA Superreducido (4%)</SelectItem>
                        <SelectItem value="0">Exento de IVA (0%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pie-factura">Texto al Pie de Factura</Label>
                    <Textarea
                      id="pie-factura"
                      placeholder="Texto legal o información adicional para facturas"
                      defaultValue="Gracias por confiar en nuestros servicios. Para cualquier consulta relacionada con esta factura, contacte con nuestro departamento de administración."
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}