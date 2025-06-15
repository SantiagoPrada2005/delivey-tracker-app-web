import { mysqlTable, varchar, int, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { productos } from './productos';
import { organizations } from './organizations';

// Tabla de categorías de productos
export const categoriaProducto = mysqlTable('categoria_producto', {
  id: int('id', {unsigned:true}).primaryKey().autoincrement().notNull(),
  nombre: varchar('nombre', { length: 50 }).notNull(),
  descripcion: varchar('descripcion', { length: 255 }),
  organizationId: int('organization_id', { unsigned: true }).references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Definir relaciones
export const categoriaProductoRelations = relations(categoriaProducto, ({ many }) => ({
  productos: many(productos),
}));