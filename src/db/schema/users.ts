// src/db/schema/users.ts (o donde definas tus esquemas de Drizzle)

import { mysqlTable, varchar, timestamp, text, boolean, index, mysqlEnum, int } from 'drizzle-orm/mysql-core';
//import { createInsertSchema, createSelectSchema } from 'drizzle-zod'; // Para validación con Zod
import { organizations } from './organizations';

/**
 * @typedef UserTableSchema
 * @author Santiago Prada
 * @description Define la estructura de la tabla 'users' en la base de datos MySQL.
 *
 * @property {number} id - Clave primaria autoincremental interna de la base de datos.
 * @property {string} firebaseUid - El UID único proporcionado por Firebase Auth. Este será el enlace principal. Longitud 255 por si acaso, aunque suelen ser más cortos. Es CRÍTICO que sea único.
 * @property {string | null} email - Correo electrónico del usuario, obtenido de Firebase. Puede ser nulo si Firebase lo permite (ej. login anónimo, aunque no es nuestro caso aquí).
 * @property {boolean} emailVerified - Si el email ha sido verificado (según Firebase).
 * @property {string | null} phoneNumber - Número de teléfono del usuario (formato E.164), de Firebase.
 * @property {string | null} displayName - Nombre para mostrar del usuario, de Firebase.
 * @property {string | null} photoURL - URL de la foto de perfil del usuario, de Firebase.
 * @property {string | null} providerId - El proveedor de autenticación principal (ej. 'google.com', 'password').
 * @property {mysqlEnum} role - Rol del usuario en tu aplicación (ej. 'user', 'admin', 'editor'). Default 'user'.
 * @property {Date} createdAt - Timestamp de cuándo se creó el registro en TU base de datos.
 * @property {Date} updatedAt - Timestamp de la última actualización del registro en TU base de datos.
 * @property {Date | null} lastLoginAt - Timestamp del último inicio de sesión del usuario (actualizado por tu lógica).
 * @property {boolean} isActive - Para desactivar usuarios sin eliminarlos. Default true.
 *
 * @todo Considerar añadir campos específicos de la aplicación, como:
 * - `preferences` (JSON o TEXT)
 * - `organizationId` (si tienes multi-tenancy)
 * - `subscriptionStatus` (si tienes planes de suscripción)
 */
export const users = mysqlTable('users', {
  // Clave primaria interna de la BD (opcional si firebaseUid es tu PK, pero recomendable tener una PK numérica simple)
  id: int('id').autoincrement().primaryKey(), // `serial` es un alias para `int unsigned not null auto_increment unique`

  // --- Campos de Firebase Auth ---
  firebaseUid: varchar('firebase_uid', { length: 255 }).notNull().unique(), // Muy importante: único y notNull
  email: varchar('email', { length: 255 }), // Puede ser nulo si el proveedor no lo da, o si permites usuarios sin email.
  emailVerified: boolean('email_verified').default(false),
  phoneNumber: varchar('phone_number', { length: 50 }), // Longitud 50 debería ser suficiente para E.164 + algunos caracteres extra. Nullable.
  displayName: varchar('display_name', { length: 255 }),
  photoURL: text('photo_url'), // `text` para URLs potencialmente largas
  providerId: varchar('provider_id', { length: 50 }), // ej: 'google.com', 'password', 'phone'

  // --- Campos específicos de tu aplicación ---
  role: mysqlEnum('role', ['admin', 'service_client', 'delivery', 'N/A']).default('N/A').notNull(), //'admin', 'medico', 'asistente', 'N/A'
  isActive: boolean('is_active').default(true).notNull(),
  organizationId: int('organization_id', { unsigned: true }).references(()=> organizations.id, {onDelete: "cascade", onUpdate: "cascade"}),
  lastLoginAt: timestamp('last_login_at'),

  // --- Timestamps ---
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(), // Se actualiza automáticamente en cada UPDATE
}, (table) => [
  // Índices para mejorar el rendimiento de las búsquedas
  index('firebase_uid_idx').on(table.firebaseUid),
  index('email_idx').on(table.email), // Si buscas frecuentemente por email
  index('role_idx').on(table.role),   // Si filtras por rol
  index('phone_number_idx').on(table.phoneNumber),
]);

// Esquemas Zod para validación (opcional pero muy recomendado)
//export const insertUserSchema = createInsertSchema(users);
//export const selectUserSchema = createSelectSchema(users);

export type User = typeof users.$inferSelect; // Tipo para seleccionar usuarios
export type NewUser = typeof users.$inferInsert; // Tipo para insertar nuevos usuarios