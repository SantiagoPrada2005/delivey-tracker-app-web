/**
 * @fileoverview API route para poblar la base de datos con datos de prueba
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Esta API route proporciona endpoints para poblar la base de datos con datos de prueba.
 * Solo está disponible en entornos de desarrollo por razones de seguridad.
 */
import { NextResponse } from 'next/server';
import { seed } from '@/db/seed';

/**
 * Interface para la respuesta del seed
 * @interface SeedResponse
 */
interface SeedResponse {
  success?: boolean;
  message?: string;
  error?: string;
  details?: string;
}

/**
 * POST /api/admin/seed
 * Ejecuta el script de seed para poblar la base de datos con datos de prueba
 * 
 * @returns {Promise<NextResponse<SeedResponse>>} Resultado de la operación de seed
 * 
 * @example
 * // Request
 * POST /api/admin/seed
 * 
 * // Response (200) - Éxito
 * {
 *   "success": true,
 *   "message": "🎉 Base de datos poblada exitosamente con datos de prueba"
 * }
 * 
 * // Response (403) - Producción
 * {
 *   "error": "Esta funcionalidad no está disponible en producción"
 * }
 * 
 * // Response (500) - Error
 * {
 *   "error": "Error al poblar la base de datos",
 *   "details": "Error message"
 * }
 */
export async function POST(): Promise<NextResponse<SeedResponse>> {
  // Solo permitir en desarrollo
  console.log(process.env.NODE_ENV)
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Esta funcionalidad no está disponible en producción' },
      { status: 403 }
    );
  }

  try {
    console.log('🌱 Iniciando seed desde API...');
    
    // Ejecutar el script de seed
    await seed();
    
    console.log('✅ Seed completado desde API');
    
    return NextResponse.json({
      success: true,
      message: '🎉 Base de datos poblada exitosamente con datos de prueba'
    });
  } catch (error) {
    console.error('❌ Error durante el seed desde API:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al poblar la base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * Interface para la respuesta de disponibilidad
 * @interface AvailabilityResponse
 */
interface AvailabilityResponse {
  message?: string;
  available?: boolean;
  error?: string;
}

/**
 * GET /api/admin/seed
 * Verifica la disponibilidad del endpoint de seed
 * 
 * @returns {Promise<NextResponse<AvailabilityResponse>>} Estado de disponibilidad del endpoint
 * 
 * @example
 * // Request
 * GET /api/admin/seed
 * 
 * // Response (200) - Desarrollo
 * {
 *   "message": "API de seed disponible. Usa POST para ejecutar el seed.",
 *   "available": true
 * }
 * 
 * // Response (403) - Producción
 * {
 *   "error": "Esta funcionalidad no está disponible en producción"
 * }
 */
export async function GET(): Promise<NextResponse<AvailabilityResponse>> {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Esta funcionalidad no está disponible en producción' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: 'API de seed disponible. Usa POST para ejecutar el seed.',
    available: true
  });
}