import { NextRequest, NextResponse } from 'next/server';
import { getCategoriasByOrganization, createCategoria } from '@/lib/database';
import { requireAuth } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    if (!user.organizationId) {
      return NextResponse.json({ error: 'Usuario no pertenece a ninguna organización' }, { status: 403 });
    }

    const categorias = await getCategoriasByOrganization(user.organizationId);
    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    if (!user.organizationId) {
      return NextResponse.json({ error: 'Usuario no pertenece a ninguna organización' }, { status: 403 });
    }

    // Verificación de permisos removida - se asume que el usuario autenticado puede gestionar categorías

    const body = await request.json();
    const { nombre, descripcion } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    const categoria = await createCategoria(
      { nombre, descripcion },
      user.organizationId
    );

    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}