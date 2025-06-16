// Tipos para los pedidos basados en el schema de la base de datos
export interface Pedido {
  id: number;
  clienteId: number;
  estado: 'pendiente' | 'en_proceso' | 'en_camino' | 'entregado' | 'cancelado';
  total: number;
  direccionEntrega: string;
  fechaEntrega?: Date;
  organizationId: number;
  createdAt: Date;
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
  };
  asignaciones?: {
    id: number;
    repartidorId: number;
    fechaAsignacion: Date;
    estado: 'asignado' | 'en_camino' | 'entregado' | 'cancelado';
    repartidor?: {
      nombre: string;
      apellido: string;
    };
  }[];
  detalles?: {
    id: number;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    producto?: {
      nombre: string;
    };
  }[];
}

export interface PedidoFormData {
  clienteId: string;
  direccionEntrega: string;
  fechaEntrega: string;
  detalles: {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
  }[];
}

export interface ClienteFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
  direccion: string;
  organizationId: number;
}