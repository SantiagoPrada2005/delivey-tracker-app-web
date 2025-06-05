/**
 * @fileoverview API route administrativa para gestionar usuarios
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-05-12
 * 
 * @description
 * Esta API route demuestra cómo usar las utilidades de autenticación para:
 * - Verificar que el usuario tenga rol de administrador
 * - Usar middleware de verificación de roles
 * - Manejar operaciones administrativas seguras
 */

import { NextRequest } from 'next/server';
import { getAuthenticatedUser, requireRole, isAdmin } from '@/lib/auth-utils';

/**
 * GET /api/admin/users
 * Obtiene la lista de usuarios (solo administradores)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario sea administrador
    const roleCheck = await requireRole('admin')(request);
    if (roleCheck) {
      return roleCheck; // Retorna la respuesta de error si no tiene el rol
    }

    const user = await getAuthenticatedUser(request);
    console.log(`[API Admin] Usuario ${user?.email} solicitando lista de usuarios`);

    // Aquí harías la consulta a la base de datos para obtener usuarios
    // Por ejemplo:
    // const users = await db.select({
    //   id: users.id,
    //   email: users.email,
    //   name: users.name,
    //   role: users.role,
    //   createdAt: users.createdAt,
    //   emailVerified: users.emailVerified
    // }).from(users);

    // Datos de ejemplo
    const users = [
      {
        id: '1',
        email: 'usuario1@example.com',
        name: 'Usuario Uno',
        role: 'user',
        createdAt: new Date().toISOString(),
        emailVerified: true
      },
      {
        id: '2',
        email: 'admin@example.com',
        name: 'Administrador',
        role: 'admin',
        createdAt: new Date().toISOString(),
        emailVerified: true
      }
    ];

    return Response.json({
      success: true,
      users,
      total: users.length,
      requestedBy: {
        id: user?.uid,
        email: user?.email,
        role: user?.role
      }
    });
    
  } catch (error) {
    console.error('[API Admin] Error en GET /api/admin/users:', error);
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
 * POST /api/admin/users
 * Crea un nuevo usuario (solo administradores)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario sea administrador usando la función isAdmin
    if (!(await isAdmin(request))) {
      return Response.json(
        { 
          error: 'Acceso denegado. Se requieren permisos de administrador',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const { email, name, role = 'user' } = body;

    // Validación
    if (!email || !name) {
      return Response.json(
        { 
          error: 'Email y nombre son requeridos',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    if (!['user', 'admin', 'manager'].includes(role)) {
      return Response.json(
        { 
          error: 'Rol inválido. Roles permitidos: user, admin, manager',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    console.log(`[API Admin] Usuario ${user?.email} creando nuevo usuario:`, { email, name, role });

    // Aquí crearías el usuario en la base de datos
    // Por ejemplo:
    // const newUser = await db.insert(users).values({
    //   email,
    //   name,
    //   role,
    //   createdAt: new Date(),
    //   createdBy: user?.uid
    // }).returning();

    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
      emailVerified: false,
      createdBy: user?.uid
    };

    return Response.json({
      success: true,
      message: 'Usuario creado correctamente',
      user: newUser,
      createdBy: {
        id: user?.uid,
        email: user?.email
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('[API Admin] Error en POST /api/admin/users:', error);
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
 * DELETE /api/admin/users/[id]
 * Elimina un usuario (solo administradores)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar rol de administrador
    const roleCheck = await requireRole('admin')(request);
    if (roleCheck) {
      return roleCheck;
    }

    const user = await getAuthenticatedUser(request);
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return Response.json(
        { 
          error: 'ID de usuario requerido',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Prevenir que un admin se elimine a sí mismo
    if (userId === user?.uid) {
      return Response.json(
        { 
          error: 'No puedes eliminar tu propia cuenta',
          code: 'SELF_DELETION_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    console.log(`[API Admin] Usuario ${user?.email} eliminando usuario ID: ${userId}`);

    // Aquí eliminarías el usuario de la base de datos
    // Por ejemplo:
    // await db.delete(users).where(eq(users.id, userId));

    return Response.json({
      success: true,
      message: 'Usuario eliminado correctamente',
      deletedUserId: userId,
      deletedBy: {
        id: user?.uid,
        email: user?.email
      }
    });
    
  } catch (error) {
    console.error('[API Admin] Error en DELETE /api/admin/users:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}