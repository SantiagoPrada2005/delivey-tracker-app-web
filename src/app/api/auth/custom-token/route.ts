/**
 * @fileoverview API route para crear tokens personalizados de Firebase
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Esta API route permite crear tokens personalizados de Firebase con claims adicionales.
 * Útil para casos donde se necesita autenticación con información específica del usuario
 * como roles, organizaciones, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  requireAuth, 
  createUserCustomToken, 
  updateUserClaims,
  hasRole,
  createAuthErrorResponse,
  createAuthSuccessResponse
} from '@/lib/auth/utils';
import { getUserByUid } from '@/lib/firebase/admin';

// Tipos para las requests
interface CreateTokenRequest {
  uid: string;
  claims?: {
    role?: string;
    organizationId?: string;
    permissions?: string[];
    [key: string]: unknown;
  };
}

interface UpdateClaimsRequest {
  uid: string;
  claims: {
    role?: string;
    organizationId?: string;
    permissions?: string[];
    [key: string]: unknown;
  };
}

/**
 * POST /api/auth/custom-token
 * Crea un token personalizado para un usuario específico
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error de autenticación
    }
    
    const { user } = authResult;
    
    // Solo administradores pueden crear tokens personalizados
    if (!hasRole(user, 'admin')) {
      return createAuthErrorResponse(
        'Solo los administradores pueden crear tokens personalizados',
        403
      );
    }
    
    // Parsear el body de la request
    const body: CreateTokenRequest = await request.json();
    
    if (!body.uid) {
      return createAuthErrorResponse('UID del usuario es requerido', 400);
    }
    
    // Verificar que el usuario existe
    const targetUser = await getUserByUid(body.uid);
    if (!targetUser) {
      return createAuthErrorResponse('Usuario no encontrado', 404);
    }
    
    // Crear el token personalizado
    const tokenResult = await createUserCustomToken(body.uid, body.claims);
    
    if (!tokenResult.success) {
      return createAuthErrorResponse(
        tokenResult.error || 'Error al crear token personalizado',
        500
      );
    }
    
    return createAuthSuccessResponse(
      {
        customToken: tokenResult.token,
        uid: body.uid,
        claims: body.claims || {}
      },
      'Token personalizado creado exitosamente'
    );
    
  } catch (error) {
    console.error('[Custom Token API] Error:', error);
    return createAuthErrorResponse('Error interno del servidor', 500);
  }
}

/**
 * PUT /api/auth/custom-token
 * Actualiza los claims personalizados de un usuario
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error de autenticación
    }
    
    const { user } = authResult;
    
    // Solo administradores pueden actualizar claims
    if (!hasRole(user, 'admin')) {
      return createAuthErrorResponse(
        'Solo los administradores pueden actualizar claims de usuarios',
        403
      );
    }
    
    // Parsear el body de la request
    const body: UpdateClaimsRequest = await request.json();
    
    if (!body.uid || !body.claims) {
      return createAuthErrorResponse(
        'UID del usuario y claims son requeridos',
        400
      );
    }
    
    // Verificar que el usuario existe
    const targetUser = await getUserByUid(body.uid);
    if (!targetUser) {
      return createAuthErrorResponse('Usuario no encontrado', 404);
    }
    
    // Actualizar los claims
    const success = await updateUserClaims(body.uid, body.claims);
    
    if (!success) {
      return createAuthErrorResponse(
        'Error al actualizar claims del usuario',
        500
      );
    }
    
    return createAuthSuccessResponse(
      {
        uid: body.uid,
        claims: body.claims
      },
      'Claims actualizados exitosamente'
    );
    
  } catch (error) {
    console.error('[Custom Token API] Error en PUT:', error);
    return createAuthErrorResponse('Error interno del servidor', 500);
  }
}

/**
 * GET /api/auth/custom-token
 * Obtiene información sobre la API de tokens personalizados
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'API de tokens personalizados de Firebase',
    endpoints: {
      'POST /api/auth/custom-token': {
        description: 'Crea un token personalizado para un usuario',
        requiredRole: 'admin',
        body: {
          uid: 'string (requerido)',
          claims: 'object (opcional) - Claims adicionales para el token'
        }
      },
      'PUT /api/auth/custom-token': {
        description: 'Actualiza los claims personalizados de un usuario',
        requiredRole: 'admin',
        body: {
          uid: 'string (requerido)',
          claims: 'object (requerido) - Claims a actualizar'
        }
      }
    },
    examples: {
      createToken: {
        uid: 'user123',
        claims: {
          role: 'manager',
          organizationId: 'org456',
          permissions: ['read', 'write']
        }
      },
      updateClaims: {
        uid: 'user123',
        claims: {
          role: 'admin',
          organizationId: 'org789'
        }
      }
    }
  });
}