import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase/admin';

// Middleware para verificar tokens de Firebase
export async function POST(request: NextRequest) {
  try {
    // Obtener el token del encabezado de autorización
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token no proporcionado o formato inválido' },
        { status: 401 }
      );
    }
    
    // Extraer el token
    const token = authHeader.split('Bearer ')[1];
    
    // Verificar el token con Firebase Admin
    const decodedToken = await verifyFirebaseToken(token);
    
    // Verificar si el token es válido
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }
    
    // Devolver la información del usuario decodificada
    return NextResponse.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      // Puedes incluir claims personalizados si los tienes
      // role: decodedToken.role,
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    
    // Manejar el error como tipo unknown
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { error: 'Token inválido o expirado', details: errorMessage },
      { status: 401 }
    );
  }
}

// Método GET para verificar que la ruta existe
export async function GET() {
  return NextResponse.json(
    { message: 'Ruta de verificación de autenticación disponible. Usa POST para verificar tokens.' },
    { status: 200 }
  );
}