'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { NoOrganizationFlow } from '@/components/organization/no-organization-flow';
import { OrganizationLoading } from '@/components/organization/organization-loading';
import { PendingInvitationsFlow } from '@/components/organization/pending-invitations-flow';
import { PendingRequestsFlow } from '@/components/organization/pending-requests-flow';
import { useOrganizationFlow } from '@/contexts/organization-flow-context';

// Rutas que no requieren verificación de organización
const exemptRoutes = [
  '/',
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
  const { checkingStatus } = useOrganization();
  const { currentStep, isFlowActive, refreshOrganizationStatus } = useOrganizationFlow();
  const pathname = usePathname();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Si la ruta está exenta, no hacer nada
    if (exemptRoutes.some(route => pathname.startsWith(route))) {
      return;
    }

    // Si hay usuario autenticado, verificar el estado de la organización
    if (user && !authLoading && !hasChecked) {
      refreshOrganizationStatus();
      setHasChecked(true);
    }
  }, [user, authLoading, pathname, refreshOrganizationStatus, hasChecked]);

  // Mostrar loading mientras se verifica la organización
  if (user && !authLoading && checkingStatus && !exemptRoutes.some(route => pathname.startsWith(route))) {
    return <OrganizationLoading />;
  }

  // Mostrar los flujos apropiados según el estado de la organización
  if (user && !authLoading && isFlowActive && !exemptRoutes.some(route => pathname.startsWith(route))) {
    switch (currentStep) {
      case 'no-organization':
        return <NoOrganizationFlow />;
      case 'pending-invitation':
        return <PendingInvitationsFlow />;
      case 'pending-request':
        return <PendingRequestsFlow />;
      case 'loading':
        return <OrganizationLoading />;
      case 'has-organization':
      default:
        // El usuario tiene organización, mostrar el contenido normal
        break;
    }
  }

  return <>{children}</>;
}