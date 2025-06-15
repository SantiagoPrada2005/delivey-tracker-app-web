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
import { CategoriaFormData } from "@/hooks/useCategorias";

interface CategoryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CategoriaFormData;
  onFormDataChange: (data: CategoriaFormData) => void;
  onSubmit: () => void;
  isEditing: boolean;
}

export function CategoryForm({
  isOpen,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isEditing,
}: CategoryFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Categoría" : "Crear Nueva Categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los detalles de la categoría."
              : "Completa los detalles para crear una nueva categoría."}
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
              placeholder="Nombre de la categoría"
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
              placeholder="Descripción de la categoría"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Actualizar" : "Crear"} Categoría
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}