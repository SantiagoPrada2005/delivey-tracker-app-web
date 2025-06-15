import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tags, Calendar, TrendingUp } from "lucide-react";
import { Categoria } from "@/hooks/useCategorias";

interface CategoryStatsProps {
  categorias: Categoria[];
}

export function CategoryStats({ categorias }: CategoryStatsProps) {
  const totalCategorias = categorias.length;
  const categoriasRecientes = categorias.filter(categoria => {
    const fechaCreacion = new Date(categoria.createdAt);
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    return fechaCreacion >= hace30Dias;
  }).length;

  const categoriaConDescripcion = categorias.filter(c => c.descripcion && c.descripcion.trim() !== "").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Categorías</CardTitle>
          <Tags className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCategorias}</div>
          <p className="text-xs text-muted-foreground">
            Categorías registradas
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recientes</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{categoriasRecientes}</div>
          <p className="text-xs text-muted-foreground">
            Últimos 30 días
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Con Descripción</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{categoriaConDescripcion}</div>
          <p className="text-xs text-muted-foreground">
            Categorías completas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}