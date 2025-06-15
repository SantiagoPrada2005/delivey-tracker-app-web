import { NextRequest, NextResponse } from 'next/server';

// Log de carga del módulo middleware
console.log('[Middleware] 🚀 Módulo middleware.ts cargado - Timestamp:', new Date().toISOString());
console.log('[Middleware] 📍 Ubicación del archivo: /middleware.ts (raíz del proyecto)');
console.log('[Middleware] 🔧 Next.js versión: 15.3.3');
console.log('[Middleware] ⚠️  Autenticación deshabilitada - Las APIs manejarán la autenticación directamente');

// ============================================================================
// MIDDLEWARE PRINCIPAL
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[Middleware][${requestId}] Procesando ruta: ${pathname}`);
  console.log(`[Middleware][${requestId}] Método: ${request.method}`);
  console.log(`[Middleware][${requestId}] ⚠️  Autenticación deshabilitada - Pasando request sin verificación`);
  
  // Permitir todas las requests sin verificación de autenticación
  // La autenticación será manejada directamente por las APIs
  return NextResponse.next();
}

// ============================================================================
// CONFIGURACIÓN DEL MATCHER
// ============================================================================

/**
 * Configuración del middleware de Next.js
 * 
 * NOTA: Middleware simplificado sin autenticación.
 * Solo registra las requests para debugging.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};

// Log de inicialización del middleware
console.log('[Middleware Config] Middleware configurado sin autenticación');
console.log('[Middleware Config] Las APIs manejarán la autenticación directamente');
console.log('[Middleware Config] Archivo middleware.ts cargado exitosamente');