import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Importar los nuevos componentes
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { OrderChart } from "@/components/dashboard/order-chart";
import { StatusChart } from "@/components/dashboard/status-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar mejorado */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="flex h-14 items-center justify-between border-b px-4 lg:hidden">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          {/* Mantener el MobileSidebar existente */}
          <div className="lg:hidden">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
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
      </div>
    </div>
  );
}
