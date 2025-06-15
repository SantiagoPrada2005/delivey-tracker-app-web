import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Home, Package, Users, ShoppingBag, Truck, Settings, Bell } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserAuthNav } from "@/components/auth/user-auth-nav";

// Importar los componentes del dashboard
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { OrderChart } from "@/components/dashboard/order-chart";
import { StatusChart } from "@/components/dashboard/status-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

// Definir los elementos del menú principal
const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
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

export default function Dashboard() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-14 items-center justify-between px-4 font-semibold transition-all duration-200 ease-linear group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
            <h1 className="text-xl transition-all duration-200 ease-linear group-data-[collapsible=icon]:hidden">Administrador de Pedidos</h1>
            <ThemeSwitcher />
          </div>
          
          {/* Perfil de usuario */}
          <div className="p-4 border-b transition-all duration-200 ease-linear group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-0">
            <UserAuthNav />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          {/* Menú principal */}
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex justify-between w-full">
                        <span className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </span>
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
          
          {/* Sección de notificaciones */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notificaciones</span>
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {notificationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex justify-between w-full">
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
        
        <SidebarFooter>
          <div className="p-4 text-xs text-muted-foreground transition-all duration-200 ease-linear group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:p-0">
            © 2024 Delivery Tracker
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        {/* Header con trigger para mobile */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Última actualización: Hoy, 10:30 AM</span>
          </div>
        </header>
        
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Última actualización: Hoy, 10:30 AM</span>
              </div>
            </div>
          
            {/* Métricas con indicadores de tendencia */}
            <MetricsCards />

            {/* Gráficos */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              {/* Gráfico de pedidos por mes (ocupa 4 columnas) */}
              <OrderChart />
              
              {/* Gráfico de distribución de estados (ocupa 3 columnas) */}
              <div className="md:col-span-2 lg:col-span-3">
                <StatusChart />
              </div>
            </div>

            {/* Gráfico de ingresos */}
            <RevenueChart />

            {/* Sección inferior: Actividad reciente y Pedidos */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              {/* Actividad reciente (ocupa 3 columnas) */}
              <div className="md:col-span-2 lg:col-span-3">
                <RecentActivity />
              </div>
              
              {/* Tabs de pedidos (ocupa 4 columnas) */}
              <div className="md:col-span-2 lg:col-span-4">
                <Tabs defaultValue="recientes" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="recientes">Recientes</TabsTrigger>
                    <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
                    <TabsTrigger value="completados">Completados</TabsTrigger>
                  </TabsList>
                  <TabsContent value="recientes" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pedidos Recientes</CardTitle>
                        <CardDescription>Lista de los últimos pedidos realizados</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>PED-001</TableCell>
                              <TableCell>Juan Pérez</TableCell>
                              <TableCell>2023-06-15</TableCell>
                              <TableCell>$125.00</TableCell>
                              <TableCell><Badge>Entregado</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>PED-002</TableCell>
                              <TableCell>María López</TableCell>
                              <TableCell>2023-06-14</TableCell>
                              <TableCell>$85.50</TableCell>
                              <TableCell><Badge variant="outline">En camino</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>PED-003</TableCell>
                              <TableCell>Carlos Ruiz</TableCell>
                              <TableCell>2023-06-14</TableCell>
                              <TableCell>$210.75</TableCell>
                              <TableCell><Badge variant="secondary">Pendiente</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>PED-004</TableCell>
                              <TableCell>Ana Gómez</TableCell>
                              <TableCell>2023-06-13</TableCell>
                              <TableCell>$45.25</TableCell>
                              <TableCell><Badge>Entregado</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>PED-005</TableCell>
                              <TableCell>Roberto Díaz</TableCell>
                              <TableCell>2023-06-13</TableCell>
                              <TableCell>$150.00</TableCell>
                              <TableCell><Badge variant="destructive">Cancelado</Badge></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="pendientes" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pedidos Pendientes</CardTitle>
                        <CardDescription>Pedidos que requieren atención</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>PED-003</TableCell>
                              <TableCell>Carlos Ruiz</TableCell>
                              <TableCell>2023-06-14</TableCell>
                              <TableCell>$210.75</TableCell>
                              <TableCell><Badge variant="secondary">Pendiente</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>PED-006</TableCell>
                              <TableCell>Laura Sánchez</TableCell>
                              <TableCell>2023-06-12</TableCell>
                              <TableCell>$95.30</TableCell>
                              <TableCell><Badge variant="secondary">Pendiente</Badge></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="completados" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pedidos Completados</CardTitle>
                        <CardDescription>Pedidos entregados satisfactoriamente</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>PED-001</TableCell>
                              <TableCell>Juan Pérez</TableCell>
                              <TableCell>2023-06-15</TableCell>
                              <TableCell>$125.00</TableCell>
                              <TableCell><Badge>Entregado</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>PED-004</TableCell>
                              <TableCell>Ana Gómez</TableCell>
                              <TableCell>2023-06-13</TableCell>
                              <TableCell>$45.25</TableCell>
                              <TableCell><Badge>Entregado</Badge></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}