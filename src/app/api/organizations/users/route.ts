/**
 * @fileoverview API route para obtener usuarios de una organización
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Esta API route maneja la obtención de usuarios que pertenecen a la misma
 * organización que el usuario autenticado.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/utils';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Interface para la respuesta de usuarios de organización
 */
interface OrganizationUsersResponse {
  success: boolean;
  users?: Array<{
    id: number;
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
    role: string;
    isActive: boolean;
    createdAt: Date;
    lastLoginAt: Date | null;
  }>;
  error?: string;
  code?: string;
}

/**
 * GET /api/organizations/users
 * 
 * Obtiene todos los usuarios que pertenecen a la misma organización
 * que el usuario autenticado
 * 
 * @param {NextRequest} request - Request object de Next.js
 * @returns {Promise<NextResponse<OrganizationUsersResponse>>} Lista de usuarios de la organización
 * 
 * @example
 * // Request
 * GET /api/organizations/users
 * Headers: {
 *   "Authorization": "Bearer <firebase_token>"
 * }
 * 
 * // Response (200)
 * {
 *   "success": true,
 *   "users": [
 *     {
 *       "id": 1,
 *       "firebaseUid": "abc123...",
 *       "email": "user@example.com",
 *       "displayName": "Usuario Ejemplo",
 *       "role": "admin",
 *       "isActive": true,
 *       "createdAt": "2025-01-20T10:00:00.000Z",
 *       "lastLoginAt": "2025-01-20T15:30:00.000Z"
 *     }
 *   ]
 * }
 * 
 * @example
 * // Error response (403)
 * {
 *   "success": false,
 *   "error": "No perteneces a ninguna organización",
 *   "code": "NO_ORGANIZATION"
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse<OrganizationUsersResponse>> {
  try {
    // Obtener usuario autenticado
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<OrganizationUsersResponse>;
    }
    
    const { user } = authResult;

    // Obtener información del usuario actual para verificar su organización
    const [currentUser] = await db.select({
      organizationId: users.organizationId
    })
      .from(users)
      .where(eq(users.firebaseUid, user.uid))
      .limit(1);

    if (!currentUser || !currentUser.organizationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No perteneces a ninguna organización',
          code: 'NO_ORGANIZATION'
        },
        { status: 403 }
      );
    }

    // Obtener todos los usuarios de la misma organización
    const organizationUsers = await db.select({
      id: users.id,
      firebaseUid: users.firebaseUid,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt
    })
      .from(users)
      .where(eq(users.organizationId, currentUser.organizationId));

    return NextResponse.json({
      success: true,
      users: organizationUsers
    });
    
  } catch (error) {
    console.error('[Organizations Users] Error al obtener usuarios de la organización:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}