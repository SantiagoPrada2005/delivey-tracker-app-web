import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Truck, Timer, AlertCircle, XCircle } from "lucide-react";

// Función para obtener el color del badge según el estado
export function getEstadoBadge(estado: string) {
  switch (estado) {
    case "entregado":
      return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Entregado</Badge>;
    case "en_camino":
      return <Badge className="bg-blue-500 text-white"><Truck className="w-3 h-3 mr-1" />En camino</Badge>;
    case "en_proceso":
      return <Badge className="bg-orange-500 text-white"><Timer className="w-3 h-3 mr-1" />En proceso</Badge>;
    case "pendiente":
      return <Badge className="bg-yellow-500 text-black"><AlertCircle className="w-3 h-3 mr-1" />Pendiente</Badge>;
    case "cancelado":
      return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
    default:
      return <Badge>{estado}</Badge>;
  }
}

// Función para calcular el tiempo de entrega
export function calcularTiempoEntrega(fechaCreacion: Date, fechaEntrega?: Date): number {
  if (!fechaEntrega) return 0;
  const diff = fechaEntrega.getTime() - fechaCreacion.getTime();
  return Math.round(diff / (1000 * 60)); // en minutos
}

// Función para formatear tiempo en formato legible
export function formatearTiempo(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas}h ${mins}m`;
}

// Función para formatear fecha y hora en zona horaria de Bogotá
export function formatearFechaBogota(fecha: Date | string): string {
  const date = new Date(fecha);
  return date.toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Función para formatear fecha completa en zona horaria de Bogotá
export function formatearFechaCompletaBogota(fecha: Date | string): string {
  const date = new Date(fecha);
  return date.toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Función para formatear solo la fecha en zona horaria de Bogotá
export function formatearSoloFechaBogota(fecha: Date | string): string {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Función para obtener la hora actual en Bogotá
export function obtenerHoraActualBogota(): string {
  const now = new Date();
  return now.toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

// Función para generar fecha de entrega por defecto (Bogotá + 15 minutos)
export function generarFechaEntregaPorDefecto(): string {
  const now = new Date();
  // Convertir a zona horaria de Bogotá (UTC-5)
  const bogotaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Bogota"}));
  bogotaTime.setMinutes(bogotaTime.getMinutes() + 15);
  
  // Formatear para datetime-local input (YYYY-MM-DDTHH:MM)
  const year = bogotaTime.getFullYear();
  const month = String(bogotaTime.getMonth() + 1).padStart(2, '0');
  const day = String(bogotaTime.getDate()).padStart(2, '0');
  const hours = String(bogotaTime.getHours()).padStart(2, '0');
  const minutes = String(bogotaTime.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Función para formatear moneda en pesos colombianos
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
}