import { mysqlTable, serial, varchar, timestamp, mysqlEnum, int } from 'drizzle-orm/mysql-core';
import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { organizations } from './organizations';
import { users } from './users';

/**
 * @typedef OrganizationInvitationsSchema
 * @author Santiago Prada
 * @description Schema para manejar invitaciones a organizaciones
 * 
 * Este schema permite:
 * - Invitar usuarios por email a organizaciones
 * - Manejar diferentes estados de invitación
 * - Controlar expiración de invitaciones
 * - Asignar roles específicos en la invitación
 * - Rastrear quién envió la invitación
 */
export const organizationInvitations = mysqlTable('organization_invitations', {
  id: serial('id').primaryKey(),
  
  // Información de la organización
  organizationId: int('organization_id', { unsigned: true })
    .references(() => organizations.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  
  // Email del usuario invitado
  invitedEmail: varchar('invited_email', { length: 255 }).notNull(),
  
  // Usuario que envió la invitación
  invitedBy: int('invited_by', { unsigned: true })
    .references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  
  // Token único para la invitación (UUID)
  invitationToken: varchar('invitation_token', { length: 255 }).notNull().unique(),
  
  // Rol que se asignará al usuario cuando acepte
  assignedRole: mysqlEnum('assigned_role', ['admin', 'service_client', 'delivery']).notNull(),
  
  // Estado de la invitación
  status: mysqlEnum('status', ['pending', 'accepted', 'rejected', 'expired', 'cancelled'])
    .default('pending')
    .notNull(),
  
  // Fecha de expiración (por defecto 7 días)
  expiresAt: timestamp('expires_at').notNull(),
  
  // Usuario que aceptó la invitación (si aplica)
  acceptedBy: int('accepted_by', { unsigned: true })
    .references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  
  // Fecha cuando se aceptó
  acceptedAt: timestamp('accepted_at'),
  
  // Mensaje personalizado de la invitación
  message: varchar('message', { length: 500 }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// Relaciones
export const organizationInvitationsRelations = relations(organizationInvitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationInvitations.organizationId],
    references: [organizations.id],
    relationName: 'organizationInvitations'
  }),
  inviter: one(users, {
    fields: [organizationInvitations.invitedBy],
    references: [users.id],
    relationName: 'inviter'
  }),
  accepter: one(users, {
    fields: [organizationInvitations.acceptedBy],
    references: [users.id],
    relationName: 'accepter'
  }),
}));

// Tipos inferidos usando las mejores prácticas de Drizzle ORM
export type OrganizationInvitation = typeof organizationInvitations.$inferSelect;
export type NewOrganizationInvitation = typeof organizationInvitations.$inferInsert;

// Tipos alternativos usando InferSelectModel e InferInsertModel
export type OrganizationInvitationSelect = InferSelectModel<typeof organizationInvitations>;
export type OrganizationInvitationInsert = InferInsertModel<typeof organizationInvitations>;