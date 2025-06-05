'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Loader2, Database, CheckCircle, XCircle } from 'lucide-react';

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message || 'Base de datos poblada exitosamente' });
      } else {
        setResult({ success: false, message: data.error || 'Error al poblar la base de datos' });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Administración de Base de Datos
            </CardTitle>
            <CardDescription>
              Página de administración para poblar la base de datos con datos de prueba.
              <br />
              <strong className="text-red-600">⚠️ ADVERTENCIA:</strong> Esta acción eliminará todos los datos existentes y los reemplazará con datos de prueba.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Datos que se crearán:
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• 2 organizaciones (Restaurante El Buen Sabor, Pizzería Don Luigi)</li>
                <li>• 3 permisos de usuario</li>
                <li>• 3 usuarios</li>
                <li>• 3 clientes</li>
                <li>• 5 productos</li>
                <li>• 3 repartidores</li>
                <li>• 3 pedidos con detalles</li>
                <li>• 3 asignaciones de pedido</li>
              </ul>
            </div>

            <Button 
              onClick={handleSeed} 
              disabled={isLoading}
              className="w-full"
              variant="destructive"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Poblando base de datos...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Poblar Base de Datos
                </>
              )}
            </Button>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                  : 'border-red-200 bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <p className={result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                    {result.message}
                  </p>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              <p>Esta página está disponible solo en desarrollo.</p>
              <p>Ruta: /admin/seed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}