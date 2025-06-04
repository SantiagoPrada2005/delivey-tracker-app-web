// @app/db/schema/userPermitions.ts

import { boolean } from "drizzle-orm/gel-core";
import { int, mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";

export const userPermitions = mysqlTable('user_permitions' , {
    id: serial('id').autoincrement().primaryKey(),
    description: varchar("description",{length : 100}),
    modifyClients : boolean('modify_clients').default(false).notNull(),
    modifyOrders : boolean('modify-orders').default(false).notNull(),

});