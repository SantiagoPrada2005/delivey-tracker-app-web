// @app/db/shema/organizations.ts

import { int, mysqlTable, varchar, mysqlEnum, timestamp, boolean, text } from "drizzle-orm/mysql-core";
import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { users } from './users';
import { organizationInvitations } from './organizationInvitations';
import { organizationRequests } from './organizationRequests';

/**
 * @Typedef - Schema de la tabla de las organizaciones para logica
 * multiTenat, aqui irá la informacion relevante de cada empresa.
 * @Author - Santiago Prada - Product Owner
 */
export const organizations = mysqlTable("organizations",{
    id : int("id", { unsigned: true }).autoincrement().primaryKey(),
    name : varchar("name", {length : 100}).notNull(),
    nit : int("nit", {unsigned : true}).unique(),
    phoneService : varchar("phone_service", {length : 20}),
    address : varchar("address", {length : 200}),
    regimenContribucion: mysqlEnum("regimen_contribucion", ["Regimen simplificado", "Regimen común"]),
    
    // Campos adicionales para mejorar la funcionalidad
    email: varchar("email", {length: 255}),
    website: varchar("website", {length: 255}),
    description: text("description"),
    logo: text("logo_url"),
    
    // Estado de la organización
    isActive: boolean("is_active").default(true).notNull(),
    
    // Usuario creador/administrador principal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdBy: int("created_by", { unsigned: true }).references((): any => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    
    // Configuraciones de la organización
    allowInvitations: boolean("allow_invitations").default(true).notNull(),
    requireApprovalForJoin: boolean("require_approval_for_join").default(false).notNull(),
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Relaciones
export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  creator: one(users, {
    fields: [organizations.createdBy],
    references: [users.id],
    relationName: 'organizationCreator'
  }),
  members: many(users, {
    relationName: 'organizationMembers'
  }),
  invitations: many(organizationInvitations, {
    relationName: 'organizationInvitations'
  }),
  requests: many(organizationRequests, {
    relationName: 'organizationRequests'
  }),
}));

// Tipos inferidos usando las mejores prácticas de Drizzle ORM
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

// Tipos alternativos usando InferSelectModel e InferInsertModel
export type OrganizationSelect = InferSelectModel<typeof organizations>;
export type OrganizationInsert = InferInsertModel<typeof organizations>;