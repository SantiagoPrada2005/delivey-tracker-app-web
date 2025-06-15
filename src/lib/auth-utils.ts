/**
 * @fileoverview Utilidades para manejar la autenticación en el servidor
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-05-12
 * 
 * @description
 * Este archivo contiene utilidades para extraer y manejar información de autenticación
 * en las API routes del servidor. El middleware agrega información del usuario decodificada
 * del token de Firebase a los headers de la request, y estas funciones facilitan el acceso
 * a esa información.
 */

import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

/**
 * Interfaz que define la información del usuario extraída del token de Firebase
 */
export interface AuthenticatedUser {
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role?: string;
  organizationId?: string;
}

/**
 * Extrae la información del usuario autenticado desde los headers de la request
 * Esta información es agregada por el middleware después de verificar el token de Firebase
 * 
 * @param request - La request de Next.js (opcional, si no se proporciona usa headers())
 * @returns La información del usuario autenticado o null si no está disponible
 */
 export async function getAuthenticatedUser(request?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    let headersList;
    
    if (request) {
      // Si se proporciona la request, usar sus headers
      headersList = request.headers;
    } else {
      // Si no, usar la función headers() de Next.js (para App Router)
      // En Next.js 15, headers() retorna una Promise
      headersList = await headers();
    }

    const userId = headersList.get('x-user-id');
    const userEmail = headersList.get('x-user-email');
    const userName = headersList.get('x-user-name');
    const userVerified = headersList.get('x-user-verified');
    const userRole = headersList.get('x-user-role');
    const userOrganization = headersList.get('x-user-organization');

    // Verificar que al menos tengamos el ID del usuario
    if (!userId) {
      return null;
    }

    return {
      uid: userId,
      email: userEmail || '',
      name: userName || '',
      emailVerified: userVerified === 'true',
      role: userRole || undefined,
      organizationId: userOrganization || undefined,
    };
  } catch (error) {
    console.error('[Auth Utils] Error al extraer información del usuario:', error);
    return null;
  }
}

/**
 * Verifica si el usuario actual tiene un rol específico
 * 
 * @param requiredRole - El rol requerido
 * @param request - La request de Next.js (opcional)
 * @returns true si el usuario tiene el rol requerido, false en caso contrario
 */
export async function hasRole(requiredRole: string, request?: NextRequest): Promise<boolean> {
  const user = await getAuthenticatedUser(request);
  return user?.role === requiredRole;
}

/**
 * Verifica si el usuario actual pertenece a una organización específica
 * 
 * @param organizationId - El ID de la organización
 * @param request - La request de Next.js (opcional)
 * @returns true si el usuario pertenece a la organización, false en caso contrario
 */
export async function belongsToOrganization(organizationId: string, request?: NextRequest): Promise<boolean> {
  const user = await getAuthenticatedUser(request);
  return user?.organizationId === organizationId;
}

/**
 * Verifica si el usuario actual es administrador
 * 
 * @param request - La request de Next.js (opcional)
 * @returns true si el usuario es administrador, false en caso contrario
 */
export async function isAdmin(request?: NextRequest): Promise<boolean> {
  return await hasRole('admin', request);
}

/**
 * Middleware de verificación de roles para API routes
 * Devuelve una función que puede ser usada para verificar roles en API routes
 * 
 * @param requiredRole - El rol requerido para acceder a la ruta
 * @returns Una función que verifica el rol y devuelve una respuesta de error si no se cumple
 */
export function requireRole(requiredRole: string) {
  return async function(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return Response.json(
        { error: 'Usuario no autenticado', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    if (user.role !== requiredRole) {
      return Response.json(
        { 
          error: `Acceso denegado. Se requiere rol: ${requiredRole}`, 
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRole,
          userRole: user.role
        },
        { status: 403 }
      );
    }
    
    return null; // Sin errores, el usuario tiene el rol requerido
  };
}

/**
 * Middleware de verificación de organización para API routes
 * 
 * @param organizationId - El ID de la organización requerida
 * @returns Una función que verifica la organización y devuelve una respuesta de error si no se cumple
 */
export function requireOrganization(organizationId: string) {
  return async function(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return Response.json(
        { error: 'Usuario no autenticado', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    if (user.organizationId !== organizationId) {
      return Response.json(
        { 
          error: 'Acceso denegado. No pertenece a la organización requerida', 
          code: 'ORGANIZATION_ACCESS_DENIED',
          requiredOrganization: organizationId,
          userOrganization: user.organizationId
        },
        { status: 403 }
      );
    }
    
    return null; // Sin errores, el usuario pertenece a la organización
  };
}

/**
 * Tipos de error de autenticación
 */
export const AuthErrorCodes = {
  AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_VERIFICATION_ERROR: 'AUTH_VERIFICATION_ERROR',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ORGANIZATION_ACCESS_DENIED: 'ORGANIZATION_ACCESS_DENIED',
} as const;

export type AuthErrorCode = typeof AuthErrorCodes[keyof typeof AuthErrorCodes];