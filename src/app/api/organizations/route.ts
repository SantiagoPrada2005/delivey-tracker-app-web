/**
 * @fileoverview API route para manejar operaciones de organizaciones
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Esta API route maneja la creación y listado de organizaciones,
 * incluyendo la asignación automática del usuario como administrador.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/utils';
import { db } from '@/db';
import { organizations, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAllOrganizations } from '@/lib/database';

interface CreateOrganizationRequest {
  name: string;
  description?: string;
  slug?: string;
}

interface CreateOrganizationResponse {
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

interface ListOrganizationsResponse {
  success: boolean;
  organizations?: Array<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
  }>;
  error?: string;
  code?: string;
}

/**
 * Genera un slug único basado en el nombre de la organización
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .trim()
    .substring(0, 50); // Limitar longitud
}

/**
 * POST /api/organizations
 * Crea una nueva organización y asigna al usuario como administrador
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateOrganizationResponse>> {
  try {
    // Obtener usuario autenticado
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<CreateOrganizationResponse>;
    }
    
    const { user } = authResult;

    // Verificar que el usuario no tenga ya una organización
    const [existingUser] = await db.select({
      organizationId: users.organizationId
    })
      .from(users)
      .where(eq(users.firebaseUid, user.uid))
      .limit(1);

    if (existingUser?.organizationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'El usuario ya pertenece a una organización',
          code: 'USER_ALREADY_HAS_ORGANIZATION'
        },
        { status: 400 }
      );
    }

    // Obtener datos del cuerpo de la request
    const body: CreateOrganizationRequest = await request.json();
    
    // Validar campos requeridos
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'El nombre de la organización es requerido',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Generar slug si no se proporciona
    const slug = body.slug || generateSlug(body.name);

    // Verificar que el slug sea único
    const [existingOrg] = await db.select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (existingOrg) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Ya existe una organización con ese nombre o slug',
          code: 'ORGANIZATION_SLUG_EXISTS'
        },
        { status: 400 }
      );
    }

    // Crear la organización
    await db.insert(organizations)
      .values({
        name: body.name.trim(),
        slug: slug,
        description: body.description?.trim() || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

    // Obtener la organización recién creada
    const newOrganization = await db.query.organizations.findFirst({
      where: eq(organizations.slug, slug)
    });

    if (!newOrganization) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Error al crear la organización' 
        },
        { status: 500 }
      );
    }

    // Asignar el usuario como administrador de la organización
    await db.update(users)
      .set({
        organizationId: newOrganization.id,
        role: 'admin',
        updatedAt: new Date()
      })
      .where(eq(users.firebaseUid, user.uid));

    console.log(`[Organizations] Nueva organización creada: ${newOrganization.name} por ${user.email}`);

    return NextResponse.json({
      success: true,
      organization: newOrganization as { id: number; name: string; slug: string; description: string | null; }
    });
    
  } catch (error) {
    console.error('[Organizations] Error al crear organización:', error);
    
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
 * GET /api/organizations
 * Lista las organizaciones (solo para usuarios autenticados)
 */
export async function GET(request: NextRequest): Promise<NextResponse<ListOrganizationsResponse>> {
  try {
    // Obtener usuario autenticado
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult as NextResponse<ListOrganizationsResponse>;
    }
    
    const { user } = authResult; // eslint-disable-line @typescript-eslint/no-unused-vars

    // Usar la función existente para mantener compatibilidad
    const organizations = await getAllOrganizations();

    return NextResponse.json({
      success: true,
      organizations: organizations as { id: number; name: string; slug: string; description: string | null; createdAt: Date; }[]
    });
    
  } catch (error) {
    console.error('[Organizations] Error al listar organizaciones:', error);
    
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