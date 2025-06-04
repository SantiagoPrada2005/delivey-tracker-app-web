import { mysqlTable, serial, int, decimal, text, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { clientes } from './clientes';
import { detallesPedido } from './detallesPedido';
import { asignacionesPedido } from './asignacionesPedido';
import { organizations } from './organizations';

// Tabla de pedidos
export const pedidos = mysqlTable('pedidos', {
  id: serial('id').primaryKey(),
  clienteId: int('cliente_id').notNull(),
  estado: mysqlEnum('estado', ['pendiente', 'en_proceso', 'en_camino', 'entregado', 'cancelado']).notNull().default('pendiente'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  direccionEntrega: text('direccion_entrega').notNull(),
  fechaEntrega: timestamp('fecha_entrega'),
  organizationId: int('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Definir relaciones
export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [pedidos.clienteId],
    references: [clientes.id],
  }),
  detalles: many(detallesPedido),
  asignaciones: many(asignacionesPedido),
}));