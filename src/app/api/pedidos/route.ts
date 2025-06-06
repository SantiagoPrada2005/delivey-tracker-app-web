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

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
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
    const user = await getAuthenticatedUser(request);
    
    if (!user || !user.organizationId) {
      return Response.json(
        { 
          error: 'Usuario no autenticado o sin organización asignada',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
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
    const user = await getAuthenticatedUser(request);
    
    if (!user || !user.organizationId) {
      return Response.json(
        { 
          error: 'Usuario no autenticado o sin organización asignada',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const pedidoData = await request.json();
    
    // Validar datos requeridos del pedido
    if (!pedidoData.clienteId || !pedidoData.total || !pedidoData.detalles || !Array.isArray(pedidoData.detalles)) {
      return Response.json(
        { 
          error: 'Faltan campos requeridos (clienteId, total, detalles)',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Validar que haya al menos un detalle
    if (pedidoData.detalles.length === 0) {
      return Response.json(
        { 
          error: 'El pedido debe tener al menos un detalle',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Validar cada detalle del pedido
    for (const detalle of pedidoData.detalles) {
      if (!detalle.productoId || !detalle.cantidad || !detalle.precioUnitario) {
        return Response.json(
          { 
            error: 'Cada detalle debe tener productoId, cantidad y precioUnitario',
            code: 'INVALID_DATA'
          },
          { status: 400 }
        );
      }
      
      if (detalle.cantidad <= 0 || detalle.precioUnitario <= 0) {
        return Response.json(
          { 
            error: 'La cantidad y precio unitario deben ser números positivos',
            code: 'INVALID_DATA'
          },
          { status: 400 }
        );
      }
    }
    
    // Separar los detalles del pedido
    const { detalles, ...pedidoSinDetalles } = pedidoData;
    
    // Crear el pedido completo
    const result = await createPedidoCompleto(pedidoSinDetalles, detalles, Number(user.organizationId));
    
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
    const user = await getAuthenticatedUser(request);
    
    if (!user || !user.organizationId) {
      return Response.json(
        { 
          error: 'Usuario no autenticado o sin organización asignada',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
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
    const user = await getAuthenticatedUser(request);
    
    if (!user || !user.organizationId) {
      return Response.json(
        { 
          error: 'Usuario no autenticado o sin organización asignada',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
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