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
import { OrganizationErrorBoundary } from '@/components/error-boundary';

// Rutas que no requieren verificación de organización
const EXEMPT_ROUTES = [
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
  const { user, loading: authLoading, isAuthenticated } = useAuth();
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
    isExemptRoute: EXEMPT_ROUTES.some(route => pathname.startsWith(route)),
    exemptRoutes: EXEMPT_ROUTES,
    matchingExemptRoute: EXEMPT_ROUTES.find(route => pathname.startsWith(route))
  });

  useEffect(() => {
    // Si la ruta está exenta, no hacer nada
    if (EXEMPT_ROUTES.some(route => pathname.startsWith(route))) {
      console.log('📍 OrganizationCheck - Ruta exenta, no verificar organización');
      setIsInitialLoad(false);
      return;
    }

    // Si no hay usuario autenticado y no estamos cargando, redirigir a login
    if (!isAuthenticated && !authLoading) {
      console.log('👤 OrganizationCheck - No hay usuario autenticado, redirigiendo a login');
      router.push('/auth/login');
      return;
    }

    // Si hay usuario autenticado, verificar el estado de la organización
    if (isAuthenticated && !authLoading && !hasChecked) {
      console.log('🔄 OrganizationCheck - Refrescando estado de organización');
      refreshOrganizationStatus();
      setHasChecked(true);
      setIsInitialLoad(false);
    }
  }, [user, authLoading, hasChecked, pathname, refreshOrganizationStatus, router, isAuthenticated]);

  // Resetear hasChecked cuando cambia el usuario
  useEffect(() => {
    if (!isAuthenticated) {
      setHasChecked(false);
    }
  }, [isAuthenticated]);

  // Verificar si la ruta actual está exenta
  const isExemptRoute = EXEMPT_ROUTES.some(route => pathname.startsWith(route));

  // Mostrar loading durante la carga inicial o mientras se verifica la organización
  if (isInitialLoad || (isAuthenticated && !authLoading && checkingStatus && !isExemptRoute)) {
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
  if (!isAuthenticated && !isExemptRoute) {
    console.log('👤 OrganizationCheck - Sin usuario en ruta protegida, esperando redirección');
    return <OrganizationLoading />;
  }

  // Si no hay usuario autenticado pero estamos en una ruta exenta, mostrar el contenido
  if (!isAuthenticated && isExemptRoute) {
    console.log('👤 OrganizationCheck - Sin usuario en ruta exenta, mostrando children');
    return <>{children}</>;
  }

  // Renderizar flujos de organización para usuarios autenticados en rutas no exentas
  if (isAuthenticated && !authLoading && isFlowActive && !isExemptRoute) {
    console.log('🎯 OrganizationCheck - Flujo activo:', currentStep);
    
    const renderWithLayout = (content: React.ReactNode) => (
      <OrganizationErrorBoundary>
        <div className="min-h-screen grid grid-rows-[auto_1fr] lg:grid-cols-[1fr_auto] lg:grid-rows-1 gap-4 p-4">
          <div className="order-1 lg:order-2 flex justify-end lg:justify-start lg:items-start">
            <UserMenu />
          </div>
          <div className="order-2 lg:order-1 flex items-center justify-center w-full">
            <div className="w-full max-w-4xl mx-auto">
              {content}
            </div>
          </div>
        </div>
      </OrganizationErrorBoundary>
    );
    
    switch (currentStep) {
      case 'no-organization':
        return renderWithLayout(<NoOrganizationFlow />);
      case 'pending-invitation':
        return renderWithLayout(<PendingInvitationsFlow />);
      case 'pending-request':
        return renderWithLayout(<PendingRequestsFlow />);
      case 'loading':
        return renderWithLayout(<OrganizationLoading />);
      case 'has-organization':
        // Usuario tiene organización, continuar al contenido normal
        break;
      default:
        return renderWithLayout(<OrganizationLoading />);
    }
  }

  console.log('📄 OrganizationCheck - Renderizando contenido normal');
  
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