/**
 * @fileoverview API route para verificar tokens de Firebase
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Esta API route proporciona endpoints para verificar tokens de Firebase Auth
 * y obtener información del usuario autenticado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase/admin';

/**
 * Interface para la respuesta de verificación de token
 * @interface TokenVerificationResponse
 */
interface TokenVerificationResponse {
  uid?: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  error?: string;
  details?: string;
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
 *   "uid": "firebase_user_id",
 *   "email": "user@example.com",
 *   "emailVerified": true,
 *   "displayName": "User Name",
 *   "photoURL": "https://example.com/photo.jpg"
 * }
 * 
 * // Response (401)
 * {
 *   "error": "Token inválido o expirado",
 *   "details": "Error message"
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<TokenVerificationResponse>> {
  try {
    // Obtener el token del encabezado de autorización
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token no proporcionado o formato inválido' },
        { status: 401 }
      );
    }
    
    // Extraer el token
    const token = authHeader.split('Bearer ')[1];
    
    // Verificar el token con Firebase Admin
    const decodedToken = await verifyFirebaseToken(token);
    
    // Verificar si el token es válido
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }
    
    // Devolver la información del usuario decodificada
    return NextResponse.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      // Puedes incluir claims personalizados si los tienes
      // role: decodedToken.role,
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    
    // Manejar el error como tipo unknown
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { error: 'Token inválido o expirado', details: errorMessage },
      { status: 401 }
    );
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