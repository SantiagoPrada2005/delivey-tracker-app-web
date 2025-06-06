/**
 * @fileoverview API route para gestionar productos
 * @version 1.0.0
 * @author Claude AI
 * @date 2025-05-15
 * 
 * @description
 * Esta API route permite realizar operaciones CRUD sobre productos:
 * - Listar todos los productos de una organización
 * - Obtener un producto específico
 * - Crear nuevos productos
 * - Actualizar productos existentes
 * - Eliminar productos
 * 
 * Todas las operaciones verifican la autenticación del usuario y filtran
 * los resultados según la organización a la que pertenece el usuario.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import {
  getProductosByOrganization,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} from '@/lib/database';

/**
 * GET /api/productos
 * Obtiene la lista de productos de la organización del usuario
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

    // Verificar si se está solicitando un producto específico por ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Obtener un producto específico
      const producto = await getProductoById(Number(id), Number(user.organizationId));
      
      if (!producto || producto.length === 0) {
        return Response.json(
          { 
            error: 'Producto no encontrado',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      return Response.json({
        success: true,
        producto: producto[0]
      });
    }
    
    // Obtener todos los productos de la organización
    const productos = await getProductosByOrganization(Number(user.organizationId));
    
    return Response.json({
      success: true,
      productos,
      total: productos.length
    });
    
  } catch (error) {
    console.error('[API Productos] Error en GET /api/productos:', error);
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
 * POST /api/productos
 * Crea un nuevo producto en la organización del usuario
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
    const productoData = await request.json();
    
    // Validar datos requeridos
    if (!productoData.nombre || !productoData.precio) {
      return Response.json(
        { 
          error: 'Faltan campos requeridos (nombre, precio)',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Validar que el precio sea un número positivo
    if (isNaN(productoData.precio) || productoData.precio <= 0) {
      return Response.json(
        { 
          error: 'El precio debe ser un número positivo',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Crear el producto
    const result = await createProducto(productoData, Number(user.organizationId));
    
    return NextResponse.json({
        success: true,
        message: 'Producto creado exitosamente',
        id: result.id
      }, { status: 201 });
    
  } catch (error) {
    console.error('[API Productos] Error en POST /api/productos:', error);
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
 * PUT /api/productos
 * Actualiza un producto existente
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
    const productoData = await request.json();
    
    // Validar ID del producto
    if (!productoData.id) {
      return Response.json(
        { 
          error: 'Se requiere el ID del producto',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Validar precio si se está actualizando
    if (productoData.precio !== undefined && (isNaN(productoData.precio) || productoData.precio <= 0)) {
      return Response.json(
        { 
          error: 'El precio debe ser un número positivo',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Verificar que el producto exista y pertenezca a la organización
    const producto = await getProductoById(productoData.id, Number(user.organizationId));
    
    if (!producto || producto.length === 0) {
      return Response.json(
        { 
          error: 'Producto no encontrado o no pertenece a su organización',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Eliminar el ID del objeto de datos para actualizar
    const { id, ...updateData } = productoData;
    
    // Actualizar el producto
    await updateProducto(id, updateData, Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('[API Productos] Error en PUT /api/productos:', error);
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
 * DELETE /api/productos
 * Elimina un producto existente
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

    // Obtener ID del producto a eliminar
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json(
        { 
          error: 'Se requiere el ID del producto',
          code: 'INVALID_DATA'
        },
        { status: 400 }
      );
    }
    
    // Verificar que el producto exista y pertenezca a la organización
    const producto = await getProductoById(Number(id), Number(user.organizationId));
    
    if (!producto || producto.length === 0) {
      return Response.json(
        { 
          error: 'Producto no encontrado o no pertenece a su organización',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Eliminar el producto
    await deleteProducto(Number(id), Number(user.organizationId));
    
    return Response.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('[API Productos] Error en DELETE /api/productos:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}