/**
 * @fileoverview API route para gestionar pedidos
 * @version 1.0.0
 * @author Claude AI
 * @date 2025-05-15
 * 
 * @description
 * Esta API route permite realizar operaciones CRUD sobre pedidos:
 * - Listar todos los pedidos de una organización
 * - Obtener un pedido específico con detalles completos
 * - Crear nuevos pedidos con detalles
 * - Actualizar pedidos existentes
 * - Eliminar pedidos
 * 
 * Todas las operaciones verifican la autenticación del usuario y filtran
 * los resultados según la organización a la que pertenece el usuario.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/utils';
import { db } from '@/db';
import { clientes, productos, repartidores } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import {
  getPedidosByOrganization,
  getPedidoById,
  getPedidoCompleto,
  createPedidoCompleto,
  updatePedido,
  deletePedido
} from '@/lib/database';

/**
 * GET /api/pedidos
 * Obtiene la lista de pedidos de la organización del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const authResult = await requireAuth(request);
    
    // Si requireAuth retorna NextResponse, es un error de autenticación
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    
    // Verificar que el usuario tenga organización asignada
    if (!user.organizationId) {
      return NextResponse.json(
        { 
          error: 'Usuario sin organización asignada',
          code: 'NO_ORGANIZATION'
        },
        { status: 403 }
      );
    }

    // Verificar si se está solicitando un pedido específico por ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const completo = searchParams.get('completo') === 'true';

    if (id) {
      if (completo) {
        // Obtener un pedido completo con detalles y asignaciones
        const pedido = await getPedidoCompleto(Number(id), Number(user.organizationId));
        
        if (!pedido) {
          return Response.json(
            { 
              error: 'Pedido no encontrado',
              code: 'NOT_FOUND'
            },
            { status: 404 }
          );
        }
        
        return Response.json({
          success: true,
          pedido
        });
      } else {
        // Obtener un pedido básico
        const pedido = await getPedidoById(Number(id), Number(user.organizationId));
        
        if (!pedido || pedido.length === 0) {
          return Response.json(
            { 
              error: 'Pedido no encontrado',
              code: 'NOT_FOUND'
            },
            { status: 404 }
          );
        }
        
        return Response.json({
          success: true,
          pedido: pedido[0]
        });
      }
    }
    
    // Obtener todos los pedidos de la organización
    const pedidos = await getPedidosByOrganization(Number(user.organizationId));
    
    return Response.json({
      success: true,
      pedidos,
      total: pedidos.length
    });
    
  } catch (error) {
    console.error('[API Pedidos] Error en GET /api/pedidos:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pedidos
 * Crea un nuevo pedido completo con detalles en la organización del usuario
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const authResult = await requireAuth(request);
    
    // Si requireAuth retorna NextResponse, es un error de autenticación
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    
    // Verificar que el usuario tenga organización asignada
    if (!user.organizationId) {
      return NextResponse.json(
        { 
          error: 'Usuario sin organización asignada',
          code: 'NO_ORGANIZATION'
        },
        { status: 403 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const pedidoData = await request.json();
    const { clienteId, direccionEntrega, fechaEntrega, estado, total, detalles, repartidorId } = pedidoData;
    
    // Validar datos requeridos del pedido
    if (!clienteId || !direccionEntrega || !total || !detalles || !Array.isArray(detalles)) {
      return Response.json(
        { 
          error: 'Faltan campos requeridos (clienteId, direccionEntrega, total, detalles)',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Validar que haya al menos un detalle
    if (detalles.length === 0) {
      return Response.json(
        { 
          error: 'El pedido debe tener al menos un detalle',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Validar que el total sea un número positivo
    if (!total || total <= 0) {
      return Response.json(
        { 
          error: 'El total del pedido debe ser mayor a 0',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Verificar que el cliente pertenece a la organización
    const cliente = await db.select()
      .from(clientes)
      .where(and(
        eq(clientes.id, clienteId),
        eq(clientes.organizationId, Number(user.organizationId))
      ))
      .limit(1);

    if (cliente.length === 0) {
      return Response.json(
        { 
          error: 'Cliente no encontrado o no pertenece a su organización',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Validar productos y stock
    const productosIds = detalles.map((d: { productoId: number }) => d.productoId);
    const productosEncontrados = await db.select()
      .from(productos)
      .where(and(
        sql`${productos.id} IN (${productosIds.join(',')})`,
        eq(productos.organizationId, Number(user.organizationId))
      ));

    if (productosEncontrados.length !== productosIds.length) {
      return Response.json(
        { 
          error: 'Uno o más productos no existen o no pertenecen a su organización',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Validar stock disponible
    const stockErrors = [];
    for (const detalle of detalles) {
      const producto = productosEncontrados.find(p => p.id === detalle.productoId);
      if (producto && producto.stock < detalle.cantidad) {
        stockErrors.push({
          producto: producto.nombre,
          stockDisponible: producto.stock,
          cantidadSolicitada: detalle.cantidad
        });
      }
    }

    if (stockErrors.length > 0) {
      return Response.json(
        { 
          error: 'Stock insuficiente para algunos productos',
          code: 'INSUFFICIENT_STOCK',
          stockErrors
        },
        { status: 400 }
      );
    }
    
    // Validar repartidor si está asignado
    if (repartidorId) {
      const repartidor = await db.select()
        .from(repartidores)
        .where(and(
          eq(repartidores.id, repartidorId),
          eq(repartidores.organizationId, Number(user.organizationId))
        ))
        .limit(1);

      if (repartidor.length === 0) {
        return Response.json(
          { 
            error: 'Repartidor no encontrado o no pertenece a su organización',
            code: 'NOT_FOUND'
          },
          { status: 400 }
        );
      }

      if (!repartidor[0].disponible) {
        return Response.json(
          { 
            error: 'El repartidor seleccionado no está disponible',
            code: 'REPARTIDOR_NOT_AVAILABLE'
          },
          { status: 400 }
        );
      }
    }
    
    // Calcular y validar el total
    let totalCalculado = 0;
    for (const detalle of detalles) {
      const producto = productosEncontrados.find(p => p.id === detalle.productoId);
      if (producto) {
        const precioUnitario = detalle.precioUnitario || parseFloat(producto.precio);
        totalCalculado += detalle.cantidad * precioUnitario;
      }
    }

    // Permitir una pequeña diferencia por redondeo
    if (Math.abs(total - totalCalculado) > 0.01) {
      return Response.json(
        { 
          error: 'El total del pedido no coincide con el cálculo de los productos',
          code: 'INVALID_TOTAL',
          totalCalculado,
          totalEnviado: total
        },
        { status: 400 }
      );
    }
    
    // Validar cada detalle del pedido
    for (const detalle of detalles as Array<{ productoId: number; cantidad: number; precioUnitario?: number; notaProducto?: string }>) {
      if (!detalle.productoId || !detalle.cantidad) {
        return Response.json(
          { 
            error: 'Cada detalle debe tener productoId y cantidad',
            code: 'INVALID_DATA'
          },
          { status: 400 }
        );
      }
      
      if (detalle.cantidad <= 0) {
        return Response.json(
          { 
            error: 'La cantidad debe ser un número positivo',
            code: 'INVALID_DATA'
          },
          { status: 400 }
        );
      }
    }
    
    // Crear el pedido completo con detalles mejorados
    const detallesConPrecios = detalles.map((detalle: { productoId: number; cantidad: number; precioUnitario?: number; notaProducto?: string }) => {
      const producto = productosEncontrados.find(p => p.id === detalle.productoId);
      const precioUnitario = detalle.precioUnitario || parseFloat(producto?.precio || '0');
      const subtotal = precioUnitario * detalle.cantidad;
      return {
        ...detalle,
        precioUnitario: precioUnitario.toString(),
        subtotal: subtotal.toString()
      };
    });
    
    const pedidoCompleto = {
      clienteId,
      direccionEntrega,
      fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
      estado: estado || 'pendiente',
      total,
      repartidorId: repartidorId || null
    };
    
    // Crear el pedido completo
    const result = await createPedidoCompleto(pedidoCompleto, detallesConPrecios, Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Pedido creado exitosamente',
      id: result.pedidoId
    }, { status: 201 });
    
  } catch (error) {
    console.error('[API Pedidos] Error en POST /api/pedidos:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pedidos
 * Actualiza un pedido existente (solo campos básicos, no detalles)
 */
export async function PUT(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const authResult = await requireAuth(request);
    
    // Si requireAuth retorna NextResponse, es un error de autenticación
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    
    // Verificar que el usuario tenga organización asignada
    if (!user.organizationId) {
      return NextResponse.json(
        { 
          error: 'Usuario sin organización asignada',
          code: 'NO_ORGANIZATION'
        },
        { status: 403 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const pedidoData = await request.json();
    
    // Validar ID del pedido
    if (!pedidoData.id) {
      return Response.json(
        { 
          error: 'Se requiere el ID del pedido',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Verificar que el pedido exista y pertenezca a la organización
    const pedido = await getPedidoById(pedidoData.id, Number(user.organizationId));
    
    if (!pedido || pedido.length === 0) {
      return Response.json(
        { 
          error: 'Pedido no encontrado o no pertenece a su organización',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Eliminar el ID del objeto de datos para actualizar
    const { id, ...updateData } = pedidoData;
    
    // Validar total si se está actualizando
    if (updateData.total !== undefined && (isNaN(updateData.total) || updateData.total <= 0)) {
      return Response.json(
        { 
          error: 'El total debe ser un número positivo',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Actualizar el pedido
    await updatePedido(id, updateData, Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Pedido actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('[API Pedidos] Error en PUT /api/pedidos:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pedidos
 * Elimina un pedido existente
 */
export async function DELETE(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const authResult = await requireAuth(request);
    
    // Si requireAuth retorna NextResponse, es un error de autenticación
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    
    // Verificar que el usuario tenga organización asignada
    if (!user.organizationId) {
      return NextResponse.json(
        { 
          error: 'Usuario sin organización asignada',
          code: 'NO_ORGANIZATION'
        },
        { status: 403 }
      );
    }

    // Obtener ID del pedido a eliminar
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json(
        { 
          error: 'Se requiere el ID del pedido',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Verificar que el pedido exista y pertenezca a la organización
    const pedido = await getPedidoById(Number(id), Number(user.organizationId));
    
    if (!pedido || pedido.length === 0) {
      return Response.json(
        { 
          error: 'Pedido no encontrado o no pertenece a su organización',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Eliminar el pedido (esto también eliminará los detalles por CASCADE)
    await deletePedido(Number(id), Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Pedido eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('[API Pedidos] Error en DELETE /api/pedidos:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}