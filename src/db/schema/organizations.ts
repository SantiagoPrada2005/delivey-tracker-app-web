// @app/db/shema/organizations.ts

import { int, mysqlTable, varchar, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * @Typedef - Schema de la tabla de las organizaciones para logica
 * multiTenat, aqui irá la informacion relevante de cada empresa.
 * @Author - Santiago Prada - Product Owner
 */
export const organizations = mysqlTable("organizations",{
    id : int("id", { unsigned: true }).autoincrement().primaryKey(),
    name : varchar("name", {length : 100}),
    nit : int("nit", {unsigned : true}),
    phoneService : varchar("phone_service", {length : 20}),
    address : varchar("address", {length : 200}),
    regimenContribucion: mysqlEnum("regimen_contribucion", ["Regimen simplificado", "Regimen común"])
})