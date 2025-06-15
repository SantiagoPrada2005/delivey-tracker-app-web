/**
 * @fileoverview Utilidades de autenticación para APIs usando Firebase Admin SDK
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Este archivo proporciona utilidades centralizadas para manejar autenticación
 * en las API routes usando Firebase Admin SDK. Incluye funciones para extraer
 * y verificar tokens, crear tokens personalizados, y manejar errores de autenticación.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyFirebaseToken, 
  createCustomToken, 
  setCustomUserClaims 
} from '@/lib/firebase/admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

// Tipos para las respuestas de autenticación
export interface AuthResult {
  success: boolean;
  user?: DecodedIdToken;
  error?: string;
  statusCode?: number;
}

export interface CustomTokenResult {
  success: boolean;
  token?: string;
  error?: string;
}

export interface UserClaimsUpdate {
  role?: string;
  organizationId?: string;
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * Extrae el token de Firebase del header Authorization de una request.
 * 
 * @param {NextRequest} request - La request de Next.js
 * @returns {string | null} El token extraído o null si no se encuentra
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  
  console.log('[Auth Utils] Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'No header');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[Auth Utils] Token extraction failed: Invalid or missing Authorization header');
    return null;
  }
  
  const token = authHeader.split('Bearer ')[1];
  console.log('[Auth Utils] Token extracted, length:', token?.length || 0);
  console.log('[Auth Utils] Token preview:', token ? `${token.substring(0, 20)}...` : 'Empty token');
  
  return token;
}

/**
 * Verifica la autenticación de una request y retorna la información del usuario.
 * 
 * @param {NextRequest} request - La request de Next.js
 * @param {boolean} checkRevoked - Si verificar si el token ha sido revocado
 * @returns {Promise<AuthResult>} Resultado de la autenticación
 */
export async function authenticateRequest(request: NextRequest, checkRevoked: boolean = false): Promise<AuthResult> {
  try {
    // Extraer token del header
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      return {
        success: false,
        error: 'Token de autorización no proporcionado o formato inválido',
        statusCode: 401
      };
    }
    
    // Verificar token con Firebase Admin
    const decodedToken = await verifyFirebaseToken(token, checkRevoked);
    
    if (!decodedToken) {
      return {
        success: false,
        error: 'Token inválido o expirado',
        statusCode: 401
      };
    }
    
    return {
      success: true,
      user: decodedToken
    };
    
  } catch (error) {
    console.error('[Auth Utils] Error en authenticateRequest:', error);
    return {
      success: false,
      error: 'Error interno de autenticación',
      statusCode: 500
    };
  }
}

/**
 * Middleware de autenticación para API routes que requiere autenticación.
 * Retorna una respuesta de error si la autenticación falla.
 * 
 * @param {NextRequest} request - La request de Next.js
 * @param {boolean} checkRevoked - Si verificar si el token ha sido revocado
 * @returns {Promise<{ user: DecodedIdToken } | NextResponse>} Usuario autenticado o respuesta de error
 */
export async function requireAuth(request: NextRequest, checkRevoked: boolean = false): Promise<{ user: DecodedIdToken } | NextResponse> {
  const authResult = await authenticateRequest(request, checkRevoked);
  
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode || 401 }
    );
  }
  
  return { user: authResult.user! };
}

/**
 * Crea un token personalizado para un usuario con claims adicionales.
 * 
 * @param {string} uid - UID del usuario
 * @param {UserClaimsUpdate} claims - Claims adicionales para el token
 * @returns {Promise<CustomTokenResult>} Resultado de la creación del token
 */
export async function createUserCustomToken(uid: string, claims?: UserClaimsUpdate): Promise<CustomTokenResult> {
  try {
    const token = await createCustomToken(uid, claims);
    
    if (!token) {
      return {
        success: false,
        error: 'No se pudo crear el token personalizado'
      };
    }
    
    return {
      success: true,
      token
    };
    
  } catch (error) {
    console.error('[Auth Utils] Error en createUserCustomToken:', error);
    return {
      success: false,
      error: 'Error interno al crear token personalizado'
    };
  }
}

/**
 * Actualiza los claims personalizados de un usuario.
 * 
 * @param {string} uid - UID del usuario
 * @param {UserClaimsUpdate} claims - Claims a actualizar
 * @returns {Promise<boolean>} true si fue exitoso, false en caso contrario
 */
export async function updateUserClaims(uid: string, claims: UserClaimsUpdate): Promise<boolean> {
  try {
    const success = await setCustomUserClaims(uid, claims);
    return success;
  } catch (error) {
    console.error('[Auth Utils] Error en updateUserClaims:', error);
    return false;
  }
}

/**
 * Verifica si un usuario tiene un rol específico.
 * 
 * @param {DecodedIdToken} user - Token decodificado del usuario
 * @param {string} requiredRole - Rol requerido
 * @returns {boolean} true si el usuario tiene el rol, false en caso contrario
 */
export function hasRole(user: DecodedIdToken, requiredRole: string): boolean {
  return user.role === requiredRole;
}

/**
 * Verifica si un usuario tiene alguno de los roles especificados.
 * 
 * @param {DecodedIdToken} user - Token decodificado del usuario
 * @param {string[]} roles - Roles permitidos
 * @returns {boolean} true si el usuario tiene alguno de los roles, false en caso contrario
 */
export function hasAnyRole(user: DecodedIdToken, roles: string[]): boolean {
  return roles.includes(user.role);
}

/**
 * Verifica si un usuario pertenece a una organización específica.
 * 
 * @param {DecodedIdToken} user - Token decodificado del usuario
 * @param {string} organizationId - ID de la organización
 * @returns {boolean} true si el usuario pertenece a la organización, false en caso contrario
 */
export function belongsToOrganization(user: DecodedIdToken, organizationId: string): boolean {
  return user.organizationId === organizationId;
}

/**
 * Middleware para verificar roles en API routes.
 * 
 * @param {DecodedIdToken} user - Usuario autenticado
 * @param {string | string[]} allowedRoles - Rol o roles permitidos
 * @returns {NextResponse | null} Respuesta de error si no tiene permisos, null si tiene permisos
 */
export function requireRole(user: DecodedIdToken, allowedRoles: string | string[]): NextResponse | null {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  if (!hasAnyRole(user, roles)) {
    return NextResponse.json(
      { error: 'No tienes permisos para acceder a este recurso' },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * Middleware para verificar pertenencia a organización en API routes.
 * 
 * @param {DecodedIdToken} user - Usuario autenticado
 * @param {string} organizationId - ID de la organización requerida
 * @returns {NextResponse | null} Respuesta de error si no pertenece, null si pertenece
 */
export function requireOrganization(user: DecodedIdToken, organizationId: string): NextResponse | null {
  if (!belongsToOrganization(user, organizationId)) {
    return NextResponse.json(
      { error: 'No tienes acceso a esta organización' },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * Crea una respuesta de error estándar para autenticación.
 * 
 * @param {string} message - Mensaje de error
 * @param {number} status - Código de estado HTTP
 * @returns {NextResponse} Respuesta de error
 */
export function createAuthErrorResponse(message: string, status: number = 401): NextResponse<{ error: string }> {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * Crea una respuesta de éxito estándar para autenticación.
 * 
 * @param {any} data - Datos a retornar
 * @param {string} message - Mensaje de éxito (opcional)
 * @returns {NextResponse} Respuesta de éxito
 */
export function createAuthSuccessResponse<T>(data: T, message?: string): NextResponse<{ data: T; message?: string }> {
  const response: { data: T; message?: string } = { data };
  if (message) {
    response.message = message;
  }
  
  return NextResponse.json(response);
}