import { NextRequest, NextResponse } from 'next/server';
import { getCategoriaById, updateCategoria, deleteCategoria } from '@/lib/database';
import { requireAuth } from '@/lib/auth/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoriaId = parseInt(id);
    
    if (isNaN(categoriaId)) {
      return NextResponse.json({ error: 'ID de categoría inválido' }, { status: 400 });
    }

    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    if (!user.organizationId) {
      return NextResponse.json({ error: 'Usuario no pertenece a ninguna organización' }, { status: 403 });
    }

    const categoria = await getCategoriaById(categoriaId, user.organizationId);
    if (!categoria || categoria.length === 0) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    return NextResponse.json(categoria[0]);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoriaId = parseInt(id);
    
    if (isNaN(categoriaId)) {
      return NextResponse.json({ error: 'ID de categoría inválido' }, { status: 400 });
    }

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

    await updateCategoria(categoriaId, { nombre, descripcion }, user.organizationId);
    
    return NextResponse.json({ id: categoriaId, nombre, descripcion });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoriaId = parseInt(id);
    
    if (isNaN(categoriaId)) {
      return NextResponse.json({ error: 'ID de categoría inválido' }, { status: 400 });
    }

    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    if (!user.organizationId) {
      return NextResponse.json({ error: 'Usuario no pertenece a ninguna organización' }, { status: 403 });
    }

    // Verificación de permisos removida - se asume que el usuario autenticado puede gestionar categorías

    await deleteCategoria(categoriaId, user.organizationId);
    
    return NextResponse.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}