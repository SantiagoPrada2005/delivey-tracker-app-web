"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProductos, Producto, ProductoFormData } from "@/hooks/useProductos";
import { useCategorias } from "@/hooks/useCategorias";
import { createProductColumns } from "./product-columns";
import { ProductForm } from "./product-form";
import { ProductStats } from "./product-stats";
import { DataTable } from "./data-table";

export function ProductsManagement() {
  const { toast } = useToast();
  const {
    productos,
    loading: productosLoading,
    error: productosError,
    createProducto,
    updateProducto,
    deleteProducto,
    refreshProductos,
  } = useProductos();
  
  const {
    categorias,
    loading: categoriasLoading,
    error: categoriasError,
    refreshCategorias,
  } = useCategorias();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: "",
    descripcion: "",
    precio: "0",
    costo: "0",
    stock: 0,
    categoriaId: undefined,
    imagen: "",
  });

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      costo: producto.costo || "0",
      stock: producto.stock,
      categoriaId: producto.categoriaId,
      imagen: producto.imagen || "",
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
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  const handleSubmit = async () => {
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
      handleOpenDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: editingProducto
          ? "No se pudo actualizar el producto. Inténtalo de nuevo."
          : "No se pudo crear el producto. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(!isDialogOpen);
    if (isDialogOpen) {
      setEditingProducto(null);
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "0",
        costo: "0",
        stock: 0,
        categoriaId: undefined,
        imagen: "",
      });
    }
  };

  const columns = createProductColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    categorias,
  });

  const loading = productosLoading || categoriasLoading;
  const error = productosError || categoriasError;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600">Error al cargar los datos: {error}</p>
        <div className="flex space-x-2">
          <Button onClick={refreshProductos} variant="outline">
            Reintentar Productos
          </Button>
          <Button onClick={refreshCategorias} variant="outline">
            Reintentar Categorías
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Productos</h2>
          <p className="text-muted-foreground">
            Gestiona tu inventario de productos
          </p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <ProductStats productos={productos} />

      <DataTable
        columns={columns}
        data={productos}
        searchKey="nombre"
        searchPlaceholder="Buscar productos..."
      />

      <ProductForm
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        isEditing={!!editingProducto}
        categorias={categorias}
      />
    </div>
  );
}