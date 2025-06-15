/**
 * @fileoverview API route para gestionar clientes
 * @version 1.0.0
 * @author Claude AI
 * @date 2025-05-15
 * 
 * @description
 * Esta API route permite realizar operaciones CRUD sobre clientes:
 * - Listar todos los clientes de una organización
 * - Obtener un cliente específico
 * - Crear nuevos clientes
 * - Actualizar clientes existentes
 * - Eliminar clientes
 * 
 * Todas las operaciones verifican la autenticación del usuario y filtran
 * los resultados según la organización a la que pertenece el usuario.
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/utils';
import {
  getClientesByOrganization,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
} from '@/lib/database';

/**
 * GET /api/clientes
 * Obtiene la lista de clientes de la organización del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación con Firebase
    const authResult = await requireAuth(request);
    
    // Si authResult es un NextResponse, significa que hubo un error de autenticación
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { user } = authResult;
    
    if (!user.organizationId) {
      return Response.json(
        { 
          error: 'Usuario sin organización asignada',
          code: 'NO_ORGANIZATION'
        },
        { status: 403 }
      );
    }

    // Verificar si se está solicitando un cliente específico por ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Obtener un cliente específico
      const cliente = await getClienteById(Number(id), Number(user.organizationId));
      
      if (!cliente || cliente.length === 0) {
        return Response.json(
          { 
            error: 'Cliente no encontrado',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      return Response.json({
        success: true,
        cliente: cliente[0]
      });
    }
    
    // Obtener todos los clientes de la organización
    const clientes = await getClientesByOrganization(Number(user.organizationId));
    
    return Response.json({
      success: true,
      clientes,
      total: clientes.length
    });
    
  } catch (error) {
    console.error('[API Clientes] Error en GET /api/clientes:', error);
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
 * POST /api/clientes
 * Crea un nuevo cliente en la organización del usuario
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación con Firebase
    const authResult = await requireAuth(request);
    
    // Si authResult es un NextResponse, significa que hubo un error de autenticación
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { user } = authResult;
    
    if (!user.organizationId) {
      return Response.json(
        { 
          error: 'Usuario sin organización asignada',
          code: 'NO_ORGANIZATION'
        },
        { status: 403 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const clienteData = await request.json();
    
    // Validar datos requeridos
    if (!clienteData.nombre || !clienteData.telefono) {
      return Response.json(
        { 
          error: 'Faltan campos requeridos (nombre, telefono)',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Crear el cliente
    const result = await createCliente(clienteData, Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Cliente creado exitosamente',
      id: result.id
    }, { status: 201 });
    
  } catch (error) {
    console.error('[API Clientes] Error en POST /api/clientes:', error);
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
 * PUT /api/clientes
 * Actualiza un cliente existente
 */
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación con Firebase
    const authResult = await requireAuth(request);
    
    // Si authResult es un NextResponse, significa que hubo un error de autenticación
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { user } = authResult;
    
    if (!user.organizationId) {
      return Response.json(
        { 
          error: 'Usuario sin organización asignada',
          code: 'NO_ORGANIZATION'
        },
        { status: 403 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const clienteData = await request.json();
    
    // Validar ID del cliente
    if (!clienteData.id) {
      return Response.json(
        { 
          error: 'Se requiere el ID del cliente',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Verificar que el cliente exista y pertenezca a la organización
    const cliente = await getClienteById(clienteData.id, Number(user.organizationId));
    
    if (!cliente || cliente.length === 0) {
      return Response.json(
        { 
          error: 'Cliente no encontrado o no pertenece a su organización',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Eliminar el ID del objeto de datos para actualizar
    const { id, ...updateData } = clienteData;
    
    // Actualizar el cliente
    await updateCliente(id, updateData, Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Cliente actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('[API Clientes] Error en PUT /api/clientes:', error);
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
 * DELETE /api/clientes
 * Elimina un cliente existente
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación con Firebase
    const authResult = await requireAuth(request);
    
    // Si authResult es un NextResponse, significa que hubo un error de autenticación
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { user } = authResult;
    
    if (!user.organizationId) {
      return Response.json(
        { 
          error: 'Usuario sin organización asignada',
          code: 'NO_ORGANIZATION'
        },
        { status: 403 }
      );
    }

    // Obtener ID del cliente a eliminar
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json(
        { 
          error: 'Se requiere el ID del cliente',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Verificar que el cliente exista y pertenezca a la organización
    const cliente = await getClienteById(Number(id), Number(user.organizationId));
    
    if (!cliente || cliente.length === 0) {
      return Response.json(
        { 
          error: 'Cliente no encontrado o no pertenece a su organización',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Eliminar el cliente
    await deleteCliente(Number(id), Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('[API Clientes] Error en DELETE /api/clientes:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}