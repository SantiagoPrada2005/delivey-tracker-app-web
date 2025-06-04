import { mysqlTable, serial, varchar, timestamp, boolean, int } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { asignacionesPedido } from './asignacionesPedido';
import { organizations } from './organizations';

// Tabla de repartidores
export const repartidores = mysqlTable('repartidores', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  apellido: varchar('apellido', { length: 100 }).notNull(),
  telefono: varchar('telefono', { length: 20 }).notNull(),
  email: varchar('email', { length: 100 }),
  disponible: boolean('disponible').default(true),
  organizationId: int('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Definir relaciones
export const repartidoresRelations = relations(repartidores, ({ many }) => ({
  asignaciones: many(asignacionesPedido),
}));