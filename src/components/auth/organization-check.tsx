'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';

// Rutas que no requieren verificación de organización
const exemptRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/organization/create',
  '/organization/invitations',
  '/organization/requests',
];

interface OrganizationCheckProps {
  children: React.ReactNode;
}

export function OrganizationCheck({ children }: OrganizationCheckProps) {
  const { user, loading: authLoading } = useAuth();
  const { organizationStatus, checkingStatus, checkOrganizationStatus } = useOrganization();
  const pathname = usePathname();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Si la ruta está exenta, no hacer nada
    if (exemptRoutes.some(route => pathname.startsWith(route))) {
      return;
    }

    // Si hay usuario autenticado, verificar el estado de la organización
    if (user && !authLoading && !hasChecked) {
      checkOrganizationStatus();
      setHasChecked(true);
    }
  }, [user, authLoading, pathname, checkOrganizationStatus, hasChecked]);

  // Redirección del lado del cliente basada en el estado de la organización
  useEffect(() => {
    // Si la ruta está exenta, no redirigir
    if (exemptRoutes.some(route => pathname.startsWith(route))) {
      return;
    }

    // Si no hay usuario o está cargando, no hacer nada
    if (!user || authLoading || checkingStatus) {
      return;
    }

    // Si tenemos el estado de la organización, manejar redirecciones
    if (organizationStatus) {
      if (organizationStatus.hasPendingInvitations) {
        if (pathname !== '/organization/invitations') {
          console.log('[Client Redirect] Redirigiendo a invitaciones pendientes');
          router.push('/organization/invitations');
        }
      } else if (organizationStatus.hasPendingRequests) {
        if (pathname !== '/organization/requests') {
          console.log('[Client Redirect] Redirigiendo a solicitudes pendientes');
          router.push('/organization/requests');
        }
      } else if (!organizationStatus.hasOrganization) {
        if (pathname !== '/organization/create') {
          console.log('[Client Redirect] Redirigiendo a crear organización');
          router.push('/organization/create');
        }
      }
      // Si hasOrganization es true, el usuario tiene organización y puede acceder a todas las rutas
    }
  }, [organizationStatus, pathname, router, user, authLoading, checkingStatus]);

  // Mostrar loading mientras se verifica la organización
  if (user && !authLoading && checkingStatus && !exemptRoutes.some(route => pathname.startsWith(route))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}