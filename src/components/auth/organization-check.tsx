'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';

// Rutas que no requieren verificación de organización
const exemptRoutes = [
  '/login',
  '/register',
  '/organization/create',
  '/organization/invitations',
  '/organization/requests'
];

export function OrganizationCheck({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { checkOrganizationStatus } = useOrganization();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // No verificar en rutas exentas
    if (exemptRoutes.some(route => pathname?.startsWith(route))) {
      return;
    }

    // Si no hay usuario autenticado y ya cargó la autenticación, redirigir a login
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Si hay usuario autenticado, verificar su estado de organización
    if (user && !authLoading) {
      checkOrganizationStatus();
    }
  }, [user, authLoading, pathname, router, checkOrganizationStatus]);

  // Si está en una ruta exenta, mostrar el contenido sin verificación
  if (exemptRoutes.some(route => pathname?.startsWith(route))) {
    return <>{children}</>;
  }

  // Mostrar el contenido cuando no está cargando
  return <>{children}</>;
}