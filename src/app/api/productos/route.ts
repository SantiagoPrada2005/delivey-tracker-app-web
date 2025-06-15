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

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/utils';
import { productos } from '@/db/schema';
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
        { status: 400 }
      );
    }

    // Verificar si se está solicitando un producto específico por ID
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (productId) {
      // Obtener producto específico
      const producto = await getProductoById(parseInt(productId), user.organizationId);
      
      if (!producto || producto.length === 0) {
        return Response.json(
          { 
            error: 'Producto no encontrado',
            code: 'PRODUCT_NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      return Response.json({
        success: true,
        data: producto[0]
      });
    }

    // Obtener todos los productos de la organización
    const productos = await getProductosByOrganization(user.organizationId);
    
    return Response.json({
      success: true,
      data: productos
    });
    
  } catch (error) {
    console.error('Error en GET /api/productos:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/productos
 * Crea un nuevo producto
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(request);
    
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
        { status: 400 }
      );
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Validar campos requeridos
    if (!body.nombre || !body.precio) {
      return Response.json(
        { 
          error: 'Nombre y precio son campos requeridos',
          code: 'MISSING_REQUIRED_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validar que el precio sea un número positivo
    const precio = parseFloat(body.precio);
    if (isNaN(precio) || precio < 0) {
      return Response.json(
        { 
          error: 'El precio debe ser un número positivo',
          code: 'INVALID_PRICE'
        },
        { status: 400 }
      );
    }

    // Validar que el stock sea un número entero no negativo
    const stock = parseInt(body.stock) || 0;
    if (stock < 0) {
      return Response.json(
        { 
          error: 'El stock debe ser un número no negativo',
          code: 'INVALID_STOCK'
        },
        { status: 400 }
      );
    }

    // Crear el producto
    const productoData = {
      nombre: body.nombre.trim(),
      descripcion: body.descripcion?.trim() || null,
      precio: precio.toString(),
      stock: stock,
      categoria: body.categoria?.trim() || null,
      imagen: body.imagen?.trim() || null
    };

    const result = await createProducto(productoData, user.organizationId);
    
    return Response.json({
      success: true,
      data: {
        id: result.id,
        ...productoData,
        organizationId: user.organizationId
      },
      message: 'Producto creado exitosamente'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error en POST /api/productos:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
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
    // Verificar autenticación
    const authResult = await requireAuth(request);
    
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
        { status: 400 }
      );
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Validar que se proporcione el ID
    if (!body.id) {
      return Response.json(
        { 
          error: 'ID del producto es requerido',
          code: 'MISSING_PRODUCT_ID'
        },
        { status: 400 }
      );
    }

    const productId = parseInt(body.id);
    if (isNaN(productId)) {
      return Response.json(
        { 
          error: 'ID del producto debe ser un número válido',
          code: 'INVALID_PRODUCT_ID'
        },
        { status: 400 }
      );
    }

    // Verificar que el producto existe y pertenece a la organización
    const existingProduct = await getProductoById(productId, user.organizationId);
    if (!existingProduct || existingProduct.length === 0) {
      return Response.json(
        { 
          error: 'Producto no encontrado',
          code: 'PRODUCT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: Partial<typeof productos.$inferInsert> = {};
    
    if (body.nombre !== undefined) {
      if (!body.nombre.trim()) {
        return Response.json(
          { 
            error: 'El nombre no puede estar vacío',
            code: 'INVALID_NAME'
          },
          { status: 400 }
        );
      }
      updateData.nombre = body.nombre.trim();
    }
    
    if (body.descripcion !== undefined) {
      updateData.descripcion = body.descripcion?.trim() || null;
    }
    
    if (body.precio !== undefined) {
      const precio = parseFloat(body.precio);
      if (isNaN(precio) || precio < 0) {
        return Response.json(
          { 
            error: 'El precio debe ser un número positivo',
            code: 'INVALID_PRICE'
          },
          { status: 400 }
        );
      }
      updateData.precio = precio.toString();
    }
    
    if (body.stock !== undefined) {
      const stock = parseInt(body.stock);
      if (isNaN(stock) || stock < 0) {
        return Response.json(
          { 
            error: 'El stock debe ser un número no negativo',
            code: 'INVALID_STOCK'
          },
          { status: 400 }
        );
      }
      updateData.stock = stock;
    }
    
    if (body.categoria !== undefined) {
      updateData.categoriaId = body.categoria?.trim() || null;
    }
    
    if (body.imagen !== undefined) {
      updateData.imagen = body.imagen?.trim() || null;
    }

    // Actualizar el producto
    await updateProducto(productId, updateData, user.organizationId);
    
    // Obtener el producto actualizado
    const updatedProduct = await getProductoById(productId, user.organizationId);
    
    return Response.json({
      success: true,
      data: updatedProduct[0],
      message: 'Producto actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('Error en PUT /api/productos:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/productos
 * Elimina un producto
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(request);
    
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
        { status: 400 }
      );
    }

    // Obtener ID del producto desde query params
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    if (!productId) {
      return Response.json(
        { 
          error: 'ID del producto es requerido',
          code: 'MISSING_PRODUCT_ID'
        },
        { status: 400 }
      );
    }

    const id = parseInt(productId);
    if (isNaN(id)) {
      return Response.json(
        { 
          error: 'ID del producto debe ser un número válido',
          code: 'INVALID_PRODUCT_ID'
        },
        { status: 400 }
      );
    }

    // Verificar que el producto existe y pertenece a la organización
    const existingProduct = await getProductoById(id, user.organizationId);
    if (!existingProduct || existingProduct.length === 0) {
      return Response.json(
        { 
          error: 'Producto no encontrado',
          code: 'PRODUCT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Eliminar el producto
    await deleteProducto(id, user.organizationId);
    
    return Response.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error en DELETE /api/productos:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}