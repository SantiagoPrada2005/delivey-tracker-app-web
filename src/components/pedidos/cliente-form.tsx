"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrganization } from "@/hooks/useOrganization";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ClienteFormData } from "./types";

interface ClienteFormProps {
  onCreateCliente: (clienteData: ClienteFormData) => void;
  fetchClientes: () => void;
}

export default function ClienteForm({ onCreateCliente, fetchClientes }: ClienteFormProps) {
  const { selectedOrganizationId } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    organizationId: selectedOrganizationId || 0
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      direccion: '',
      organizationId: selectedOrganizationId || 0
    });
  };

  const handleSubmit = () => {
    onCreateCliente(formData);
    setIsOpen(false);
    resetForm();
    fetchClientes();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-3 h-3 mr-1" />
          Nuevo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Complete la información del cliente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-cliente">Nombre</Label>
              <Input
                id="nombre-cliente"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido-cliente">Apellido</Label>
              <Input
                id="apellido-cliente"
                value={formData.apellido}
                onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                placeholder="Apellido del cliente"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono-cliente">Teléfono</Label>
            <Input
              id="telefono-cliente"
              value={formData.telefono}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              placeholder="Número de teléfono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-cliente">Email</Label>
            <Input
              id="email-cliente"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Correo electrónico"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion-cliente">Dirección</Label>
            <Textarea
              id="direccion-cliente"
              value={formData.direccion}
              onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
              placeholder="Dirección completa del cliente"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setIsOpen(false);
            resetForm();
          }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Crear Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}