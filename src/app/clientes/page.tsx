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
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Importar los componentes del sidebar
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { OrganizationSelector } from "@/components/organization-selector"
import { useOrganization } from "@/hooks/useOrganization"

// Definir el tipo de datos para clientes
export type Cliente = {
  id: string
  nombre: string
  email: string
  telefono: string
  empresa: string
  estado: "activo" | "inactivo" | "pendiente"
  fechaRegistro: string
  totalPedidos: number
  valorTotal: number
  ciudad: string
  organizationId: number
}

// Tipo para crear/editar cliente (sin campos calculados)
export type ClienteFormData = Omit<Cliente, 'id' | 'totalPedidos' | 'valorTotal' | 'fechaRegistro'>

// Datos iniciales vacíos
const initialData: Cliente[] = []

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
    email: cliente?.email || '',
    telefono: cliente?.telefono || '',
    empresa: cliente?.empresa || '',
    estado: cliente?.estado || 'activo',
    ciudad: cliente?.ciudad || '',
    organizationId: cliente?.organizationId || selectedOrganizationId || 1
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre || !formData.email || !formData.telefono) {
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
            placeholder="Nombre completo"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label htmlFor="empresa">Empresa</Label>
          <Input
            id="empresa"
            value={formData.empresa}
            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
            placeholder="Nombre de la empresa"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Input
            id="ciudad"
            value={formData.ciudad}
            onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
            placeholder="Ciudad"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select value={formData.estado} onValueChange={(value: 'activo' | 'inactivo' | 'pendiente') => setFormData({ ...formData, estado: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          <Label className="text-sm font-medium text-muted-foreground">Empresa</Label>
          <p className="text-sm">{cliente.empresa || 'N/A'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Ciudad</Label>
          <p className="text-sm">{cliente.ciudad || 'N/A'}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
          <Badge
            variant={
              cliente.estado === "activo"
                ? "default"
                : cliente.estado === "pendiente"
                ? "secondary"
                : "destructive"
            }
          >
            {cliente.estado.charAt(0).toUpperCase() + cliente.estado.slice(1)}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Fecha de Registro</Label>
          <p className="text-sm">{new Date(cliente.fechaRegistro).toLocaleDateString('es-CO')}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Total Pedidos</Label>
          <p className="text-sm font-bold">{cliente.totalPedidos}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Valor Total</Label>
          <p className="text-sm font-bold">
            {new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
            }).format(cliente.valorTotal)}
          </p>
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
  
  // Estados para el CRUD
  const [clientes, setClientes] = React.useState<Cliente[]>(initialData)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false)
  const [selectedCliente, setSelectedCliente] = React.useState<Cliente | null>(null)
  
  // Usar el hook de organización para filtrar clientes
  const { selectedOrganizationId } = useOrganization()
  
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
  
  // Funciones CRUD
  const handleCreateCliente = (formData: ClienteFormData) => {
    const newCliente: Cliente = {
      ...formData,
      id: `CLI${String(clientes.length + 1).padStart(3, '0')}`,
      fechaRegistro: new Date().toISOString().split('T')[0],
      totalPedidos: 0,
      valorTotal: 0,
    }
    
    setClientes([...clientes, newCliente])
    setIsCreateDialogOpen(false)
    
    toast({
      title: "Cliente creado",
      description: `El cliente ${newCliente.nombre} ha sido creado exitosamente.`,
    })
  }
  
  const handleEditCliente = (formData: ClienteFormData) => {
    if (!selectedCliente) return
    
    const updatedCliente: Cliente = {
      ...selectedCliente,
      ...formData,
    }
    
    setClientes(clientes.map(c => c.id === selectedCliente.id ? updatedCliente : c))
    setIsEditDialogOpen(false)
    setSelectedCliente(null)
    
    toast({
      title: "Cliente actualizado",
      description: `El cliente ${updatedCliente.nombre} ha sido actualizado exitosamente.`,
    })
  }
  
  const handleDeleteCliente = (cliente: Cliente) => {
    setClientes(clientes.filter(c => c.id !== cliente.id))
    
    toast({
      title: "Cliente eliminado",
      description: `El cliente ${cliente.nombre} ha sido eliminado exitosamente.`,
    })
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
            <div className="text-sm text-muted-foreground">{cliente.empresa}</div>
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
      accessorKey: "ciudad",
      header: "Ciudad",
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue("estado") as string
        return (
          <Badge
            variant={
              estado === "activo"
                ? "default"
                : estado === "pendiente"
                ? "secondary"
                : "destructive"
            }
          >
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "totalPedidos",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pedidos
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="text-center">{row.getValue("totalPedidos")}</div>
      },
    },
    {
      accessorKey: "valorTotal",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Valor Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("valorTotal"))
        const formatted = new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
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
                onClick={() => navigator.clipboard.writeText(cliente.id)}
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
  const clientesActivos = data.filter(cliente => cliente.estado === "activo").length
  const clientesPendientes = data.filter(cliente => cliente.estado === "pendiente").length
  const valorTotalClientes = data.reduce((sum, cliente) => sum + cliente.valorTotal, 0)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar para desktop */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        {/* Header para móvil */}
        <div className="flex h-14 items-center justify-between border-b px-4 lg:hidden">
          <h1 className="text-xl font-semibold">Clientes</h1>
          {/* MobileSidebar */}
          <div className="lg:hidden">
            <MobileSidebar />
          </div>
        </div>
        
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
                  <Button>
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
                  Clientes Activos
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientesActivos}</div>
                <p className="text-xs text-muted-foreground">
                  {totalClientes > 0 ? ((clientesActivos / totalClientes) * 100).toFixed(1) : 0}% del total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clientes Pendientes
                </CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientesPendientes}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren seguimiento
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Valor Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(valorTotalClientes)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor acumulado de pedidos
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
      </div>
      
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
    </div>
  )
}