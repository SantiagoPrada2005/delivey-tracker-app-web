/**
 * @fileoverview API route para gestionar repartidores (delivery personnel)
 * @version 1.0.0
 * @author Claude AI
 * @date 2025-05-15
 * 
 * @description
 * Esta API route permite realizar operaciones CRUD sobre repartidores:
 * - Listar todos los repartidores de una organización
 * - Obtener un repartidor específico
 * - Crear nuevos repartidores
 * - Actualizar repartidores existentes
 * - Eliminar repartidores
 * 
 * Todas las operaciones verifican la autenticación del usuario y filtran
 * los resultados según la organización a la que pertenece el usuario.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import {
  getRepartidoresByOrganization,
  getRepartidorById,
  createRepartidor,
  updateRepartidor,
  deleteRepartidor
} from '@/lib/database';

/**
 * GET /api/repartidores
 * Obtiene la lista de repartidores de la organización del usuario
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

    // Verificar si se está solicitando un repartidor específico por ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Obtener un repartidor específico
      const repartidor = await getRepartidorById(Number(id), Number(user.organizationId));
      
      if (!repartidor || repartidor.length === 0) {
        return Response.json(
          { 
            error: 'Repartidor no encontrado',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      return Response.json({
        success: true,
        repartidor: repartidor[0]
      });
    }
    
    // Obtener todos los repartidores de la organización
    const repartidores = await getRepartidoresByOrganization(Number(user.organizationId));
    
    return Response.json({
      success: true,
      repartidores,
      total: repartidores.length
    });
    
  } catch (error) {
    console.error('[API Repartidores] Error en GET /api/repartidores:', error);
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
 * POST /api/repartidores
 * Crea un nuevo repartidor en la organización del usuario
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
    const repartidorData = await request.json();
    
    // Validar datos requeridos
    if (!repartidorData.nombre || !repartidorData.apellido || !repartidorData.telefono) {
      return Response.json(
        { 
          error: 'Faltan campos requeridos (nombre, apellido, telefono)',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Crear el repartidor
    const result = await createRepartidor(repartidorData, Number(user.organizationId));
    
    return NextResponse.json({
        success: true,
        message: 'Repartidor creado exitosamente',
        id: result.id
      }, { status: 201 });
    
  } catch (error) {
    console.error('[API Repartidores] Error en POST /api/repartidores:', error);
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
 * PUT /api/repartidores
 * Actualiza un repartidor existente
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
    const repartidorData = await request.json();
    
    // Validar ID del repartidor
    if (!repartidorData.id) {
      return Response.json(
        { 
          error: 'Se requiere el ID del repartidor',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Verificar que el repartidor exista y pertenezca a la organización
    const repartidor = await getRepartidorById(repartidorData.id, Number(user.organizationId));
    
    if (!repartidor || repartidor.length === 0) {
      return Response.json(
        { 
          error: 'Repartidor no encontrado o no pertenece a su organización',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Eliminar el ID del objeto de datos para actualizar
    const { id, ...updateData } = repartidorData;
    
    // Actualizar el repartidor
    await updateRepartidor(id, updateData, Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Repartidor actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('[API Repartidores] Error en PUT /api/repartidores:', error);
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
 * DELETE /api/repartidores
 * Elimina un repartidor existente
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

    // Obtener ID del repartidor a eliminar
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json(
        { 
          error: 'Se requiere el ID del repartidor',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Verificar que el repartidor exista y pertenezca a la organización
    const repartidor = await getRepartidorById(Number(id), Number(user.organizationId));
    
    if (!repartidor || repartidor.length === 0) {
      return Response.json(
        { 
          error: 'Repartidor no encontrado o no pertenece a su organización',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Eliminar el repartidor
    await deleteRepartidor(Number(id), Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Repartidor eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('[API Repartidores] Error en DELETE /api/repartidores:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}