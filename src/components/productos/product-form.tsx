import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductoFormData } from "@/hooks/useProductos";

interface ProductFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProductoFormData;
  onFormDataChange: (data: ProductoFormData) => void;
  onSubmit: () => void;
  isEditing: boolean;
  categorias: { id: number; nombre: string }[];
}

export function ProductForm({
  isOpen,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isEditing,
  categorias,
}: ProductFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Producto" : "Crear Nuevo Producto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los detalles del producto."
              : "Completa los detalles para crear un nuevo producto."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) =>
                onFormDataChange({ ...formData, nombre: e.target.value })
              }
              placeholder="Nombre del producto"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, descripcion: e.target.value })
              }
              placeholder="Descripción del producto"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    precio: e.target.value,
                  })
                }
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costo">Costo</Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                min="0"
                value={formData.costo || ""}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    costo: e.target.value,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={formData.categoriaId?.toString() || ""}
                onValueChange={(value) =>
                  onFormDataChange({
                    ...formData,
                    categoriaId: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="imagen">URL de Imagen</Label>
            <Input
              id="imagen"
              value={formData.imagen || ""}
              onChange={(e) =>
                onFormDataChange({ ...formData, imagen: e.target.value })
              }
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Actualizar" : "Crear"} Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}