/**
 * @fileoverview API route para obtener y actualizar el perfil del usuario autenticado
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-05-12
 * 
 * @description
 * Esta API route demuestra cómo usar las utilidades de autenticación para:
 * - Obtener información del usuario autenticado desde los headers
 * - Verificar que el usuario esté autenticado
 * - Manejar errores de autenticación apropiadamente
 */

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';

/**
 * GET /api/user/profile
 * Obtiene el perfil del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    // Extraer información del usuario desde los headers (agregados por el middleware)
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return Response.json(
        { 
          error: 'Usuario no autenticado',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    // Aquí podrías hacer consultas adicionales a la base de datos
    // para obtener más información del perfil del usuario
    // Por ejemplo:
    // const userProfile = await db.select().from(users).where(eq(users.firebaseUid, user.uid));

    return Response.json({
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
        organizationId: user.organizationId,
      }
    });
    
  } catch (error) {
    console.error('[API] Error en GET /api/user/profile:', error);
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
 * PUT /api/user/profile
 * Actualiza el perfil del usuario autenticado
 */
export async function PUT(request: NextRequest) {
  try {
    // Extraer información del usuario desde los headers
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return Response.json(
        { 
          error: 'Usuario no autenticado',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la request
    const body = await request.json();
    const { name, preferences } = body;

    // Validación básica
    if (!name || typeof name !== 'string') {
      return Response.json(
        { 
          error: 'El nombre es requerido y debe ser una cadena de texto',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Aquí actualizarías la información en la base de datos
    // Por ejemplo:
    // await db.update(users)
    //   .set({ name, preferences, updatedAt: new Date() })
    //   .where(eq(users.firebaseUid, user.uid));

    console.log(`[API] Actualizando perfil para usuario ${user.uid}:`, { name, preferences });

    return Response.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: {
        id: user.uid,
        email: user.email,
        name: name, // Nombre actualizado
        emailVerified: user.emailVerified,
        role: user.role,
        organizationId: user.organizationId,
      }
    });
    
  } catch (error) {
    console.error('[API] Error en PUT /api/user/profile:', error);
    return Response.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}