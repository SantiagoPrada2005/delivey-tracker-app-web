import { db } from '@/db';
import { 
  clientes, 
  productos, 
  pedidos, 
  detallesPedido,
  repartidores, 
  asignacionesPedido,
  organizations, 
  users,
  userPermitions 
} from '@/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

/**
 * Servicio de base de datos con soporte para multi-tenancy
 * Todas las consultas incluyen filtrado por organizationId
 */

// Funciones para Clientes
export async function getClientesByOrganization(organizationId: number) {
  return await db.select().from(clientes).where(eq(clientes.organizationId, organizationId));
}

export async function getClienteById(id: number, organizationId: number) {
  return await db.select().from(clientes)
    .where(and(eq(clientes.id, id), eq(clientes.organizationId, organizationId)))
    .limit(1);
}

export async function createCliente(clienteData: Omit<typeof clientes.$inferInsert, 'organizationId'>, organizationId: number) {
  return await db.insert(clientes).values({
    ...clienteData,
    organizationId
  });
}

export async function updateCliente(id: number, clienteData: Partial<typeof clientes.$inferInsert>, organizationId: number) {
  return await db.update(clientes)
    .set(clienteData)
    .where(and(eq(clientes.id, id), eq(clientes.organizationId, organizationId)));
}

export async function deleteCliente(id: number, organizationId: number) {
  return await db.delete(clientes)
    .where(and(eq(clientes.id, id), eq(clientes.organizationId, organizationId)));
}

// Funciones para Productos
export async function getProductosByOrganization(organizationId: number) {
  return await db.select().from(productos).where(eq(productos.organizationId, organizationId));
}

export async function getProductoById(id: number, organizationId: number) {
  return await db.select().from(productos)
    .where(and(eq(productos.id, id), eq(productos.organizationId, organizationId)))
    .limit(1);
}

export async function createProducto(productoData: Omit<typeof productos.$inferInsert, 'organizationId'>, organizationId: number) {
  return await db.insert(productos).values({
    ...productoData,
    organizationId
  });
}

export async function updateProducto(id: number, productoData: Partial<typeof productos.$inferInsert>, organizationId: number) {
  return await db.update(productos)
    .set(productoData)
    .where(and(eq(productos.id, id), eq(productos.organizationId, organizationId)));
}

export async function deleteProducto(id: number, organizationId: number) {
  return await db.delete(productos)
    .where(and(eq(productos.id, id), eq(productos.organizationId, organizationId)));
}

// Funciones para Pedidos
export async function getPedidosByOrganization(organizationId: number) {
  return await db.select().from(pedidos).where(eq(pedidos.organizationId, organizationId));
}

export async function getPedidoById(id: number, organizationId: number) {
  return await db.select().from(pedidos)
    .where(and(eq(pedidos.id, id), eq(pedidos.organizationId, organizationId)))
    .limit(1);
}

export async function createPedido(pedidoData: Omit<typeof pedidos.$inferInsert, 'organizationId'>, organizationId: number) {
  return await db.insert(pedidos).values({
    ...pedidoData,
    organizationId
  });
}

export async function updatePedido(id: number, pedidoData: Partial<typeof pedidos.$inferInsert>, organizationId: number) {
  return await db.update(pedidos)
    .set(pedidoData)
    .where(and(eq(pedidos.id, id), eq(pedidos.organizationId, organizationId)));
}

export async function deletePedido(id: number, organizationId: number) {
  return await db.delete(pedidos)
    .where(and(eq(pedidos.id, id), eq(pedidos.organizationId, organizationId)));
}

// Funciones para Repartidores
export async function getRepartidoresByOrganization(organizationId: number) {
  return await db.select().from(repartidores).where(eq(repartidores.organizationId, organizationId));
}

export async function getRepartidorById(id: number, organizationId: number) {
  return await db.select().from(repartidores)
    .where(and(eq(repartidores.id, id), eq(repartidores.organizationId, organizationId)))
    .limit(1);
}

export async function createRepartidor(repartidorData: Omit<typeof repartidores.$inferInsert, 'organizationId'>, organizationId: number) {
  return await db.insert(repartidores).values({
    ...repartidorData,
    organizationId
  });
}

export async function updateRepartidor(id: number, repartidorData: Partial<typeof repartidores.$inferInsert>, organizationId: number) {
  return await db.update(repartidores)
    .set(repartidorData)
    .where(and(eq(repartidores.id, id), eq(repartidores.organizationId, organizationId)));
}

export async function deleteRepartidor(id: number, organizationId: number) {
  return await db.delete(repartidores)
    .where(and(eq(repartidores.id, id), eq(repartidores.organizationId, organizationId)));
}

// Funciones para Organizaciones
export async function getOrganizationById(id: number) {
  return await db.select().from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
}

export async function getAllOrganizations() {
  return await db.select().from(organizations);
}

export async function createOrganization(data: Partial<typeof organizations.$inferInsert>) {
  const result = await db.insert(organizations).values(data).$returningId();
  return result[0];
}

export async function updateOrganization(id: number, data: Partial<typeof organizations.$inferInsert>) {
  await db.update(organizations).set(data).where(eq(organizations.id, id));
  const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
  return organization;
}

export async function deleteOrganization(id: number) {
  return await db.delete(organizations)
    .where(eq(organizations.id, id));
}

// Funciones para Detalles de Pedido
export async function getDetallesPedidoByPedido(pedidoId: number, organizationId: number) {
  return await db.select({
    id: detallesPedido.id,
    pedidoId: detallesPedido.pedidoId,
    productoId: detallesPedido.productoId,
    cantidad: detallesPedido.cantidad,
    precioUnitario: detallesPedido.precioUnitario,
    subtotal: detallesPedido.subtotal,
    producto: {
      id: productos.id,
      nombre: productos.nombre,
      precio: productos.precio
    }
  })
  .from(detallesPedido)
  .innerJoin(productos, eq(detallesPedido.productoId, productos.id))
  .innerJoin(pedidos, eq(detallesPedido.pedidoId, pedidos.id))
  .where(and(
    eq(detallesPedido.pedidoId, pedidoId),
    eq(pedidos.organizationId, organizationId)
  ));
}

export async function createDetallePedido(detalleData: typeof detallesPedido.$inferInsert) {
  return await db.insert(detallesPedido).values(detalleData);
}

export async function updateDetallePedido(id: number, detalleData: Partial<typeof detallesPedido.$inferInsert>, organizationId: number) {
  return await db.update(detallesPedido)
    .set(detalleData)
    .where(and(
      eq(detallesPedido.id, id),
      sql`EXISTS (SELECT 1 FROM ${pedidos} WHERE ${pedidos.id} = ${detallesPedido.pedidoId} AND ${pedidos.organizationId} = ${organizationId})`
    ));
}

export async function deleteDetallePedido(id: number, organizationId: number) {
  return await db.delete(detallesPedido)
    .where(and(
      eq(detallesPedido.id, id),
      sql`EXISTS (SELECT 1 FROM ${pedidos} WHERE ${pedidos.id} = ${detallesPedido.pedidoId} AND ${pedidos.organizationId} = ${organizationId})`
    ));
}

// Funciones para Asignaciones de Pedido
export async function getAsignacionesByOrganization(organizationId: number) {
  return await db.select({
    id: asignacionesPedido.id,
    pedidoId: asignacionesPedido.pedidoId,
    repartidorId: asignacionesPedido.repartidorId,
    estado: asignacionesPedido.estado,
    fechaAsignacion: asignacionesPedido.fechaAsignacion,
    pedido: {
      id: pedidos.id,
      estado: pedidos.estado,
      total: pedidos.total
    },
    repartidor: {
      id: repartidores.id,
      nombre: repartidores.nombre,
      telefono: repartidores.telefono
    }
  })
  .from(asignacionesPedido)
  .innerJoin(pedidos, eq(asignacionesPedido.pedidoId, pedidos.id))
  .innerJoin(repartidores, eq(asignacionesPedido.repartidorId, repartidores.id))
  .where(eq(pedidos.organizationId, organizationId))
  .orderBy(desc(asignacionesPedido.fechaAsignacion));
}

export async function getAsignacionByPedido(pedidoId: number, organizationId: number) {
  return await db.select()
    .from(asignacionesPedido)
    .innerJoin(pedidos, eq(asignacionesPedido.pedidoId, pedidos.id))
    .where(and(
      eq(asignacionesPedido.pedidoId, pedidoId),
      eq(pedidos.organizationId, organizationId)
    ))
    .limit(1);
}

export async function createAsignacionPedido(asignacionData: typeof asignacionesPedido.$inferInsert) {
  const result = await db.insert(asignacionesPedido).values(asignacionData).$returningId();
  return { id: result[0].id, ...asignacionData };
}

export async function updateAsignacionPedido(id: number, asignacionData: Partial<typeof asignacionesPedido.$inferInsert>, organizationId: number) {
  return await db.update(asignacionesPedido)
    .set(asignacionData)
    .where(and(
      eq(asignacionesPedido.id, id),
      sql`EXISTS (SELECT 1 FROM ${pedidos} WHERE ${pedidos.id} = ${asignacionesPedido.pedidoId} AND ${pedidos.organizationId} = ${organizationId})`
    ));
}

export async function deleteAsignacionPedido(id: number, organizationId: number) {
  return await db.delete(asignacionesPedido)
    .where(and(
      eq(asignacionesPedido.id, id),
      sql`EXISTS (SELECT 1 FROM ${pedidos} WHERE ${pedidos.id} = ${asignacionesPedido.pedidoId} AND ${pedidos.organizationId} = ${organizationId})`
    ));
}

// Funciones para Usuarios
export async function getUsersByOrganization(organizationId: number) {
  return await db.select({
    id: users.id,
    firebaseUid: users.firebaseUid,
    email: users.email,
    emailVerified: users.emailVerified,
    phoneNumber: users.phoneNumber,
    displayName: users.displayName,
    photoURL: users.photoURL,
    providerId: users.providerId,
    role: users.role,
    isActive: users.isActive,
    organizationId: users.organizationId,
    lastLoginAt: users.lastLoginAt,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt
  })
  .from(users)
  .where(eq(users.organizationId, organizationId))
  .orderBy(asc(users.displayName));
}

export async function getUserById(id: number, organizationId: number) {
  return await db.select()
    .from(users)
    .where(and(eq(users.id, id), eq(users.organizationId, organizationId)))
    .limit(1);
}

export async function getUserByEmail(email: string) {
  return await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
}

export async function createUser(userData: Omit<typeof users.$inferInsert, 'organizationId'>, organizationId: number) {
  return await db.insert(users).values({
    ...userData,
    organizationId
  });
}

export async function updateUser(id: number, userData: Partial<typeof users.$inferInsert>, organizationId: number) {
  return await db.update(users)
    .set(userData)
    .where(and(eq(users.id, id), eq(users.organizationId, organizationId)));
}

export async function deleteUser(id: number, organizationId: number) {
  return await db.delete(users)
    .where(and(eq(users.id, id), eq(users.organizationId, organizationId)));
}

export async function updateUserLastAccess(id: number) {
  return await db.update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, id));
}

/**
 * funcion por definir
 
// Funciones para Permisos de Usuario
export async function getUserPermissions(organizationId: number) {
  return await db.select()
    .from(userPermitions);
}
*/

export async function createUserPermissions(permissionsData: typeof userPermitions.$inferInsert) {
  return await db.insert(userPermitions).values(permissionsData);
}

export async function updateUserPermissions(permissionId: number, permissionsData: Partial<typeof userPermitions.$inferInsert>) {
  return await db.update(userPermitions)
    .set(permissionsData)
    .where(eq(userPermitions.id, permissionId));
}

// Funciones adicionales para asignaciones
export async function getAsignacionesByPedido(pedidoId: number) {
  return await db.select().from(asignacionesPedido).where(eq(asignacionesPedido.pedidoId, pedidoId));
}

export async function getAsignacionesByRepartidor(repartidorId: number) {
  return await db.select().from(asignacionesPedido).where(eq(asignacionesPedido.repartidorId, repartidorId));
}

// Funciones de búsqueda avanzada
export async function searchClientes(searchTerm: string, organizationId: number) {
  return await db.select()
    .from(clientes)
    .where(and(
      eq(clientes.organizationId, organizationId),
      sql`(${clientes.nombre} LIKE ${`%${searchTerm}%`} OR ${clientes.email} LIKE ${`%${searchTerm}%`} OR ${clientes.telefono} LIKE ${`%${searchTerm}%`})`
    ))
    .orderBy(asc(clientes.nombre));
}

export async function searchProductos(searchTerm: string, organizationId: number) {
  return await db.select()
    .from(productos)
    .where(and(
      eq(productos.organizationId, organizationId),
      sql`(${productos.nombre} LIKE ${`%${searchTerm}%`} OR ${productos.descripcion} LIKE ${`%${searchTerm}%`})`
    ))
    .orderBy(asc(productos.nombre));
}

export async function searchRepartidores(searchTerm: string, organizationId: number) {
  return await db.select()
    .from(repartidores)
    .where(and(
      eq(repartidores.organizationId, organizationId),
      sql`(${repartidores.nombre} LIKE ${`%${searchTerm}%`} OR ${repartidores.telefono} LIKE ${`%${searchTerm}%`})`
    ))
    .orderBy(asc(repartidores.nombre));
}

// Funciones de estadísticas
export async function getOrganizationStats(organizationId: number) {
  const [clientesCount] = await db.select({ count: sql<number>`count(*)` })
    .from(clientes)
    .where(eq(clientes.organizationId, organizationId));

  const [productosCount] = await db.select({ count: sql<number>`count(*)` })
    .from(productos)
    .where(eq(productos.organizationId, organizationId));

  const [repartidoresCount] = await db.select({ count: sql<number>`count(*)` })
    .from(repartidores)
    .where(eq(repartidores.organizationId, organizationId));

  const [pedidosCount] = await db.select({ count: sql<number>`count(*)` })
    .from(pedidos)
    .where(eq(pedidos.organizationId, organizationId));

  const [usersCount] = await db.select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.organizationId, organizationId));

  return {
    clientes: clientesCount.count,
    productos: productosCount.count,
    repartidores: repartidoresCount.count,
    pedidos: pedidosCount.count,
    usuarios: usersCount.count
  };
}

// Función para obtener pedidos con detalles completos
export async function getPedidoCompleto(pedidoId: number, organizationId: number) {
  const pedido = await db.select({
    id: pedidos.id,
    clienteId: pedidos.clienteId,
    estado: pedidos.estado,
    total: pedidos.total,
    createdAt: pedidos.createdAt,
    fechaEntrega: pedidos.fechaEntrega,
    direccionEntrega: pedidos.direccionEntrega,
    cliente: {
      id: clientes.id,
      nombre: clientes.nombre,
      email: clientes.email,
      telefono: clientes.telefono,
      direccion: clientes.direccion
    }
  })
  .from(pedidos)
  .innerJoin(clientes, eq(pedidos.clienteId, clientes.id))
  .where(and(
    eq(pedidos.id, pedidoId),
    eq(pedidos.organizationId, organizationId)
  ))
  .limit(1);

  if (pedido.length === 0) return null;

  const detalles = await getDetallesPedidoByPedido(pedidoId, organizationId);
  const asignacion = await getAsignacionByPedido(pedidoId, organizationId);

  return {
    ...pedido[0],
    detalles,
    asignacion: asignacion.length > 0 ? asignacion[0] : null
  };
}

// Función de transacción para crear pedido completo
export async function createPedidoCompleto(
  pedidoData: Omit<typeof pedidos.$inferInsert, 'organizationId'>,
  detallesData: Omit<typeof detallesPedido.$inferInsert, 'pedidoId'>[],
  organizationId: number
) {
  return await db.transaction(async (tx) => {
    // Crear el pedido
    const [pedidoResult] = await tx.insert(pedidos).values({
      ...pedidoData,
      organizationId
    });
    
    const pedidoId = pedidoResult.insertId;

    // Crear los detalles del pedido
    if (detallesData.length > 0) {
      await tx.insert(detallesPedido).values(
        detallesData.map(detalle => ({
          ...detalle,
          pedidoId
        }))
      );
    }

    return { pedidoId };
  });
}