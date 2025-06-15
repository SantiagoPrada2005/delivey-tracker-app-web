import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase/admin';

// ============================================================================
// CONFIGURACIÓN DE RUTAS
// ============================================================================

/**
 * Rutas públicas que no requieren autenticación
 */
const PUBLIC_ROUTES = [
  '/landing',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/api/auth/verify',
] as const;

/**
 * Rutas de API que requieren autenticación
 */
//const API_ROUTES = ['/api'] as const;

// ============================================================================
// INTERFACES
// ============================================================================

interface AuthenticatedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Extrae el token de Firebase de la request
 */
function extractFirebaseToken(request: NextRequest): string | null {
  // Prioridad 1: Cookie 'firebaseToken'
  const tokenFromCookie = request.cookies.get('firebaseToken')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // Prioridad 2: Header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Verifica si una ruta coincide con algún patrón
 */
function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

/**
 * Crea una respuesta de error JSON para APIs
 */
function createApiErrorResponse(message: string, code: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

/**
 * Crea una redirección con callback URL
 */
function createRedirectResponse(request: NextRequest, destination: string) {
  const url = new URL(destination, request.url);
  
  // Agregar callbackUrl para rutas protegidas
  if (!matchesRoute(request.nextUrl.pathname, PUBLIC_ROUTES)) {
    url.searchParams.set('callbackUrl', encodeURIComponent(request.url));
  }
  
  return NextResponse.redirect(url);
}

/**
 * Crea headers de usuario para pasar a las rutas
 */
function createUserHeaders(user: AuthenticatedUser, token: string) {
  return {
    'x-user-id': user.uid,
    'x-user-email': user.email,
    'x-user-name': user.name || '',
    'x-user-verified': user.emailVerified.toString(),
    'x-firebase-token': token,
  };
}

// ============================================================================
// MIDDLEWARE PRINCIPAL
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Auth Middleware] Processing: ${pathname}`);

  // ========================================
  // 1. RUTAS PÚBLICAS - Permitir sin verificación
  // ========================================
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    console.log(`[Auth Middleware] Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  // ========================================
  // 2. EXTRACCIÓN Y VALIDACIÓN DE TOKEN
  // ========================================
  const firebaseToken = extractFirebaseToken(request);
  
  if (!firebaseToken) {
    console.log(`[Auth Middleware] No token found for: ${pathname}`);
    
    // Para APIs, devolver error JSON
    if (pathname.startsWith('/api/')) {
      return createApiErrorResponse(
        'Token de autenticación requerido',
        'AUTH_TOKEN_MISSING',
        401
      );
    }
    
    // Para páginas, redirigir al login
    return createRedirectResponse(request, '/auth/login');
  }

  // ========================================
  // 3. VERIFICACIÓN DE TOKEN
  // ========================================
  let decodedToken;
  try {
    decodedToken = await verifyFirebaseToken(firebaseToken);
  } catch (error) {
    console.error(`[Auth Middleware] Token verification error:`, error);
    decodedToken = null;
  }
  
  if (!decodedToken) {
    console.log(`[Auth Middleware] Invalid token for: ${pathname}`);
    
    // Para APIs, devolver error JSON
    if (pathname.startsWith('/api/')) {
      return createApiErrorResponse(
        'Token de autenticación inválido o expirado',
        'AUTH_TOKEN_INVALID',
        401
      );
    }
    
    // Para páginas, redirigir al login
    return createRedirectResponse(request, '/auth/login');
  }

  // ========================================
  // 4. USUARIO AUTENTICADO - Crear objeto usuario
  // ========================================
  const user: AuthenticatedUser = {
    uid: decodedToken.uid,
    email: decodedToken.email || '',
    emailVerified: decodedToken.email_verified || false,
    name: decodedToken.name,
  };

  console.log(`[Auth Middleware] Authenticated user: ${user.email}`);

  // ========================================
  // 5. PERMITIR ACCESO CON HEADERS DE USUARIO
  // ========================================
  const response = NextResponse.next();
  
  // Agregar headers de usuario para todas las rutas autenticadas
  Object.entries(createUserHeaders(user, firebaseToken)).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// ============================================================================
// CONFIGURACIÓN DEL MATCHER
// ============================================================================

export const config = {
  runtime: 'nodejs',
  matcher: [
    /*
     * Coincidir con todas las rutas excepto archivos estáticos
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:jpg|jpeg|gif|png|svg|ico|webp)).*)',
  ],
};