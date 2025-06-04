import { mysqlTable, serial, varchar, text, int, decimal, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { detallesPedido } from './detallesPedido';
import { organizations } from './organizations';

// Tabla de productos
export const productos = mysqlTable('productos', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  precio: decimal('precio', { precision: 10, scale: 2 }).notNull(),
  stock: int('stock').notNull().default(0),
  categoria: varchar('categoria', { length: 50 }),
  imagen: varchar('imagen', { length: 255 }),
  organizationId: int('organization_id', { unsigned: true }).references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Definir relaciones
export const productosRelations = relations(productos, ({ many }) => ({
  detalles: many(detallesPedido),
}));