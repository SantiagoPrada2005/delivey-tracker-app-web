import { mysqlTable, serial, varchar, text, int, decimal, timestamp, boolean, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Tabla de clientes
export const clientes = mysqlTable('clientes', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  apellido: varchar('apellido', { length: 100 }).notNull(),
  telefono: varchar('telefono', { length: 20 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  direccion: text('direccion').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabla de productos
export const productos = mysqlTable('productos', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  precio: decimal('precio', { precision: 10, scale: 2 }).notNull(),
  stock: int('stock').notNull().default(0),
  categoria: varchar('categoria', { length: 50 }),
  imagen: varchar('imagen', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabla de pedidos
export const pedidos = mysqlTable('pedidos', {
  id: serial('id').primaryKey(),
  clienteId: int('cliente_id').notNull(),
  estado: mysqlEnum('estado', ['pendiente', 'en_proceso', 'en_camino', 'entregado', 'cancelado']).notNull().default('pendiente'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  direccionEntrega: text('direccion_entrega').notNull(),
  fechaEntrega: timestamp('fecha_entrega'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabla de detalles de pedido (relación muchos a muchos entre pedidos y productos)
export const detallesPedido = mysqlTable('detalles_pedido', {
  id: serial('id').primaryKey(),
  pedidoId: int('pedido_id').notNull(),
  productoId: int('producto_id').notNull(),
  cantidad: int('cantidad').notNull(),
  precioUnitario: decimal('precio_unitario', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
});

// Tabla de repartidores
export const repartidores = mysqlTable('repartidores', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  apellido: varchar('apellido', { length: 100 }).notNull(),
  telefono: varchar('telefono', { length: 20 }).notNull(),
  email: varchar('email', { length: 100 }),
  disponible: boolean('disponible').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabla de asignaciones de pedidos a repartidores
export const asignacionesPedido = mysqlTable('asignaciones_pedido', {
  id: serial('id').primaryKey(),
  pedidoId: int('pedido_id').notNull(),
  repartidorId: int('repartidor_id').notNull(),
  fechaAsignacion: timestamp('fecha_asignacion').defaultNow().notNull(),
  estado: mysqlEnum('estado', ['asignado', 'en_camino', 'entregado', 'cancelado']).notNull().default('asignado'),
});

// Definir relaciones
export const clientesRelations = relations(clientes, ({ many }) => ({
  pedidos: many(pedidos),
}));

export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [pedidos.clienteId],
    references: [clientes.id],
  }),
  detalles: many(detallesPedido),
  asignaciones: many(asignacionesPedido),
}));

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

export const repartidoresRelations = relations(repartidores, ({ many }) => ({
  asignaciones: many(asignacionesPedido),
}));

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