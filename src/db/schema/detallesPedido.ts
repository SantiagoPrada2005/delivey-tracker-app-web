import { mysqlTable, serial, int, varchar } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { pedidos } from './pedidos';
import { productos } from './productos';

// Tabla de detalles de pedido (relación muchos a muchos entre pedidos y productos)
export const detallesPedido = mysqlTable('detalles_pedido', {
  id: serial('id').primaryKey(),
  pedidoId: int('pedido_id', {unsigned: true}).notNull().references(() => pedidos.id , { onDelete: 'cascade', onUpdate: 'cascade'}),
  productoId: int('producto_id', {unsigned: true}).notNull().references(() => productos.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
  notaProducto: varchar('nota_producto', { length: 100 }),
  cantidad: int('cantidad').notNull(),
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