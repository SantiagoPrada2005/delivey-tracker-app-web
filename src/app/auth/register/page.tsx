'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/register-form';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redireccionar si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  // Si está cargando, mostrar un estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar el formulario de registro
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Administrador de Pedidos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Crea una cuenta para comenzar a gestionar tus pedidos
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}