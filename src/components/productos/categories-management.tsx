"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCategorias, Categoria, CategoriaFormData } from "@/hooks/useCategorias";
import { createCategoryColumns } from "./category-columns";
import { CategoryForm } from "./category-form";
import { CategoryStats } from "./category-stats";
import { DataTable } from "./data-table";

export function CategoriesManagement() {
  const { toast } = useToast();
  const {
    categorias,
    loading: categoriasLoading,
    error: categoriasError,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    refreshCategorias,
  } = useCategorias();

  const [isCategoriaDialogOpen, setIsCategoriaDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [categoriaFormData, setCategoriaFormData] = useState<CategoriaFormData>({
    nombre: "",
    descripcion: "",
  });

  const handleEditCategoria = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setCategoriaFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
    });
    setIsCategoriaDialogOpen(true);
  };

  const handleDeleteCategoria = async (categoria: Categoria) => {
    try {
      await deleteCategoria(categoria.id);
      toast({
        title: "Categoría eliminada",
        description: `La categoría "${categoria.nombre}" ha sido eliminada exitosamente.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  const handleSubmitCategoria = async () => {
    try {
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, categoriaFormData);
        toast({
          title: "Categoría actualizada",
          description: `La categoría "${categoriaFormData.nombre}" ha sido actualizada exitosamente.`,
        });
      } else {
        await createCategoria(categoriaFormData);
        toast({
          title: "Categoría creada",
          description: `La categoría "${categoriaFormData.nombre}" ha sido creada exitosamente.`,
        });
      }
      handleOpenCategoriaDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: editingCategoria
          ? "No se pudo actualizar la categoría. Inténtalo de nuevo."
          : "No se pudo crear la categoría. Inténtalo de nuevo.",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  const handleOpenCategoriaDialog = () => {
    setIsCategoriaDialogOpen(!isCategoriaDialogOpen);
    if (isCategoriaDialogOpen) {
      setEditingCategoria(null);
      setCategoriaFormData({
        nombre: "",
        descripcion: "",
      });
    }
  };

  const categoriasColumns = createCategoryColumns({
    onEdit: handleEditCategoria,
    onDelete: handleDeleteCategoria,
  });

  if (categoriasLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (categoriasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600">Error al cargar las categorías: {categoriasError}</p>
        <Button onClick={refreshCategorias} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categorías</h2>
          <p className="text-muted-foreground">
            Gestiona las categorías de tus productos
          </p>
        </div>
        <Button onClick={handleOpenCategoriaDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <CategoryStats categorias={categorias} />

      <DataTable
        columns={categoriasColumns}
        data={categorias}
        searchKey="nombre"
        searchPlaceholder="Buscar categorías..."
      />

      <CategoryForm
        isOpen={isCategoriaDialogOpen}
        onOpenChange={setIsCategoriaDialogOpen}
        formData={categoriaFormData}
        onFormDataChange={setCategoriaFormData}
        onSubmit={handleSubmitCategoria}
        isEditing={!!editingCategoria}
      />
    </div>
  );
}