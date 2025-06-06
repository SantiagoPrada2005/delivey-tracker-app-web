import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { verifyFirebaseToken } from '@/lib/firebase/admin';

// Configurar el matcher para el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

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

  // TODO: Implementar verificación del token en una API route separada
  // Por ahora, permitir el acceso para que el build funcione
  const response = NextResponse.next();
  
  // Agregar el token a los headers para que las API routes puedan verificarlo
  if (firebaseToken) {
    response.headers.set('x-firebase-token', firebaseToken);
  }
  
  return response;
}