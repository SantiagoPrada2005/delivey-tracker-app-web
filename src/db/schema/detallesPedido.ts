import { mysqlTable, serial, int, decimal } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { pedidos } from './pedidos';
import { productos } from './productos';

// Tabla de detalles de pedido (relación muchos a muchos entre pedidos y productos)
export const detallesPedido = mysqlTable('detalles_pedido', {
  id: serial('id').primaryKey(),
  pedidoId: int('pedido_id').notNull(),
  productoId: int('producto_id').notNull(),
  cantidad: int('cantidad').notNull(),
  precioUnitario: decimal('precio_unitario', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
});

// Definir relaciones
export const detallesPedidoRelations = relations(detallesPedido, ({ one }) => ({
  pedido: one(pedidos, {
    fields: [detallesPedido.pedidoId],
    references: [pedidos.id],
  }),
  producto: one(productos, {
    fields: [detallesPedido.productoId],
    references: [productos.id],
  }),
}));