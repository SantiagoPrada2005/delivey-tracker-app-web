import { mysqlTable, serial, varchar, timestamp, text, mysqlEnum, int } from 'drizzle-orm/mysql-core';
import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { users } from './users';
import { organizations } from './organizations';

/**
 * @typedef OrganizationRequestsSchema
 * @author Santiago Prada
 * @description Schema para manejar solicitudes de creación de organizaciones
 * 
 * Este schema permite:
 * - Usuarios pueden solicitar crear nuevas organizaciones
 * - Proceso de aprobación/rechazo por administradores
 * - Rastrear información completa de la organización solicitada
 * - Manejar diferentes estados del proceso
 */
export const organizationRequests = mysqlTable('organization_requests', {
  id: serial('id').primaryKey(),
  
  // Usuario que solicita crear la organización
  requestedBy: int('requested_by', { unsigned: true })
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  
  // Información de la organización solicitada
  organizationName: varchar('organization_name', { length: 100 }).notNull(),
  organizationNit: int('organization_nit', { unsigned: true }),
  organizationPhone: varchar('organization_phone', { length: 20 }),
  organizationAddress: varchar('organization_address', { length: 200 }),
  organizationRegimen: mysqlEnum('organization_regimen', ['Regimen simplificado', 'Regimen común']),
  
  // Justificación de la solicitud
  businessJustification: text('business_justification').notNull(),
  
  // Información adicional del solicitante
  contactName: varchar('contact_name', { length: 100 }).notNull(),
  contactPosition: varchar('contact_position', { length: 100 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  
  // Estado de la solicitud
  status: mysqlEnum('status', ['pending', 'under_review', 'approved', 'rejected', 'cancelled'])
    .default('pending')
    .notNull(),
  
  // Administrador que revisó la solicitud
  reviewedBy: int('reviewed_by', { unsigned: true })
    .references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  
  // Fecha de revisión
  reviewedAt: timestamp('reviewed_at'),
  
  // Comentarios del revisor
  reviewComments: text('review_comments'),
  
  // ID de la organización creada (si fue aprobada)
  createdOrganizationId: int('created_organization_id', { unsigned: true })
    .references(() => organizations.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  
  // Prioridad de la solicitud
  priority: mysqlEnum('priority', ['low', 'medium', 'high', 'urgent'])
    .default('medium')
    .notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// Relaciones
export const organizationRequestsRelations = relations(organizationRequests, ({ one }) => ({
  requester: one(users, {
    fields: [organizationRequests.requestedBy],
    references: [users.id],
    relationName: 'requester'
  }),
  reviewer: one(users, {
    fields: [organizationRequests.reviewedBy],
    references: [users.id],
    relationName: 'reviewer'
  }),
  createdOrganization: one(organizations, {
    fields: [organizationRequests.createdOrganizationId],
    references: [organizations.id],
    relationName: 'organizationRequests'
  }),
}));

// Tipos inferidos usando las mejores prácticas de Drizzle ORM
export type OrganizationRequest = typeof organizationRequests.$inferSelect;
export type NewOrganizationRequest = typeof organizationRequests.$inferInsert;

// Tipos alternativos usando InferSelectModel e InferInsertModel
export type OrganizationRequestSelect = InferSelectModel<typeof organizationRequests>;
export type OrganizationRequestInsert = InferInsertModel<typeof organizationRequests>;