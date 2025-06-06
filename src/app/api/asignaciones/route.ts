/**
 * @fileoverview API route para gestionar asignaciones de pedidos
 * @version 1.0.0
 * @author Claude AI
 * @date 2025-05-15
 * 
 * @description
 * Esta API route permite realizar operaciones CRUD sobre asignaciones de pedidos:
 * - Listar todas las asignaciones de una organización
 * - Obtener una asignación específica
 * - Crear nuevas asignaciones de pedidos a repartidores
 * - Actualizar el estado de asignaciones existentes
 * - Eliminar asignaciones
 * 
 * Todas las operaciones verifican la autenticación del usuario y filtran
 * los resultados según la organización a la que pertenece el usuario.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import {
  getAsignacionesByOrganization,
  getAsignacionByPedido,
  createAsignacionPedido,
  updateAsignacionPedido,
  deleteAsignacionPedido
} from '@/lib/database';

/**
 * GET /api/asignaciones
 * Obtiene la lista de asignaciones de la organización del usuario
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

    // Verificar si se está solicitando una asignación específica por pedido ID
    const { searchParams } = new URL(request.url);
    const pedidoId = searchParams.get('pedidoId');

    if (pedidoId) {
      // Obtener asignación por pedido específico
      const asignacion = await getAsignacionByPedido(Number(pedidoId), Number(user.organizationId));
      
      if (!asignacion || asignacion.length === 0) {
        return Response.json(
          { 
            error: 'Asignación no encontrada para este pedido',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      return Response.json({
        success: true,
        asignacion: asignacion[0]
      });
    }
    
    // Obtener todas las asignaciones de la organización
    const asignaciones = await getAsignacionesByOrganization(Number(user.organizationId));
    
    return Response.json({
      success: true,
      asignaciones,
      total: asignaciones.length
    });
    
  } catch (error) {
    console.error('[API Asignaciones] Error en GET /api/asignaciones:', error);
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
 * POST /api/asignaciones
 * Crea una nueva asignación de pedido a repartidor
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
    const asignacionData = await request.json();
    
    // Validar datos requeridos
    if (!asignacionData.pedidoId || !asignacionData.repartidorId) {
      return Response.json(
        { 
          error: 'Faltan campos requeridos (pedidoId, repartidorId)',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Validar estado si se proporciona
    const estadosValidos = ['asignado', 'en_camino', 'entregado', 'cancelado'];
    if (asignacionData.estado && !estadosValidos.includes(asignacionData.estado)) {
      return Response.json(
        { 
          error: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`,
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Verificar si ya existe una asignación para este pedido
    const asignacionExistente = await getAsignacionByPedido(asignacionData.pedidoId, Number(user.organizationId));
    
    if (asignacionExistente && asignacionExistente.length > 0) {
      return Response.json(
        { 
          error: 'Ya existe una asignación para este pedido',
          code: 'ASSIGNMENT_EXISTS'
        },
        { status: 409 }
      );
    }
    
    // Crear la asignación
    const result = await createAsignacionPedido(asignacionData);
    
    return NextResponse.json({
        success: true,
        message: 'Asignación creada exitosamente',
        id: result.id
      }, { status: 201 });
    
  } catch (error) {
    console.error('[API Asignaciones] Error en POST /api/asignaciones:', error);
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
 * PUT /api/asignaciones
 * Actualiza una asignación existente (principalmente el estado)
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
    const asignacionData = await request.json();
    
    // Validar ID de la asignación o pedidoId
    if (!asignacionData.id && !asignacionData.pedidoId) {
      return Response.json(
        { 
          error: 'Se requiere el ID de la asignación o el pedidoId',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Validar estado si se está actualizando
    const estadosValidos = ['asignado', 'en_camino', 'entregado', 'cancelado'];
    if (asignacionData.estado && !estadosValidos.includes(asignacionData.estado)) {
      return Response.json(
        { 
          error: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`,
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    let asignacionId = asignacionData.id;
    
    // Si no se proporciona ID pero sí pedidoId, buscar la asignación
    if (!asignacionId && asignacionData.pedidoId) {
      const asignacion = await getAsignacionByPedido(asignacionData.pedidoId, Number(user.organizationId));
      
      if (!asignacion || asignacion.length === 0) {
        return Response.json(
          { 
            error: 'Asignación no encontrada para este pedido',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      asignacionId = asignacion[0].asignaciones_pedido.id;
    }
    
    // Eliminar campos que no se deben actualizar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, pedidoId, ...updateData } = asignacionData;
    
    // Actualizar la asignación
    await updateAsignacionPedido(asignacionId, updateData, Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Asignación actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('[API Asignaciones] Error en PUT /api/asignaciones:', error);
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
 * DELETE /api/asignaciones
 * Elimina una asignación existente
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

    // Obtener ID de la asignación o pedidoId a eliminar
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const pedidoId = searchParams.get('pedidoId');
    
    if (!id && !pedidoId) {
      return Response.json(
        { 
          error: 'Se requiere el ID de la asignación o el pedidoId',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    let asignacionId = id ? Number(id) : null;
    
    // Si se proporciona pedidoId pero no ID, buscar la asignación
    if (!asignacionId && pedidoId) {
      const asignacion = await getAsignacionByPedido(Number(pedidoId), Number(user.organizationId));
      
      if (!asignacion || asignacion.length === 0) {
        return Response.json(
          { 
            error: 'Asignación no encontrada para este pedido',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      asignacionId = asignacion[0].asignaciones_pedido.id;
    }
    
    // Eliminar la asignación
    await deleteAsignacionPedido(asignacionId!, Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Asignación eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('[API Asignaciones] Error en DELETE /api/asignaciones:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}