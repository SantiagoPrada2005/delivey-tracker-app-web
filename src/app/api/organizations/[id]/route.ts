/**
 * @fileoverview API route para manejar operaciones de organizaciones específicas
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Esta API route maneja operaciones sobre organizaciones específicas por ID,
 * incluyendo obtener información y actualizar datos de la organización.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/utils';
import { db } from '@/db';
import { organizations, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface GetOrganizationResponse {
  success: boolean;
  organization?: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
  };
  error?: string;
  code?: string;
}

interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  slug?: string;
}

interface UpdateOrganizationResponse {
  success: boolean;
  organization?: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
  };
  error?: string;
  code?: string;
}

/**
 * GET /api/organizations/[id]
 * Obtiene información de una organización específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<GetOrganizationResponse>> {
  try {
    // Obtener usuario autenticado
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<GetOrganizationResponse>;
    }
    
    const { user } = authResult;
    const { id } = await params;
    const organizationId = parseInt(id);

    if (isNaN(organizationId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID de organización inválido',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Verificar que el usuario pertenece a esta organización
    const [userRecord] = await db.select({
      organizationId: users.organizationId
    })
      .from(users)
      .where(eq(users.firebaseUid, user.uid))
      .limit(1);

    if (!userRecord || userRecord.organizationId !== organizationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No tienes acceso a esta organización',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Obtener la organización
    const [organization] = await db.select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      description: organizations.description,
      createdAt: organizations.createdAt
    })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Organización no encontrada',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      organization
    });
    
  } catch (error) {
    console.error('[Organizations] Error al obtener organización:', error);
    
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

/**
 * PUT /api/organizations/[id]
 * Actualiza información de una organización específica
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UpdateOrganizationResponse>> {
  try {
    // Obtener usuario autenticado
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<UpdateOrganizationResponse>;
    }
    
    const { user } = authResult;
    const { id } = await params;
    const organizationId = parseInt(id);

    if (isNaN(organizationId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID de organización inválido',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Verificar que el usuario pertenece a esta organización
    const [userRecord] = await db.select({
      organizationId: users.organizationId,
      role: users.role
    })
      .from(users)
      .where(eq(users.firebaseUid, user.uid))
      .limit(1);

    if (!userRecord || userRecord.organizationId !== organizationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No tienes acceso a esta organización',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Verificar que el usuario tiene permisos de administrador
    if (userRecord.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false,
          error: 'No tienes permisos para actualizar esta organización',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    // Obtener datos del cuerpo de la request
    const body: UpdateOrganizationRequest = await request.json();
    
    // Validar que al menos un campo está presente
    if (!body.name && !body.description && !body.slug) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Se requiere al menos un campo para actualizar',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Preparar datos para actualizar
    const updateData: Partial<typeof organizations.$inferInsert> = {};
    
    if (body.name) {
      if (body.name.trim().length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: 'El nombre no puede estar vacío',
            code: 'VALIDATION_ERROR'
          },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }
    
    if (body.slug) {
      // Verificar que el slug sea único (excluyendo la organización actual)
      const [existingOrg] = await db.select()
        .from(organizations)
        .where(
          and(
            eq(organizations.slug, body.slug),
            eq(organizations.id, organizationId)
          )
        )
        .limit(1);

      if (existingOrg && existingOrg.id !== organizationId) {
        return NextResponse.json(
          { 
            success: false,
            error: 'El slug ya está en uso',
            code: 'SLUG_EXISTS'
          },
          { status: 400 }
        );
      }
      
      updateData.slug = body.slug;
    }

    updateData.updatedAt = new Date();

    // Actualizar la organización
    await db.update(organizations)
      .set(updateData)
      .where(eq(organizations.id, organizationId));

    // Obtener la organización actualizada
    const [updatedOrganization] = await db.select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      description: organizations.description
    }).from(organizations)
    .where(eq(organizations.id, organizationId));

    return NextResponse.json({
      success: true,
      organization: updatedOrganization
    });
    
  } catch (error) {
    console.error('[Organizations] Error al actualizar organización:', error);
    
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