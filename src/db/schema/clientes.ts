import { mysqlTable, varchar, text, timestamp, int } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { pedidos } from './pedidos';
import { organizations } from './organizations';

// Tabla de clientes
export const clientes = mysqlTable('clientes', {
  id: int('id').autoincrement().primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  apellido: varchar('apellido', { length: 100 }).notNull(),
  telefono: varchar('telefono', { length: 20 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  direccion: text('direccion').notNull(),
  organizationId: int('organization_id', { unsigned: true }).references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Definir relaciones
export const clientesRelations = relations(clientes, ({ many }) => ({
  pedidos: many(pedidos),
}));