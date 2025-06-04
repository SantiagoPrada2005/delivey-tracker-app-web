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

// Datos de ejemplo con organizationId
const allData: Cliente[] = [
  {
    id: "CLI001",
    nombre: "Ana García",
    email: "ana.garcia@email.com",
    telefono: "+57 300 123 4567",
    empresa: "Tech Solutions SAS",
    estado: "activo",
    fechaRegistro: "2024-01-15",
    totalPedidos: 12,
    valorTotal: 2450000,
    ciudad: "Bogotá",
    organizationId: 1
  },
  {
    id: "CLI002",
    nombre: "Carlos Rodríguez",
    email: "carlos.rodriguez@empresa.com",
    telefono: "+57 301 987 6543",
    empresa: "Innovación Digital Ltda",
    estado: "activo",
    fechaRegistro: "2024-02-20",
    totalPedidos: 8,
    valorTotal: 1890000,
    ciudad: "Medellín",
    organizationId: 1
  },
  {
    id: "CLI003",
    nombre: "María López",
    email: "maria.lopez@gmail.com",
    telefono: "+57 302 456 7890",
    empresa: "Freelancer",
    estado: "pendiente",
    fechaRegistro: "2024-03-10",
    totalPedidos: 3,
    valorTotal: 650000,
    ciudad: "Cali",
    organizationId: 2
  },
  {
    id: "CLI004",
    nombre: "Juan Martínez",
    email: "juan.martinez@corporativo.co",
    telefono: "+57 303 789 0123",
    empresa: "Corporativo Nacional",
    estado: "activo",
    fechaRegistro: "2023-11-05",
    totalPedidos: 25,
    valorTotal: 4200000,
    ciudad: "Barranquilla",
    organizationId: 2
  },
  {
    id: "CLI005",
    nombre: "Laura Sánchez",
    email: "laura.sanchez@startup.io",
    telefono: "+57 304 234 5678",
    empresa: "StartUp Innovadora",
    estado: "inactivo",
    fechaRegistro: "2024-01-30",
    totalPedidos: 5,
    valorTotal: 980000,
    ciudad: "Bucaramanga",
    organizationId: 1
  },
  {
    id: "CLI006",
    nombre: "Diego Herrera",
    email: "diego.herrera@pyme.com",
    telefono: "+57 305 567 8901",
    empresa: "PYME Tradicional",
    estado: "activo",
    fechaRegistro: "2023-12-12",
    totalPedidos: 18,
    valorTotal: 3100000,
    ciudad: "Cartagena",
    organizationId: 2
  }
]

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
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            <DropdownMenuItem>Editar cliente</DropdownMenuItem>
            <DropdownMenuItem>Ver pedidos</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Eliminar cliente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]



// Componente principal de la página
export default function ClientesPage() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  
  // Usar el hook de organización para filtrar clientes
  const { selectedOrganizationId } = useOrganization()
  
  // Filtrar datos por organizationId
  const data = React.useMemo(() => {
    if (!selectedOrganizationId) return allData
    return allData.filter(cliente => cliente.organizationId === selectedOrganizationId)
  }, [selectedOrganizationId])
  
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
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
              </Button>
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
                  {((clientesActivos / totalClientes) * 100).toFixed(1)}% del total
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
    </div>
  )
}