import { NextResponse } from 'next/server';
import { seed } from '@/db/seed';

export async function POST() {
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

// Método GET para verificar que la ruta existe
export async function GET() {
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