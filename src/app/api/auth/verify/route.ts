/**
 * @fileoverview API route para verificar tokens de Firebase
 * @version 2.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Esta API route proporciona endpoints para verificar tokens de Firebase Auth
 * y obtener información del usuario autenticado. Actualizada para usar las
 * nuevas utilidades de autenticación centralizadas.
 */
import { NextRequest, NextResponse } from 'next/server';
import { 
  authenticateRequest,
  createAuthErrorResponse,
  createAuthSuccessResponse
} from '@/lib/auth/utils';

/**
 * Interface para la respuesta de verificación de token
 * @interface TokenVerificationResponse
 */
interface TokenVerificationResponse {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: unknown;
  photoURL?: string;
  role?: unknown;
  organizationId?: unknown;
  permissions?: unknown;
  authTime: number;
  issuedAt: number;
  expiresAt: number;
  firebase: {
    identities: unknown;
    signInProvider?: string | null;
  };
}

/**
 * POST /api/auth/verify
 * Verifica un token de Firebase Auth y retorna la información del usuario
 * 
 * @param {NextRequest} request - Request object de Next.js
 * @returns {Promise<NextResponse<TokenVerificationResponse>>} Información del usuario o error
 * 
 * @example
 * // Request
 * POST /api/auth/verify
 * Headers: {
 *   "Authorization": "Bearer <firebase_token>"
 * }
 * 
 * // Response (200)
 * {
 *   "data": {
 *     "uid": "firebase_user_id",
 *     "email": "user@example.com",
 *     "emailVerified": true,
 *     "displayName": "User Name",
 *     "photoURL": "https://example.com/photo.jpg",
 *     "role": "user",
 *     "organizationId": "org123"
 *   },
 *   "message": "Token verificado exitosamente"
 * }
 * 
 * // Response (401)
 * {
 *   "error": "Token inválido o expirado"
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<{ data: TokenVerificationResponse; message?: string }> | NextResponse<{ error: string }>> {
  try {
    // Usar la nueva utilidad de autenticación
    const authResult = await authenticateRequest(request, false);
    
    if (!authResult.success) {
      return createAuthErrorResponse(
        authResult.error || 'Error de autenticación',
        authResult.statusCode || 401
      );
    }
    
    const { user } = authResult;
    
    // Preparar la información del usuario
    const userData = {
      uid: user!.uid,
      email: user!.email,
      emailVerified: user!.email_verified,
      displayName: user!.name,
      photoURL: user!.picture,
      // Incluir claims personalizados si existen
      role: user!.role || null,
      organizationId: user!.organizationId || null,
      permissions: user!.permissions || null,
      // Información adicional del token
      authTime: user!.auth_time,
      issuedAt: user!.iat,
      expiresAt: user!.exp,
      // Firebase específico
      firebase: {
        identities: user!.firebase?.identities || {},
        signInProvider: user!.firebase?.sign_in_provider || null
      }
    };
    
    return createAuthSuccessResponse(
      userData,
      'Token verificado exitosamente'
    );
    
  } catch (error) {
    console.error('[Auth Verify API] Error:', error);
    return createAuthErrorResponse('Error interno del servidor', 500);
  }
}

/**
 * GET /api/auth/verify
 * Endpoint de verificación de disponibilidad de la API
 * 
 * @returns {NextResponse} Información sobre el endpoint de verificación
 * 
 * @example
 * // Request
 * GET /api/auth/verify
 * 
 * // Response (200)
 * {
 *   "message": "API de verificación de tokens disponible",
 *   "endpoint": "/api/auth/verify",
 *   "method": "POST",
 *   "headers": {
 *     "Authorization": "Bearer <firebase_token>"
 *   }
 * }
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'API de verificación de tokens disponible',
    endpoint: '/api/auth/verify',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer <firebase_token>'
    }
  });
}