"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Users,
  UserCheck,
  UserX,
  DollarSign,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

// Importar los componentes del sidebar
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
} from "@/components/ui/sidebar"
import { Home, Package, ShoppingBag, Truck, Settings, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { UserAuthNav } from "@/components/auth/user-auth-nav"
import { OrganizationSelector } from "@/components/organization-selector"
import { useOrganization } from "@/hooks/useOrganization"
import { useClientes } from "@/hooks/useClientes"

// Importar los tipos desde el hook
import { Cliente, ClienteFormData } from '@/hooks/useClientes'

// Componente para el formulario de cliente
function ClienteForm({ 
  cliente, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: {
  cliente?: Cliente
  onSubmit: (data: ClienteFormData) => void
  onCancel: () => void
  isEditing?: boolean
}) {
  const { toast } = useToast()
  const { selectedOrganizationId } = useOrganization()
  const [formData, setFormData] = React.useState<ClienteFormData>({
    nombre: cliente?.nombre || '',
    apellido: cliente?.apellido || '',
    email: cliente?.email || '',
    telefono: cliente?.telefono || '',
    direccion: cliente?.direccion || '',
    organizationId: cliente?.organizationId || selectedOrganizationId || 1
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre || !formData.telefono) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Nombre"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apellido">Apellido *</Label>
          <Input
            id="apellido"
            value={formData.apellido}
            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
            placeholder="Apellido"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono *</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="+57 300 123 4567"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección *</Label>
        <Input
          id="direccion"
          value={formData.direccion}
          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          placeholder="Dirección completa"
          required
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Crear'} Cliente
        </Button>
      </DialogFooter>
    </form>
  )
}

// Componente para ver detalles del cliente
function ClienteDetails({ cliente }: { cliente: Cliente }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
          <p className="text-sm">{cliente.nombre}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
          <p className="text-sm">{cliente.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
          <p className="text-sm">{cliente.telefono}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Apellido</Label>
          <p className="text-sm">{cliente.apellido || 'N/A'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Dirección</Label>
          <p className="text-sm">{cliente.direccion || 'N/A'}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Organización ID</Label>
          <p className="text-sm">{cliente.organizationId}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Fecha de Creación</Label>
          <p className="text-sm">{cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString('es-CO') : 'N/A'}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Última Actualización</Label>
          <p className="text-sm">{cliente.updatedAt ? new Date(cliente.updatedAt).toLocaleDateString('es-CO') : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}

// Componente principal de la página
export default function ClientesPage() {
  const { toast } = useToast();

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  
  // Estados para los diálogos
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false)
  const [selectedCliente, setSelectedCliente] = React.useState<Cliente | null>(null)
  
  // Usar hooks
  const { selectedOrganizationId } = useOrganization()
  const { 
    clientes, 
    loading, 
    error, 
    createCliente, 
    updateCliente, 
    deleteCliente 
  } = useClientes()
  
  // Filtrar datos por organizationId
  const data = React.useMemo(() => {
    if (!selectedOrganizationId) return clientes
    return clientes.filter(cliente => cliente.organizationId === selectedOrganizationId)
  }, [selectedOrganizationId, clientes])
  
  // Mostrar toast cuando no hay clientes
  React.useEffect(() => {
    if (clientes.length === 0) {
      toast({
        title: "No hay clientes",
        description: "No existen clientes registrados. Puedes crear el primer cliente usando el botón 'Nuevo Cliente'.",
        variant: "default"
      })
    }
  }, [clientes.length, toast])
  
  // Funciones CRUD usando el hook
  const handleCreateCliente = async (formData: ClienteFormData) => {
    try {
      const newCliente = await createCliente(formData)
      setIsCreateDialogOpen(false)
      
      if (newCliente) {
        toast({
          title: "Cliente creado",
          description: `El cliente ${newCliente.nombre} ha sido creado exitosamente.`,
        })
      } else {
        toast({
          title: "Cliente creado",
          description: "El cliente ha sido creado exitosamente.",
        })
      }
    } catch (err) {
      console.error('Error al crear cliente:', err)
      toast({
        title: "Error",
        description: "No se pudo crear el cliente. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }
  
  const handleEditCliente = async (formData: ClienteFormData) => {
    if (!selectedCliente) return
    
    try {
      const success = await updateCliente(selectedCliente.id.toString(), formData)
      
      if (success) {
        setIsEditDialogOpen(false)
        setSelectedCliente(null)
        
        toast({
          title: "Cliente actualizado",
          description: `El cliente ${formData.nombre} ha sido actualizado exitosamente.`,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el cliente. Inténtalo de nuevo.",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error('Error al actualizar cliente:', err)
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }
  
  const handleDeleteCliente = async (cliente: Cliente) => {
    try {
      const success = await deleteCliente(cliente.id.toString())
      
      if (success) {
        toast({
          title: "Cliente eliminado",
          description: `El cliente ${cliente.nombre} ha sido eliminado exitosamente.`,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el cliente. Inténtalo de nuevo.",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error('Error al eliminar cliente:', err)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }
  
  const handleViewDetails = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsDetailsDialogOpen(true)
  }
  
  const handleEditClick = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsEditDialogOpen(true)
  }

  // Definir las columnas de la tabla
  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: "nombre",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const cliente = row.original
        return (
          <div className="flex flex-col">
            <div className="font-medium">{cliente.nombre}</div>
            <div className="text-sm text-muted-foreground">{cliente.apellido}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
    },
    {
      accessorKey: "direccion",
      header: "Dirección",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">{row.getValue("direccion")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const cliente = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(cliente.id.toString())}
              >
                Copiar ID del cliente
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewDetails(cliente)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditClick(cliente)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar cliente
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar cliente
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente
                      el cliente {cliente.nombre} y todos sus datos asociados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteCliente(cliente)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
  
  // Configurar tabla
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })
  
  // Calcular métricas
  const totalClientes = data.length
  const clientesConEmail = data.filter(cliente => cliente.email).length
  const clientesSinEmail = data.filter(cliente => !cliente.email).length

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
            <h1 className="text-lg font-semibold">Clientes</h1>
          </div>
        </header>
        
        {/* Contenido de la página */}
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
              <p className="text-muted-foreground">
                Gestiona la información de tus clientes
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <OrganizationSelector />
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={loading}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Cliente</DialogTitle>
                    <DialogDescription>
                      Completa la información del nuevo cliente. Los campos marcados con * son obligatorios.
                    </DialogDescription>
                  </DialogHeader>
                  <ClienteForm
                    onSubmit={handleCreateCliente}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Mostrar error si existe */}
          {error && (
            <div className="rounded-md bg-destructive/15 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-destructive">
                    Error al cargar los clientes
                  </h3>
                  <div className="mt-2 text-sm text-destructive">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mostrar loading */}
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Cargando clientes...</p>
              </div>
            </div>
          )}

          {/* Tarjetas de métricas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clientes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClientes}</div>
                <p className="text-xs text-muted-foreground">
                  Clientes registrados
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clientes con Email
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientesConEmail}</div>
                <p className="text-xs text-muted-foreground">
                  {totalClientes > 0 ? ((clientesConEmail / totalClientes) * 100).toFixed(1) : 0}% del total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clientes sin Email
                </CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientesSinEmail}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren actualización de datos
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clientes
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClientes}</div>
                <p className="text-xs text-muted-foreground">
                  Clientes registrados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de clientes */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                Gestiona y visualiza todos los clientes registrados en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center py-4">
                <Input
                  placeholder="Filtrar clientes..."
                  value={(table.getColumn("nombre")?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    table.getColumn("nombre")?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Columnas <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No hay resultados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} de{" "}
                  {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
      
      {/* Dialog para editar cliente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifica la información del cliente. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          {selectedCliente && (
            <ClienteForm
              cliente={selectedCliente}
              onSubmit={handleEditCliente}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedCliente(null)
              }}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog para ver detalles del cliente */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
            <DialogDescription>
              Información completa del cliente seleccionado.
            </DialogDescription>
          </DialogHeader>
          {selectedCliente && <ClienteDetails cliente={selectedCliente} />}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailsDialogOpen(false)
                setSelectedCliente(null)
              }}
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                setIsDetailsDialogOpen(false)
                handleEditClick(selectedCliente!)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}