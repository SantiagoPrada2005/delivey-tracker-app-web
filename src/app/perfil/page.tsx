'use client';

import { useAuth } from '@/hooks/useAuth';
import { ProfileForm } from '@/components/auth/profile-form';

export default function ProfilePage() {
  const { loading } = useAuth();

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mi perfil</h1>
        <ProfileForm />
      </div>
    </div>
  );
}