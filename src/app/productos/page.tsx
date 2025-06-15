"use client";

import * as React from "react";
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
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { useProductos, Producto, ProductoFormData } from "@/hooks/useProductos";
import { useCategorias } from "@/hooks/useCategorias";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";

// Componente principal se moverá más abajo para usar los hooks

// Definición de columnas
const createColumns = (
  onEdit: (producto: Producto) => void,
  onDelete: (producto: Producto) => void,
  categorias: { id: number; nombre: string }[]
): ColumnDef<Producto>[] => [
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
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("nombre")}</div>
    ),
  },
  {
    accessorKey: "categoriaId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Categoría
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const categoriaId = row.getValue("categoriaId") as number;
      const categoria = categorias.find(c => c.id === categoriaId);
      return categoria ? (
        <Badge variant="outline">{categoria.nombre}</Badge>
      ) : (
        <span className="text-muted-foreground">Sin categoría</span>
      );
    },
  },
  {
    accessorKey: "precio",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Precio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("precio"));
      const formatted = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
      }).format(price);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return (
        <div className={`font-medium ${
          stock === 0 ? "text-red-600" : stock < 10 ? "text-yellow-600" : "text-green-600"
        }`}>
          {stock} unidades
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const producto = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(producto)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                 Esta acción no se puede deshacer. Esto eliminará permanentemente el producto &quot;{producto.nombre}&quot; de tu inventario.
               </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(producto)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];

// Componente DataTable
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={(table.getColumn("nombre")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("nombre")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Filter className="mr-2 h-4 w-4" />
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
                    onCheckedChange={(value: boolean) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
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
                  );
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
                  No se encontraron productos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
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
    </div>
  );
}

// Componente principal de la página
export default function ProductsPage() {
  const {
    productos,
    loading,
    error,
    createProducto,
    updateProducto,
    deleteProducto,
    fetchProductos,
  } = useProductos();

  const {
    categorias,
  } = useCategorias();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: '',
    descripcion: '',
    precio: '0',
    costo: '0',
    stock: 0,
    categoriaId: null,
    imagen: ''
  });

  // Funciones para manejar el CRUD
  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio.toString(),
      costo: producto.costo?.toString() || '0',
      stock: producto.stock,
      categoriaId: producto.categoriaId || null,
      imagen: producto.imagen || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (producto: Producto) => {
    try {
      await deleteProducto(producto.id);
      toast({
        title: "Producto eliminado",
        description: `El producto "${producto.nombre}" ha sido eliminado exitosamente.`,
      });
    } catch {
       toast({
         title: "Error",
         description: "No se pudo eliminar el producto. Inténtalo de nuevo.",
         variant: "destructive",
       });
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del producto es requerido.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.precio) <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser mayor a 0.",
        variant: "destructive",
      });
      return;
    }

    if (formData.costo && parseFloat(formData.costo) < 0) {
      toast({
        title: "Error",
        description: "El costo no puede ser negativo.",
        variant: "destructive",
      });
      return;
    }

    if (formData.stock < 0) {
      toast({
        title: "Error",
        description: "El stock no puede ser negativo.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingProducto) {
        await updateProducto(editingProducto.id, formData);
        toast({
          title: "Producto actualizado",
          description: `El producto "${formData.nombre}" ha sido actualizado exitosamente.`,
        });
      } else {
        await createProducto(formData);
        toast({
          title: "Producto creado",
          description: `El producto "${formData.nombre}" ha sido creado exitosamente.`,
        });
      }
      
      setIsDialogOpen(false);
      setEditingProducto(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '0',
        costo: '0',
        stock: 0,
        categoriaId: null,
        imagen: ''
      });
    } catch {
       toast({
         title: "Error",
         description: editingProducto 
           ? "No se pudo actualizar el producto. Inténtalo de nuevo."
           : "No se pudo crear el producto. Inténtalo de nuevo.",
         variant: "destructive",
       });
     }
  };

  const handleOpenDialog = () => {
    setEditingProducto(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '0',
      costo: '0',
      stock: 0,
      categoriaId: null,
      imagen: ''
    });
    setIsDialogOpen(true);
    fetchProductos();
  };

  const columns = createColumns(handleEdit, handleDelete, categorias);

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cargando productos...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar productos</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchProductos}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="flex h-14 items-center justify-between border-b px-4 lg:hidden">
          <h1 className="text-xl font-semibold">Productos</h1>
          <MobileSidebar />
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gestión de Productos</h1>
                <p className="text-muted-foreground">
                  Administra tu catálogo de productos, precios y stock
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProducto 
                        ? 'Modifica los datos del producto seleccionado.'
                        : 'Completa la información para crear un nuevo producto.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nombre" className="text-right">
                          Nombre
                        </Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="col-span-3"
                          placeholder="Nombre del producto"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="descripcion" className="text-right">
                          Descripción
                        </Label>
                        <Textarea
                          id="descripcion"
                          value={formData.descripcion}
                          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                          className="col-span-3"
                          placeholder="Descripción del producto"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="precio" className="text-right">
                          Precio
                        </Label>
                        <Input
                          id="precio"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.precio}
                          onChange={(e) => setFormData({ ...formData, precio: e.target.value || '0' })}
                          className="col-span-3"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="costo" className="text-right">
                          Costo
                        </Label>
                        <Input
                          id="costo"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.costo}
                          onChange={(e) => setFormData({ ...formData, costo: e.target.value || '0' })}
                          className="col-span-3"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">
                          Stock
                        </Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                          className="col-span-3"
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categoria" className="text-right">
                          Categoría
                        </Label>
                        <Select
                          value={formData.categoriaId ? formData.categoriaId.toString() : ""}
                          onValueChange={(value) => setFormData({ ...formData, categoriaId: value ? parseInt(value) : null })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map((categoria) => (
                              <SelectItem key={categoria.id} value={categoria.id.toString()}>
                                {categoria.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="imagen" className="text-right">
                          Imagen URL
                        </Label>
                        <Input
                          id="imagen"
                          value={formData.imagen}
                          onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                          className="col-span-3"
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">
                        {editingProducto ? 'Actualizar' : 'Crear'} Producto
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Productos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productos.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 desde el mes pasado
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Productos Activos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {productos.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total de productos
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sin Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {productos.filter(p => p.stock === 0).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requieren reposición
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Valor Total Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                    }).format(
                      productos.reduce((total, product) => total + (parseFloat(product.precio) * product.stock), 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inventario total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Productos</CardTitle>
                <CardDescription>
                  Gestiona todos tus productos desde esta tabla. Puedes filtrar, ordenar y realizar acciones sobre cada producto.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} data={productos} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}