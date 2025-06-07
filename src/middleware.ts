import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase/admin';

// Configurar el runtime para usar Node.js en lugar de Edge Runtime
// Firebase Admin SDK no es compatible con Edge Runtime
export const runtime = 'nodejs';

// Configurar el matcher para el middleware
export const config = {
  matcher: [
    /*
     * Match specific protected routes only
     * Exclude public routes, API routes, static files, and favicon
     */
    '/dashboard/:path*',
    '/admin/:path*',
    '/clientes/:path*',
    '/pedidos/:path*',
    '/productos/:path*',
    '/repartidores/:path*',
    '/configuracion/:path*',
    '/notificaciones/:path*',
    '/perfil/:path*',
    '/organization/:path*'
  ],
};

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
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
    console.log('Token encontrado en cookie');
    return tokenFromCookie;
  }

  // Si no hay cookie, intentar obtener del header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    console.log('Token encontrado en header Authorization');
    return authHeader.substring(7); // Remover 'Bearer ' del inicio
  }

  console.log('No se encontró token en cookie ni en header');
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`Middleware ejecutándose para: ${pathname}`);
  
  // Rutas que no requieren verificación de organización
  const organizationExemptRoutes = [
    '/auth/login',
    '/auth/register', 
    '/auth/reset-password',
    '/organization/create',
    '/organization/invitations',
    '/organization/requests',
    '/api/auth/verify',
    '/api/auth/sync'
  ];
  
  // Permitir rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log(`Ruta pública permitida: ${pathname}`);
    return NextResponse.next();
  }
  
  // Extraer el token de Firebase
  const firebaseToken = extractFirebaseToken(request);
  
  // Si no hay token, redirigir o devolver error
  if (!firebaseToken) {
    console.log(`No hay token para la ruta: ${pathname}`);
    
    // Para rutas de API, devolver un error 401
    if (apiRoutes.some(route => pathname.startsWith(route))) {
      console.log('Devolviendo error 401 para ruta de API');
      return NextResponse.json(
        { 
          error: 'Token de autenticación requerido',
          code: 'AUTH_TOKEN_MISSING'
        },
        { status: 401 }
      );
    }
    
    // Para rutas normales, redirigir al login
    console.log('Redirigiendo al login');
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Verificar y decodificar el token de Firebase
  const decodedToken = await verifyFirebaseToken(firebaseToken);
  
  if (!decodedToken) {
    console.log(`Token inválido para la ruta: ${pathname}`);
    
    // Para rutas de API, devolver un error 401
    if (apiRoutes.some(route => pathname.startsWith(route))) {
      console.log('Devolviendo error 401 para ruta de API - token inválido');
      return NextResponse.json(
        { 
          error: 'Token de autenticación inválido',
          code: 'AUTH_TOKEN_INVALID'
        },
        { status: 401 }
      );
    }
    
    // Para rutas normales, redirigir al login
    console.log('Redirigiendo al login - token inválido');
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  console.log(`Token válido encontrado para: ${pathname}`);
  
  // Crear response con headers de usuario
  const response = NextResponse.next();
  
  // Agregar información del usuario a los headers para las API routes
  response.headers.set('x-user-id', decodedToken.uid);
  response.headers.set('x-user-email', decodedToken.email || '');
  response.headers.set('x-user-name', decodedToken.name || '');
  response.headers.set('x-user-verified', decodedToken.email_verified ? 'true' : 'false');
  response.headers.set('x-firebase-token', firebaseToken);
  
  // Verificar estado de organización para rutas protegidas
  if (!organizationExemptRoutes.some(route => pathname.startsWith(route))) {
    try {
      // Hacer una llamada interna a la API de organization-status
      const orgStatusUrl = new URL('/api/user/organization-status', request.url);
      const orgStatusRequest = new Request(orgStatusUrl, {
        method: 'GET',
        headers: {
          'x-user-id': decodedToken.uid,
          'x-user-email': decodedToken.email || '',
          'x-user-name': decodedToken.name || '',
          'x-user-verified': decodedToken.email_verified ? 'true' : 'false',
          'x-firebase-token': firebaseToken
        }
      });
      
      const orgStatusResponse = await fetch(orgStatusRequest);
      
      if (orgStatusResponse.ok) {
        const orgStatus = await orgStatusResponse.json();
        
        // Si el usuario no tiene organización, redirigir según su estado
        if (orgStatus.status !== 'HAS_ORGANIZATION') {
          console.log(`Usuario sin organización, estado: ${orgStatus.status}`);
          
          let redirectUrl: string;
          
          switch (orgStatus.status) {
            case 'PENDING_INVITATION':
              redirectUrl = '/organization/invitations';
              break;
            case 'PENDING_REQUEST':
              redirectUrl = '/organization/requests';
              break;
            case 'NO_ORGANIZATION':
            default:
              redirectUrl = '/organization/create';
              break;
          }
          
          console.log(`Redirigiendo a: ${redirectUrl}`);
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
      } else if (orgStatusResponse.status === 404) {
        // Usuario no encontrado en la base de datos - necesita sincronización
        console.log('Usuario no encontrado en BD, redirigiendo a crear organización');
        return NextResponse.redirect(new URL('/organization/create', request.url));
      } else {
        console.error('Error al verificar estado de organización:', orgStatusResponse.status);
        // Si hay un error de servidor, redirigir a crear organización como fallback
        if (orgStatusResponse.status >= 500) {
          console.log('Error de servidor, redirigiendo a crear organización como fallback');
          return NextResponse.redirect(new URL('/organization/create', request.url));
        }
      }
    } catch (error) {
      console.error('Error en verificación de organización:', error);
      // En caso de error de red, redirigir a crear organización como fallback
      console.log('Error de red, redirigiendo a crear organización como fallback');
      return NextResponse.redirect(new URL('/organization/create', request.url));
    }
  }
  
  return response;
}