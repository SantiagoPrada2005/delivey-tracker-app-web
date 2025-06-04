import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Badge } from "@components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { MobileSidebar } from "@components/mobile-sidebar";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 flex-col border-r bg-background">
        <div className="flex h-full flex-col gap-4">
          <div className="flex h-14 items-center border-b px-4 font-semibold">
            <h1 className="text-xl">Administrador de Pedidos</h1>
          </div>
          <div className="flex-1 px-4">
            <nav className="flex flex-col gap-2">
              <a href="#" className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-accent-foreground">
                Dashboard
              </a>
              <a href="#" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                Pedidos
              </a>
              <a href="#" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                Clientes
              </a>
              <a href="#" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                Productos
              </a>
              <a href="#" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                Repartidores
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="flex h-14 items-center justify-between border-b px-4 lg:hidden">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <MobileSidebar />
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold hidden lg:block">Dashboard</h1>
          
          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">120</div>
                <p className="text-xs text-muted-foreground">+10% desde el mes pasado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25</div>
                <p className="text-xs text-muted-foreground">-5% desde el mes pasado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">+15% desde el mes pasado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,450</div>
                <p className="text-xs text-muted-foreground">+20% desde el mes pasado</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="recientes">
            <TabsList>
              <TabsTrigger value="recientes">Pedidos Recientes</TabsTrigger>
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
  );
}
