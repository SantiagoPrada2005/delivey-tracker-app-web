/**
 * @fileoverview API route para verificar el estado de organización de un usuario
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Esta API route verifica si un usuario tiene una organización asignada,
 * invitaciones pendientes o solicitudes de organización en proceso.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/utils';
import { db } from '@/db';
import { users, organizations, organizationInvitations, organizationRequests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface OrganizationStatusResponse {
  success: boolean;
  status: 'HAS_ORGANIZATION' | 'PENDING_INVITATION' | 'PENDING_REQUEST' | 'NO_ORGANIZATION';
  data?: {
    user: {
      id: number;
      email: string;
      organizationId: number | null;
      role: string;
    };
    organization?: {
      id: number;
      name: string;
      slug: string;
    };
    pendingInvitations?: Array<{
      id: number;
      organizationName: string;
      inviterEmail: string;
      token: string;
      expiresAt: Date;
    }>;
    pendingRequests?: Array<{
      id: number;
      organizationName: string;
      status: string;
      requestedAt: Date;
    }>;
  };
  error?: string;
  code?: string;
}

/**
 * GET /api/user/organization-status
 * Obtiene el estado de organización del usuario autenticado
 */
export async function GET(request: NextRequest): Promise<NextResponse<OrganizationStatusResponse>> {
  try {
    // Obtener usuario autenticado
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<OrganizationStatusResponse>;
    }
    
    const { user } = authResult;

    // Obtener datos completos del usuario
    const [userRecord] = await db.select({
      id: users.id,
      email: users.email,
      organizationId: users.organizationId,
      role: users.role
    })
      .from(users)
      .where(eq(users.firebaseUid, user.uid))
      .limit(1);

    if (!userRecord) {
      return NextResponse.json(
        { 
          success: false,
          status: 'NO_ORGANIZATION' as const,
          error: 'Usuario no encontrado en la base de datos',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Si el usuario ya tiene organización
    if (userRecord.organizationId) {
      const [organization] = await db.select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug
      })
        .from(organizations)
        .where(eq(organizations.id, userRecord.organizationId))
        .limit(1);

      return NextResponse.json({
        success: true,
        status: 'HAS_ORGANIZATION' as const,
        data: {
          user: {
            ...userRecord,
            email: userRecord.email || ''
          },
          organization
        }
      });
    }

    // Buscar invitaciones pendientes
    const pendingInvitations = await db.select({
      id: organizationInvitations.id,
      organizationName: organizations.name,
      inviterEmail: organizationInvitations.invitedEmail,
      token: organizationInvitations.invitationToken,
      expiresAt: organizationInvitations.expiresAt
    })
      .from(organizationInvitations)
      .innerJoin(organizations, eq(organizationInvitations.organizationId, organizations.id))
      .where(
        and(
          eq(organizationInvitations.invitedEmail, userRecord.email || ''),
          eq(organizationInvitations.status, 'pending')
        )
      );

    // Buscar solicitudes pendientes
    const pendingRequests = await db.select({
      id: organizationRequests.id,
      organizationName: organizationRequests.organizationName,
      status: organizationRequests.status,
      requestedAt: organizationRequests.createdAt
    })
      .from(organizationRequests)
      .where(
        and(
          eq(organizationRequests.requestedBy, userRecord.id),
          eq(organizationRequests.status, 'pending')
        )
      );

    // Determinar el estado basado en invitaciones y solicitudes
    if (pendingInvitations.length > 0) {
      return NextResponse.json({
        success: true,
        status: 'PENDING_INVITATION' as const,
        data: {
          user: {
            ...userRecord,
            email: userRecord.email || ''
          },
          pendingInvitations
        }
      });
    }

    if (pendingRequests.length > 0) {
      return NextResponse.json({
        success: true,
        status: 'PENDING_REQUEST' as const,
        data: {
          user: {
            ...userRecord,
            email: userRecord.email || ''
          },
          pendingRequests
        }
      });
    }

    // No tiene organización, invitaciones ni solicitudes
    return NextResponse.json({
      success: true,
      status: 'NO_ORGANIZATION' as const,
      data: {
        user: {
          ...userRecord,
          email: userRecord.email || ''
        }
      }
    });
    
  } catch (error) {
    console.error('[Organization Status] Error al obtener estado:', error);
    
    return NextResponse.json(
      { 
        success: false,
        status: 'NO_ORGANIZATION' as const,
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}