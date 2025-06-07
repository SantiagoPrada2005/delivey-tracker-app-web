/**
 * @fileoverview API route para gestionar invitaciones de organizaciones
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Esta API route maneja las invitaciones de organizaciones, permitiendo a los usuarios
 * autenticados obtener sus invitaciones pendientes y crear nuevas invitaciones.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { db } from '@/db';
import { organizationInvitations, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Interface para invitación formateada
 * @interface FormattedInvitation
 */
interface FormattedInvitation {
  id: number;
  organizationId: number;
  organizationName: string;
  inviterEmail: string;
  invitedEmail: string;
  status: string;
  createdAt: string;
}

/**
 * Interface para la respuesta de invitaciones
 * @interface InvitationsResponse
 */
interface InvitationsResponse {
  invitations?: FormattedInvitation[];
  error?: string;
}

/**
 * GET /api/organizations/invitations
 * Obtiene las invitaciones pendientes para el usuario autenticado
 * 
 * @param {NextRequest} request - Request object de Next.js
 * @returns {Promise<NextResponse<InvitationsResponse>>} Lista de invitaciones pendientes
 * 
 * @example
 * // Request
 * GET /api/organizations/invitations
 * Headers: {
 *   "Authorization": "Bearer <firebase_token>"
 * }
 * 
 * // Response (200)
 * {
 *   "invitations": [
 *     {
 *       "id": 1,
 *       "organizationId": 1,
 *       "organizationName": "Mi Organización",
 *       "inviterEmail": "admin@example.com",
 *       "invitedEmail": "user@example.com",
 *       "status": "pending",
 *       "createdAt": "2025-01-20T10:00:00.000Z"
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse<InvitationsResponse>> {
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

/**
 * Interface para el request de crear invitación
 * @interface CreateInvitationRequest
 */
interface CreateInvitationRequest {
  email: string;
  role?: string;
}

/**
 * Interface para la respuesta de crear invitación
 * @interface CreateInvitationResponse
 */
interface CreateInvitationResponse {
  success?: boolean;
  message?: string;
  invitation?: {
    id: number;
    token: string;
    expiresAt: Date;
  };
  error?: string;
}

/**
 * POST /api/organizations/invitations
 * Crea una nueva invitación para unirse a la organización del usuario
 * 
 * @param {NextRequest} request - Request object de Next.js
 * @returns {Promise<NextResponse<CreateInvitationResponse>>} Resultado de la creación de invitación
 * 
 * @example
 * // Request
 * POST /api/organizations/invitations
 * Headers: {
 *   "Authorization": "Bearer <firebase_token>"
 * }
 * Body: {
 *   "email": "user@example.com",
 *   "role": "user"
 * }
 * 
 * // Response (200) - Éxito
 * {
 *   "success": true,
 *   "message": "Invitación creada exitosamente",
 *   "invitation": {
 *     "id": 1,
 *     "token": "abc123...",
 *     "expiresAt": "2025-01-27T10:00:00.000Z"
 *   }
 * }
 * 
 * // Response (400) - Usuario ya tiene organización
 * {
 *   "error": "El usuario ya pertenece a una organización"
 * }
 * 
 * // Response (403) - Sin organización
 * {
 *   "error": "No perteneces a ninguna organización"
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateInvitationResponse>> {
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
    const { email, role }: CreateInvitationRequest = await request.json();
    
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
    
    // Validar que el rol sea uno de los valores permitidos
    const validRoles = ['admin', 'service_client', 'delivery'] as const;
    type ValidRole = typeof validRoles[number];
    const isValidRole = (role: string): role is ValidRole => validRoles.includes(role as ValidRole);
    const assignedRole: ValidRole = (role && isValidRole(role)) ? role : 'service_client';
    
    const [invitation] = await db.insert(organizationInvitations).values({
      organizationId: organizationIdNumber,
      invitedBy: dbUser.id,
      invitedEmail: email,
      invitationToken: invitationToken,
      assignedRole: assignedRole,
      status: 'pending',
      expiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    }).$returningId();

    return NextResponse.json({
      success: true,
      message: 'Invitación creada exitosamente',
      invitation: {
        id: invitation.id,
        token: invitationToken,
        expiresAt: expiresAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error al crear invitación:', error);
    return NextResponse.json(
      { error: 'Error al crear invitación' },
      { status: 500 }
    );
  }
}