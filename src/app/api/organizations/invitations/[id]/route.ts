/**
 * @fileoverview API route for managing organization invitation responses
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2024
 * 
 * This API route handles accepting or rejecting organization invitations.
 * Users can respond to invitations they have received via email.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { db } from '@/db';
import { organizationInvitations, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Interface for invitation response request body
 */
interface InvitationActionRequest {
  action: 'accept' | 'reject';
}

/**
 * Interface for successful invitation response
 */
interface InvitationActionResponse {
  message: string;
  organization?: {
    id: number;
    name: string;
  };
}

/**
 * PUT /api/organizations/invitations/[id]
 * 
 * Accept or reject an organization invitation
 * 
 * @param request - The incoming request object
 * @param params - Route parameters containing the invitation ID
 * @returns Promise<NextResponse<InvitationActionResponse | { error: string }>>
 * 
 * @example
 * // Accept an invitation
 * PUT /api/organizations/invitations/123
 * {
 *   "action": "accept"
 * }
 * 
 * // Response (200)
 * {
 *   "message": "Invitación aceptada correctamente",
 *   "organization": {
 *     "id": 1,
 *     "name": "Mi Organización"
 *   }
 * }
 * 
 * @example
 * // Reject an invitation
 * PUT /api/organizations/invitations/123
 * {
 *   "action": "reject"
 * }
 * 
 * // Response (200)
 * {
 *   "message": "Invitación rechazada correctamente"
 * }
 * 
 * @example
 * // Error response (400)
 * {
 *   "error": "Acción inválida. Debe ser 'accept' o 'reject'"
 * }
 * 
 * @example
 * // Error response (404)
 * {
 *   "error": "Invitación no encontrada o no autorizada"
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<InvitationActionResponse | { error: string }>> {
  try {
    const { id } = await params;
    const invitationId = parseInt(id, 10); // Convertir el ID de string a número
    
    // Obtener usuario autenticado
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener datos de la acción
    const body: InvitationActionRequest = await request.json();
    const { action } = body;
    
    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser "accept" o "reject"' },
        { status: 400 }
      );
    }

    // Verificar que la invitación existe y está dirigida al usuario actual
    const invitation = await db.query.organizationInvitations.findFirst({
      where: and(
        eq(organizationInvitations.id, invitationId),
        eq(organizationInvitations.invitedEmail, user.email),
        eq(organizationInvitations.status, 'pending')
      ),
      with: {
        organization: true
      }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitación no encontrada o no autorizada' },
        { status: 404 }
      );
    }

    // Actualizar el estado de la invitación
    await db.update(organizationInvitations)
      .set({
        status: action === 'accept' ? 'accepted' : 'rejected',
        updatedAt: new Date()
      })
      .where(eq(organizationInvitations.id, invitationId));

    // Si se acepta la invitación, actualizar la organización del usuario
    if (action === 'accept') {
      await db.update(users)
        .set({
          organizationId: invitation.organizationId,
          updatedAt: new Date()
        })
        .where(eq(users.firebaseUid, user.uid));

      return NextResponse.json({
        message: 'Invitación aceptada correctamente',
        organization: {
          id: invitation.organizationId,
          name: invitation.organization.name
        }
      });
    }

    return NextResponse.json({
      message: 'Invitación rechazada correctamente'
    });
  } catch (error) {
    console.error('Error al procesar invitación:', error);
    return NextResponse.json(
      { error: 'Error al procesar invitación' },
      { status: 500 }
    );
  }
}