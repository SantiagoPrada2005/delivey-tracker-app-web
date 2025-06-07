/**
 * @fileoverview Middleware de Next.js para autenticación y autorización
 * @version 2.0.0
 * @author Santiago Prada
 * @date 2025-06-06
 * 
 * @description
 * Middleware robusto que maneja:
 * - Autenticación con Firebase
 * - Verificación de estado de organización
 * - Redirecciones inteligentes
 * - Protección de rutas API y páginas
 * - Manejo de errores y casos edge
 * 
 * Diseñado siguiendo las mejores prácticas de Next.js 14+ App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase/admin';

// ============================================================================
// CONFIGURACIÓN DE RUTAS
// ============================================================================

/**
 * Rutas completamente públicas que no requieren autenticación
 */
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
] as const;

/**
 * Rutas de API que requieren autenticación pero manejan errores internamente
 */
const API_ROUTES = [
  '/api/auth/verify',
  '/api/auth/sync',
] as const;

// Nota: Las rutas protegidas se manejan dinámicamente en la función middleware

/**
 * Rutas relacionadas con la gestión de organizaciones
 */
const ORGANIZATION_ROUTES = [
  '/organization/create',
  '/organization/invitations',
  '/organization/requests',
] as const;

/**
 * Rutas que no requieren verificación de estado de organización
 * (usuario autenticado pero puede no tener organización)
 */
const ORGANIZATION_EXEMPT_ROUTES = [
  ...PUBLIC_ROUTES,
  ...API_ROUTES,
  ...ORGANIZATION_ROUTES,
] as const;

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface AuthenticatedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

interface OrganizationStatus {
  status: 'HAS_ORGANIZATION' | 'PENDING_INVITATION' | 'PENDING_REQUEST' | 'NO_ORGANIZATION';
  data?: {
    user: {
      id: number;
      email: string;
      organizationId: number | null;
      role: string;
    };
    organization?: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Extrae el token de Firebase de cookies o headers
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
  
  // Solo agregar callbackUrl si no es una ruta de organización
  if (!matchesRoute(destination, ORGANIZATION_ROUTES) && !matchesRoute(request.nextUrl.pathname, PUBLIC_ROUTES)) {
    url.searchParams.set('callbackUrl', encodeURIComponent(request.url));
  }
  
  return NextResponse.redirect(url);
}

/**
 * Verifica el estado de organización del usuario
 */
async function checkOrganizationStatus(
  request: NextRequest,
  user: AuthenticatedUser,
  token: string
): Promise<OrganizationStatus | null> {
  try {
    const orgStatusUrl = new URL('/api/user/organization-status', request.url);
    
    const response = await fetch(orgStatusUrl, {
      method: 'GET',
      headers: {
        'x-user-id': user.uid,
        'x-user-email': user.email,
        'x-user-name': user.name || '',
        'x-user-verified': user.emailVerified.toString(),
        'x-firebase-token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Organization status check failed: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking organization status:', error);
    return null;
  }
}

/**
 * Determina la redirección basada en el estado de organización
 */
function getOrganizationRedirect(status: OrganizationStatus['status']): string {
  switch (status) {
    case 'PENDING_INVITATION':
      return '/organization/invitations';
    case 'PENDING_REQUEST':
      return '/organization/requests';
    case 'NO_ORGANIZATION':
    default:
      return '/organization/create';
  }
}

/**
 * Crea headers de usuario para pasar a las rutas
 */
function createUserHeaders(user: AuthenticatedUser, token: string, organizationData?: { user: { organizationId: number | null; role: string; id: number } }) {
  const headers: Record<string, string> = {
    'x-user-id': user.uid,
    'x-user-email': user.email,
    'x-user-name': user.name || '',
    'x-user-verified': user.emailVerified.toString(),
    'x-firebase-token': token,
  };
  
  // Agregar información de organización si está disponible
  if (organizationData?.user) {
    if (organizationData.user.organizationId) {
      headers['x-user-organization'] = organizationData.user.organizationId.toString();
    }
    headers['x-user-role'] = organizationData.user.role;
    headers['x-user-db-id'] = organizationData.user.id.toString();
  }
  
  return headers;
}

// ============================================================================
// MIDDLEWARE PRINCIPAL
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Processing: ${pathname}`);

  // ========================================
  // 1. RUTAS PÚBLICAS - Permitir sin verificación
  // ========================================
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    console.log(`[Middleware] Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  // ========================================
  // 2. EXTRACCIÓN Y VALIDACIÓN DE TOKEN
  // ========================================
  const firebaseToken = extractFirebaseToken(request);
  
  if (!firebaseToken) {
    console.log(`[Middleware] No token found for: ${pathname}`);
    
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
    console.error(`[Middleware] Token verification error:`, error);
    decodedToken = null;
  }
  
  if (!decodedToken) {
    console.log(`[Middleware] Invalid token for: ${pathname}`);
    
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

  console.log(`[Middleware] Authenticated user: ${user.email}`);

  // ========================================
  // 5. RUTAS QUE NO REQUIEREN ORGANIZACIÓN
  // ========================================
  if (matchesRoute(pathname, ORGANIZATION_EXEMPT_ROUTES)) {
    console.log(`[Middleware] Organization exempt route: ${pathname}`);
    
    const response = NextResponse.next();
    
    // Agregar headers de usuario
    Object.entries(createUserHeaders(user, firebaseToken)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }

  // ========================================
  // 6. VERIFICACIÓN DE ESTADO DE ORGANIZACIÓN
  // ========================================
  const organizationStatus = await checkOrganizationStatus(request, user, firebaseToken);
  
  if (!organizationStatus) {
    console.log(`[Middleware] Failed to check organization status, redirecting to create`);
    
    // Si no podemos verificar el estado, redirigir a crear organización como fallback
    if (pathname.startsWith('/api/')) {
      return createApiErrorResponse(
        'Error al verificar estado de organización',
        'ORGANIZATION_CHECK_FAILED',
        503
      );
    }
    
    return createRedirectResponse(request, '/organization/create');
  }

  // ========================================
  // 7. LÓGICA DE REDIRECCIÓN BASADA EN ORGANIZACIÓN
  // ========================================
  if (organizationStatus.status !== 'HAS_ORGANIZATION') {
    const redirectPath = getOrganizationRedirect(organizationStatus.status);
    
    console.log(`[Middleware] User needs organization setup: ${organizationStatus.status} -> ${redirectPath}`);
    
    // Si ya está en la ruta correcta, permitir continuar
    if (pathname.startsWith(redirectPath)) {
      const response = NextResponse.next();
      Object.entries(createUserHeaders(user, firebaseToken, organizationStatus.data ? { user: organizationStatus.data.user } : undefined)).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }
    
    // Para APIs, devolver error específico
    if (pathname.startsWith('/api/')) {
      return createApiErrorResponse(
        'Usuario requiere configuración de organización',
        `ORGANIZATION_${organizationStatus.status}`,
        403
      );
    }
    
    // Redirigir a la ruta apropiada
    return createRedirectResponse(request, redirectPath);
  }

  // ========================================
  // 8. USUARIO CON ORGANIZACIÓN - Permitir acceso
  // ========================================
  console.log(`[Middleware] User has organization, allowing access to: ${pathname}`);
  
  const response = NextResponse.next();
  
  // Agregar headers de usuario y organización
  Object.entries(createUserHeaders(user, firebaseToken, organizationStatus.data ? { user: organizationStatus.data.user } : undefined)).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Agregar información de organización si está disponible
  if (organizationStatus.data?.organization) {
    response.headers.set('x-organization-id', organizationStatus.data.organization.id.toString());
    response.headers.set('x-organization-name', organizationStatus.data.organization.name);
    response.headers.set('x-organization-slug', organizationStatus.data.organization.slug);
  }
  
  return response;
}

// ============================================================================
// CONFIGURACIÓN DEL MATCHER
// ============================================================================

export const config = {
  runtime: 'nodejs',
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * - api routes que manejan auth internamente
     * - archivos estáticos (_next/static)
     * - imágenes (_next/image)
     * - favicon y otros assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};