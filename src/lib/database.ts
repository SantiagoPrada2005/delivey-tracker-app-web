import { db } from '@/db';
import { clientes, productos, pedidos, repartidores, organizations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

export async function getOrganizations() {
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