import { mysqlTable, varchar, text, int, decimal, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { detallesPedido } from './detallesPedido';
import { organizations } from './organizations';
import { categoriaProducto } from './categoriaProducto';

// Tabla de productos
export const productos = mysqlTable('productos', {
  id: int('id', {unsigned: true}).primaryKey().autoincrement().notNull(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  precio: decimal('precio', { precision: 10, scale: 2 }).notNull(),
  costo: decimal('costo', { precision: 10, scale: 2 }),
  stock: int('stock').notNull().default(0),
  categoriaId: int('categoria_id', { unsigned: true }).references(() => categoriaProducto.id),
  imagen: varchar('imagen', { length: 255 }),
  organizationId: int('organization_id', { unsigned: true }).references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Definir relaciones
export const productosRelations = relations(productos, ({ many, one }) => ({
  detalles: many(detallesPedido),
  categoria: one(categoriaProducto, {
    fields: [productos.categoriaId],
    references: [categoriaProducto.id],
  }),
}));