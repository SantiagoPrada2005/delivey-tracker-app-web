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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Logs de depuración
  console.log('🔍 OrganizationCheck - Estado actual:', {
    user: !!user,
    authLoading,
    checkingStatus,
    currentStep,
    isFlowActive,
    pathname,
    hasChecked,
    isExemptRoute: exemptRoutes.some(route => pathname.startsWith(route)),
    exemptRoutes,
    matchingExemptRoute: exemptRoutes.find(route => pathname.startsWith(route))
  });

  useEffect(() => {
    // Si la ruta está exenta, no hacer nada
    if (exemptRoutes.some(route => pathname.startsWith(route))) {
      console.log('📍 OrganizationCheck - Ruta exenta, no verificar organización');
      setIsInitialLoad(false);
      return;
    }

    // Si hay usuario autenticado, verificar el estado de la organización
    if (user && !authLoading && !hasChecked) {
      console.log('🔄 OrganizationCheck - Refrescando estado de organización');
      refreshOrganizationStatus();
      setHasChecked(true);
      setIsInitialLoad(false);
    } else if (!user && !authLoading) {
      console.log('👤 OrganizationCheck - No hay usuario autenticado');
      setIsInitialLoad(false);
    }
  }, [user, authLoading, hasChecked, pathname, refreshOrganizationStatus]);

  // Resetear hasChecked cuando cambia el usuario
  useEffect(() => {
    if (!user) {
      setHasChecked(false);
    }
  }, [user]);

  // Mostrar loading durante la carga inicial o mientras se verifica la organización
  if (isInitialLoad || (user && !authLoading && checkingStatus && !exemptRoutes.some(route => pathname.startsWith(route)))) {
    console.log('⏳ OrganizationCheck - Mostrando loading');
    return <OrganizationLoading />;
  }

  // Si no hay usuario autenticado, mostrar el contenido normal
  if (!user) {
    console.log('👤 OrganizationCheck - Sin usuario, mostrando children');
    return <>{children}</>;
  }

  // Mostrar los flujos apropiados según el estado de la organización
  // Esto incluye el caso donde se recibe un 401 con estado NO_ORGANIZATION
  if (user && !authLoading && isFlowActive && !exemptRoutes.some(route => pathname.startsWith(route))) {
    console.log('🎯 OrganizationCheck - Evaluando flujo activo, currentStep:', currentStep);
    switch (currentStep) {
      case 'no-organization':
        console.log('🚫 OrganizationCheck - Renderizando NoOrganizationFlow');
        // Renderizar NoOrganizationFlow cuando:
        // - El usuario no tiene organización
        // - Se recibe error 401 con estado NO_ORGANIZATION
        // - Cualquier otro caso que resulte en estado NO_ORGANIZATION
        return <NoOrganizationFlow />;
      case 'pending-invitation':
        console.log('📧 OrganizationCheck - Renderizando PendingInvitationsFlow');
        return <PendingInvitationsFlow />;
      case 'pending-request':
        console.log('📝 OrganizationCheck - Renderizando PendingRequestsFlow');
        return <PendingRequestsFlow />;
      case 'loading':
        console.log('⏳ OrganizationCheck - Renderizando OrganizationLoading (desde switch)');
        return <OrganizationLoading />;
      case 'has-organization':
      default:
        console.log('✅ OrganizationCheck - Usuario tiene organización, mostrando children');
        // El usuario tiene organización, mostrar el contenido normal
        break;
    }
  } else {
    console.log('🔄 OrganizationCheck - Condiciones no cumplidas para flujo activo:', {
      hasUser: !!user,
      authLoading,
      isFlowActive,
      isExemptRoute: exemptRoutes.some(route => pathname.startsWith(route))
    });
  }

  console.log('📄 OrganizationCheck - Mostrando children por defecto');
  return <>{children}</>;
}