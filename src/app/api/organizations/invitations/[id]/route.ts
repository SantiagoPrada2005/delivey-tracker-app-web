import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { db } from '@/db';
import { organizationInvitations, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// PUT /api/organizations/invitations/[id] - Aceptar o rechazar una invitación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invitationId = parseInt(id, 10); // Convertir el ID de string a número
    
    // Obtener usuario autenticado
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener datos de la acción
    const { action } = await request.json();
    
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