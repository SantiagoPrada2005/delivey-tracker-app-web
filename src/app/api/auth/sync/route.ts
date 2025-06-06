/**
 * @fileoverview API route para sincronizar usuarios de Firebase Auth con la base de datos
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Esta API route maneja la sincronización automática de usuarios entre Firebase Auth
 * y la tabla users de la base de datos, incluyendo creación y actualización de registros.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase/admin';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

interface SyncUserRequest {
  firebaseUid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  photoURL?: string;
  providerId?: string;
}

interface SyncUserResponse {
  success: boolean;
  user?: {
    id: number;
    firebaseUid: string;
    email: string;
    organizationId: number | null;
    role: string;
    isNewUser: boolean;
  };
  error?: string;
  code?: string;
}

/**
 * POST /api/auth/sync
 * Sincroniza un usuario de Firebase Auth con la base de datos
 */
export async function POST(request: NextRequest): Promise<NextResponse<SyncUserResponse>> {
  try {
    // Obtener el token del header de autorización
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Token no proporcionado o formato inválido',
          code: 'AUTH_TOKEN_MISSING'
        },
        { status: 401 }
      );
    }
    
    // Extraer y verificar el token
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyFirebaseToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Token inválido o expirado',
          code: 'AUTH_TOKEN_INVALID'
        },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la request
    const body: SyncUserRequest = await request.json();
    
    // Validar que el UID del token coincida con el del cuerpo
    if (decodedToken.uid !== body.firebaseUid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'El UID del token no coincide con el proporcionado',
          code: 'UID_MISMATCH'
        },
        { status: 400 }
      );
    }

    // Validar campos requeridos
    if (!body.email || !body.firebaseUid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email y firebaseUid son requeridos',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Buscar usuario existente
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.firebaseUid, body.firebaseUid))
      .limit(1);

    let user;
    let isNewUser = false;

    if (existingUser.length === 0) {
      // Crear nuevo usuario
      const newUserData = {
        firebaseUid: body.firebaseUid,
        email: body.email,
        displayName: body.displayName || null,
        emailVerified: body.emailVerified,
        photoURL: body.photoURL || null,
        providerId: body.providerId || null,
        role: 'N/A' as const,
        isActive: true,
        organizationId: null,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // MySQL no soporta .returning(), usamos .$returningId() para obtener el ID insertado
      const insertResult = await db.insert(users)
        .values(newUserData)
        .$returningId();
      
      // Consultamos el usuario recién creado con el ID obtenido
      const [createdUser] = await db.select({
          id: users.id,
          firebaseUid: users.firebaseUid,
          email: users.email,
          organizationId: users.organizationId,
          role: users.role
        })
        .from(users)
        .where(sql`${users.id} = ${insertResult[0].id}`);
      

      user = createdUser;
      isNewUser = true;
      
      console.log(`[Auth Sync] Nuevo usuario creado: ${body.email} (${body.firebaseUid})`);
    } else {
      // Actualizar usuario existente
      const updateData = {
        email: body.email,
        displayName: body.displayName || existingUser[0].displayName,
        emailVerified: body.emailVerified,
        photoURL: body.photoURL || existingUser[0].photoURL,
        providerId: body.providerId || existingUser[0].providerId,
        lastLoginAt: new Date(),
        updatedAt: new Date()
      };

      await db.update(users)
        .set(updateData)
        .where(eq(users.firebaseUid, body.firebaseUid));

      // Obtener usuario actualizado
      const [updatedUser] = await db.select({
        id: users.id,
        firebaseUid: users.firebaseUid,
        email: users.email,
        organizationId: users.organizationId,
        role: users.role
      })
        .from(users)
        .where(eq(users.firebaseUid, body.firebaseUid))
        .limit(1);

      user = updatedUser;
      
      console.log(`[Auth Sync] Usuario actualizado: ${body.email} (${body.firebaseUid})`);
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        email: user.email || '', // Aseguramos que email sea siempre un string
        isNewUser
      }
    });
    
  } catch (error) {
    console.error('[Auth Sync] Error al sincronizar usuario:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/sync
 * Información sobre el endpoint de sincronización
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      message: 'Endpoint de sincronización de usuarios disponible. Usa POST para sincronizar.',
      version: '1.0.0'
    },
    { status: 200 }
  );
}