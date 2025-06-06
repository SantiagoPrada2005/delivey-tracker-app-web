import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { db } from '@/db';
import { organizationInvitations, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// GET /api/organizations/invitations - Obtener invitaciones pendientes para el usuario actual
export async function GET(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener invitaciones pendientes para el email del usuario
    const invitations = await db.query.organizationInvitations.findMany({
      where: and(
        eq(organizationInvitations.invitedEmail, user.email),
        eq(organizationInvitations.status, 'pending')
      ),
      with: {
        organization: true,
        inviter: true
      }
    });

    // Formatear las invitaciones para la respuesta
    const formattedInvitations = invitations.map(invitation => ({
      id: invitation.id,
      organizationId: invitation.organizationId,
      organizationName: invitation.organization.name,
      inviterEmail: invitation.inviter?.email || 'No disponible',
      invitedEmail: invitation.invitedEmail,
      status: invitation.status,
      createdAt: invitation.createdAt.toISOString()
    }));

    return NextResponse.json({ invitations: formattedInvitations });
  } catch (error) {
    console.error('Error al obtener invitaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener invitaciones' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/invitations - Crear una nueva invitación
export async function POST(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar que el usuario pertenece a una organización
    if (!user.organizationId) {
      return NextResponse.json(
        { error: 'No perteneces a ninguna organización' },
        { status: 403 }
      );
    }

    // Obtener datos de la invitación
    const { email, role } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe y pertenece a una organización
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (existingUser && existingUser.organizationId) {
      return NextResponse.json(
        { error: 'El usuario ya pertenece a una organización' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una invitación pendiente para este email en esta organización
    // Verificar que el usuario tenga una organización asignada
    if (!user.organizationId) {
      return NextResponse.json(
        { error: 'El usuario no pertenece a ninguna organización' },
        { status: 403 }
      );
    }

    const organizationIdNumber = parseInt(user.organizationId, 10);
    
    const existingInvitation = await db.query.organizationInvitations.findFirst({
      where: and(
        eq(organizationInvitations.invitedEmail, email),
        eq(organizationInvitations.organizationId, organizationIdNumber),
        eq(organizationInvitations.status, 'pending')
      )
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Ya existe una invitación pendiente para este email' },
        { status: 400 }
      );
    }

    // Crear la invitación
    // Generar un token único para la invitación (UUID)
    const invitationToken = crypto.randomUUID();
    
    // Calcular fecha de expiración (7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Buscar el ID del usuario en la base de datos
    const dbUser = await db.query.users.findFirst({
      where: eq(users.firebaseUid, user.uid)
    });
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en la base de datos' },
        { status: 404 }
      );
    }
    
    const [invitation] = await db.insert(organizationInvitations).values({
      organizationId: organizationIdNumber,
      invitedBy: dbUser.id,
      invitedEmail: email,
      invitationToken: invitationToken,
      assignedRole: role || 'service_client' as const, // Usar el rol proporcionado o un valor por defecto
      status: 'pending',
      expiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Error al crear invitación:', error);
    return NextResponse.json(
      { error: 'Error al crear invitación' },
      { status: 500 }
    );
  }
}