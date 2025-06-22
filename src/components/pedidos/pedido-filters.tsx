import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface PedidoFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterEstado: string;
  setFilterEstado: (estado: string) => void;
}

export default function PedidoFilters({
  searchTerm,
  setSearchTerm,
  filterEstado,
  setFilterEstado
}: PedidoFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4 px-1 sm:px-0">
      {/* Buscador */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente, dirección o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 text-sm h-10"
        />
      </div>
      
      {/* Filtro por estado */}
      <Select value={filterEstado} onValueChange={setFilterEstado}>
        <SelectTrigger className="w-full sm:w-[200px] text-sm h-10">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los estados</SelectItem>
          <SelectItem value="pendiente">Pendiente</SelectItem>
          <SelectItem value="en_proceso">En proceso</SelectItem>
          <SelectItem value="en_camino">En camino</SelectItem>
          <SelectItem value="entregado">Entregado</SelectItem>
          <SelectItem value="cancelado">Cancelado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}