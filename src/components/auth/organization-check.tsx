'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { NoOrganizationFlow } from '@/components/organization/no-organization-flow';
import { OrganizationLoading } from '@/components/organization/organization-loading';
import { PendingInvitationsFlow } from '@/components/organization/pending-invitations-flow';
import { PendingRequestsFlow } from '@/components/organization/pending-requests-flow';
import { useOrganizationFlow } from '@/contexts/organization-flow-context';
import { UserMenu } from '@/components/auth/user-menu';

// Rutas que no requieren verificación de organización
const exemptRoutes = [
  '/landing',
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
  const router = useRouter();
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

    // Si no hay usuario autenticado y no estamos cargando, redirigir a login
    if (!user && !authLoading) {
      console.log('👤 OrganizationCheck - No hay usuario autenticado, redirigiendo a login');
      router.push('/auth/login');
      return;
    }

    // Si hay usuario autenticado, verificar el estado de la organización
    if (user && !authLoading && !hasChecked) {
      console.log('🔄 OrganizationCheck - Refrescando estado de organización');
      refreshOrganizationStatus();
      setHasChecked(true);
      setIsInitialLoad(false);
    }
  }, [user, authLoading, hasChecked, pathname, refreshOrganizationStatus, router]);

  // Resetear hasChecked cuando cambia el usuario
  useEffect(() => {
    if (!user) {
      setHasChecked(false);
    }
  }, [user]);

  // Mostrar loading durante la carga inicial o mientras se verifica la organización
  if (isInitialLoad || (user && !authLoading && checkingStatus && !exemptRoutes.some(route => pathname.startsWith(route)))) {
    console.log('⏳ OrganizationCheck - Mostrando loading');
    return (
      <div className="min-h-screen grid grid-rows-[auto_1fr] lg:grid-cols-[1fr_auto] lg:grid-rows-1 gap-4 p-4">
        {user && (
          <div className="order-1 lg:order-2 flex justify-end lg:justify-start lg:items-start">
            <UserMenu />
          </div>
        )}
        <div className="order-2 lg:order-1 flex items-center justify-center">
          <OrganizationLoading />
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado y no estamos en una ruta exenta, no mostrar nada
  // (la redirección ya se maneja en el useEffect)
  if (!user && !exemptRoutes.some(route => pathname.startsWith(route))) {
    console.log('👤 OrganizationCheck - Sin usuario en ruta protegida, esperando redirección');
    return <OrganizationLoading />;
  }

  // Si no hay usuario autenticado pero estamos en una ruta exenta, mostrar el contenido
  if (!user && exemptRoutes.some(route => pathname.startsWith(route))) {
    console.log('👤 OrganizationCheck - Sin usuario en ruta exenta, mostrando children');
    return <>{children}</>;
  }

  // Mostrar los flujos apropiados según el estado de la organización
  // Esto incluye el caso donde se recibe un 401 con estado NO_ORGANIZATION
  if (user && !authLoading && isFlowActive && !exemptRoutes.some(route => pathname.startsWith(route))) {
    console.log('🎯 OrganizationCheck - Evaluando flujo activo, currentStep:', currentStep);
    
    const renderWithUserMenu = (content: React.ReactNode) => (
      <div className="min-h-screen grid grid-rows-[auto_1fr] lg:grid-cols-[1fr_auto] lg:grid-rows-1 gap-4 p-4">
        {/* Menú de usuario */}
        <div className="order-1 lg:order-2 flex justify-end lg:justify-start lg:items-start">
          <UserMenu />
        </div>
        {/* Contenido principal */}
        <div className="order-2 lg:order-1 flex items-center justify-center w-full">
          <div className="w-full max-w-4xl mx-auto">
            {content}
          </div>
        </div>
      </div>
    );
    
    switch (currentStep) {
      case 'no-organization':
        console.log('🚫 OrganizationCheck - Renderizando NoOrganizationFlow');
        // Renderizar NoOrganizationFlow cuando:
        // - El usuario no tiene organización
        // - Se recibe error 401 con estado NO_ORGANIZATION
        // - Cualquier otro caso que resulte en estado NO_ORGANIZATION
        return renderWithUserMenu(<NoOrganizationFlow />);
      case 'pending-invitation':
        console.log('📧 OrganizationCheck - Renderizando PendingInvitationsFlow');
        return renderWithUserMenu(<PendingInvitationsFlow />);
      case 'pending-request':
        console.log('📝 OrganizationCheck - Renderizando PendingRequestsFlow');
        return renderWithUserMenu(<PendingRequestsFlow />);
      case 'loading':
        console.log('⏳ OrganizationCheck - Renderizando OrganizationLoading (desde switch)');
        return renderWithUserMenu(<OrganizationLoading />);
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
  
  // Si hay usuario autenticado, mostrar el layout con el menú de usuario
  if (user) {
    return (
      <div className="min-h-screen grid grid-rows-[auto_1fr] lg:grid-cols-[1fr_auto] lg:grid-rows-1 gap-4 p-4">
        {/* Menú de usuario */}
        <div className="order-1 lg:order-2 flex justify-end lg:justify-start lg:items-start">
          <UserMenu />
        </div>
        {/* Contenido principal */}
        <div className="order-2 lg:order-1 w-full">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}