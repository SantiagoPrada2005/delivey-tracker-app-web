import { mysqlTable, serial, int, varchar, boolean, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { asignacionesPedido } from './asignacionesPedido';
import { organizations } from './organizations';
import { users } from './users';

/**
 * Tabla de repartidores
 * 
 * Esta tabla conecta usuarios de la organización con el rol de repartidor.
 * Un usuario puede ser asignado como repartidor y tener información específica
 * para las entregas como disponibilidad y datos de contacto.
 */
export const repartidores = mysqlTable('repartidores', {
  id: serial('id').primaryKey(),
  userId: int('user_id', { unsigned: true })
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  apellido: varchar('apellido', { length: 100 }).notNull(),
  telefono: varchar('telefono', { length: 20 }).notNull(),
  email: varchar('email', { length: 100 }),
  disponible: boolean('disponible').default(true),
  organization_id: int('organization_id', { unsigned: true })
    .references(() => organizations.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// Definir relaciones
export const repartidoresRelations = relations(repartidores, ({ one, many }) => ({
  // Relación con el usuario asignado como repartidor
  user: one(users, {
    fields: [repartidores.userId],
    references: [users.id],
    relationName: 'userRepartidor'
  }),
  // Relación con la organización
  organization: one(organizations, {
    fields: [repartidores.organization_id],
    references: [organizations.id],
    relationName: 'organizationRepartidores'
  }),
  // Relación con las asignaciones de pedidos
  asignaciones: many(asignacionesPedido, {
    relationName: 'repartidorAsignaciones'
  }),
}));

// Tipos inferidos
export type Repartidor = typeof repartidores.$inferSelect;
export type NewRepartidor = typeof repartidores.$inferInsert;