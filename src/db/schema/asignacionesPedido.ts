import { mysqlTable, serial, int, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { pedidos } from './pedidos';
import { repartidores } from './repartidores';

// Tabla de asignaciones de pedidos a repartidores
export const asignacionesPedido = mysqlTable('asignaciones_pedido', {
  id: serial('id').primaryKey(),
  pedidoId: int('pedido_id').notNull(),
  repartidorId: int('repartidor_id').notNull(),
  fechaAsignacion: timestamp('fecha_asignacion').defaultNow().notNull(),
  estado: mysqlEnum('estado', ['asignado', 'en_camino', 'entregado', 'cancelado']).notNull().default('asignado'),
});

// Definir relaciones
export const asignacionesPedidoRelations = relations(asignacionesPedido, ({ one }) => ({
  pedido: one(pedidos, {
    fields: [asignacionesPedido.pedidoId],
    references: [pedidos.id],
  }),
  repartidor: one(repartidores, {
    fields: [asignacionesPedido.repartidorId],
    references: [repartidores.id],
  }),
}));