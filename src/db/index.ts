import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema/index';

// Para desarrollo, puedes usar una conexión directa
const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

// Exportamos la instancia de drizzle con nuestro esquema
export const db = drizzle(connection, { schema, mode: 'default' });