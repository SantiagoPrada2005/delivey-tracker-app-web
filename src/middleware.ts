import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase/admin';

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/api/auth/verify',
];

// Rutas de API que deben verificar el token pero no redirigir
const apiRoutes = ['/api/'];

/**
 * Extrae el token de Firebase de las cookies o headers de autorización
 */
function extractFirebaseToken(request: NextRequest): string | null {
  // Primero intentar obtener el token de la cookie 'firebaseToken'
  const tokenFromCookie = request.cookies.get('firebaseToken')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // Si no hay cookie, intentar obtener del header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remover 'Bearer ' del inicio
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Extraer el token de Firebase
  const firebaseToken = extractFirebaseToken(request);
  
  // Si no hay token, redirigir o devolver error
  if (!firebaseToken) {
    // Para rutas de API, devolver un error 401
    if (apiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.json(
        { 
          error: 'Token de autenticación requerido',
          code: 'AUTH_TOKEN_MISSING'
        },
        { status: 401 }
      );
    }
    
    // Para rutas normales, redirigir al login
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Verificar el token de Firebase
  try {
    const decodedToken = await verifyFirebaseToken(firebaseToken);
    
    if (!decodedToken) {
      // Token inválido o expirado
      if (apiRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.json(
          { 
            error: 'Token de autenticación inválido o expirado',
            code: 'AUTH_TOKEN_INVALID'
          },
          { status: 401 }
        );
      }
      
      // Para rutas normales, redirigir al login
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      url.searchParams.set('error', 'token_expired');
      return NextResponse.redirect(url);
    }

    // Token válido - agregar información del usuario a los headers para las rutas de API
    const response = NextResponse.next();
    
    // Agregar información del usuario decodificada a los headers para que esté disponible en las API routes
    response.headers.set('x-user-id', decodedToken.uid);
    response.headers.set('x-user-email', decodedToken.email || '');
    response.headers.set('x-user-name', decodedToken.name || '');
    response.headers.set('x-user-verified', decodedToken.email_verified ? 'true' : 'false');
    
    // Agregar claims personalizados si existen
    if (decodedToken.role) {
      response.headers.set('x-user-role', decodedToken.role as string);
    }
    if (decodedToken.organization_id) {
      response.headers.set('x-user-organization', decodedToken.organization_id as string);
    }
    
    return response;
    
  } catch (error) {
    console.error('[Middleware] Error verificando token de Firebase:', error);
    
    // Error en la verificación del token
    if (apiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.json(
        { 
          error: 'Error interno de autenticación',
          code: 'AUTH_VERIFICATION_ERROR'
        },
        { status: 500 }
      );
    }
    
    // Para rutas normales, redirigir al login
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    url.searchParams.set('error', 'auth_error');
    return NextResponse.redirect(url);
  }
}

// Configurar el matcher para que el middleware se ejecute solo en las rutas especificadas
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api/auth/verify (para evitar bucles de redirección)
     * 2. /_next (archivos estáticos de Next.js)
     * 3. /favicon.ico, /images/, etc. (archivos estáticos)
     */
    '/((?!_next|favicon.ico|images|fonts|public|assets).*)',
  ],
};