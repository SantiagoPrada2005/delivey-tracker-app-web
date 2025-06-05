import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/api/auth/verify',
];

// Rutas de API que deben verificar el token pero no redirigir
const apiRoutes = ['/api/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Obtener el token de la cookie de sesión
  const session = request.cookies.get('session')?.value;
  
  // Si no hay sesión y no es una ruta pública, redirigir al login
  if (!session) {
    // Para rutas de API, devolver un error 401
    if (apiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    // Para rutas normales, redirigir al login
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
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