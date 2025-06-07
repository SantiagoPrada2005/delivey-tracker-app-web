'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOrganization, type Organization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';

// Tipos específicos para las invitaciones pendientes según la API
interface PendingInvitation {
  id: number;
  organizationName: string;
  inviterEmail: string;
  token: string;
  expiresAt: Date;
}

// Tipos específicos para las solicitudes pendientes según la API
interface PendingRequest {
  id: number;
  organizationName: string;
  status: string;
  requestedAt: Date;
}

// Tipo para los pasos del flujo de organización
type OrganizationFlowStep = 'loading' | 'no-organization' | 'pending-invitation' | 'pending-request' | 'has-organization';

// Datos consolidados de la organización
interface OrganizationData {
  pendingInvitations: PendingInvitation[];
  pendingRequests: PendingRequest[];
  currentOrganization: Organization | null;
}

// Interfaz principal del contexto
interface OrganizationFlowContextType {
  // Estado del flujo
  isFlowActive: boolean;
  currentStep: OrganizationFlowStep;
  
  // Acciones
  refreshOrganizationStatus: () => Promise<void>;
  completeFlow: () => void;
  resetRedirection: () => void;
  
  // Datos del contexto
  organizationData: OrganizationData;
  isRefreshing: boolean;
  lastRefresh: Date | null;
}

const OrganizationFlowContext = createContext<OrganizationFlowContextType | undefined>(undefined);

interface OrganizationFlowProviderProps {
  children: ReactNode;
}

export function OrganizationFlowProvider({ children }: OrganizationFlowProviderProps) {
  const { user } = useAuth();
  const { organizationStatus, checkOrganizationStatus, checkingStatus, currentOrganization } = useOrganization();
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Determinar el paso actual del flujo
  const getCurrentStep = useCallback((): OrganizationFlowStep => {
    if (checkingStatus) return 'loading';
    if (!organizationStatus) return 'loading';
    
    switch (organizationStatus.status) {
      case 'NO_ORGANIZATION':
        return 'no-organization';
      case 'PENDING_INVITATION':
        return 'pending-invitation';
      case 'PENDING_REQUEST':
        return 'pending-request';
      case 'HAS_ORGANIZATION':
        return 'has-organization';
      default:
        return 'loading';
    }
  }, [checkingStatus, organizationStatus]);

  const currentStep = getCurrentStep();
  const isFlowActive = user && currentStep !== 'has-organization';

  // Manejar redirecciones automáticas
  const handleRedirection = useCallback((step: OrganizationFlowStep) => {
    // Evitar redirecciones múltiples
    if (hasRedirected) return;
    
    // Rutas que no requieren redirección automática
    const exemptRoutes = [
      '/auth/login',
      '/auth/register', 
      '/auth/verify-email',
      '/organization/create',
      '/organization/invitations',
      '/organization/requests'
    ];
    
    // Si ya estamos en una ruta exenta, no redirigir
    if (exemptRoutes.some(route => pathname.startsWith(route))) {
      return;
    }
    
    // Determinar la ruta de redirección según el estado
    let redirectPath: string | null = null;
    
    switch (step) {
      case 'no-organization':
        redirectPath = '/organization/create';
        break;
      case 'pending-invitation':
        redirectPath = '/organization/invitations';
        break;
      case 'pending-request':
        redirectPath = '/organization/requests';
        break;
      default:
        return;
    }
    
    if (redirectPath) {
      setHasRedirected(true);
      router.push(redirectPath);
    }
  }, [hasRedirected, pathname, router]);

  // Refrescar el estado de la organización
  const refreshOrganizationStatus = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await checkOrganizationStatus();
      setLastRefresh(new Date());
      
      // Manejar redirección basada en el nuevo estado
      const step = getCurrentStep();
      if (step !== 'has-organization' && step !== 'loading') {
        handleRedirection(step);
      } else if (step === 'has-organization') {
        setHasRedirected(false);
      }
    } catch (error) {
      console.error('Error refreshing organization status:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [checkOrganizationStatus, getCurrentStep, handleRedirection]);

  // Completar el flujo (cuando el usuario tiene organización)
  const completeFlow = useCallback(() => {
    setHasRedirected(false);
    // Aquí se puede agregar lógica adicional cuando se completa el flujo
    console.log('Organization flow completed');
  }, []);
  
  // Resetear el estado de redirección
  const resetRedirection = useCallback(() => {
    setHasRedirected(false);
  }, []);

  // Datos de la organización con tipos específicos y validación
  const organizationData: OrganizationData = {
    pendingInvitations: (organizationStatus?.data?.pendingInvitations || []).map((invitation): PendingInvitation => ({
      id: invitation.id,
      organizationName: invitation.organizationName,
      inviterEmail: invitation.inviterEmail,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
    })),
    pendingRequests: (organizationStatus?.data?.pendingRequests || []).map((request): PendingRequest => ({
      id: request.id,
      organizationName: request.organizationName,
      status: request.status,
      requestedAt: request.requestedAt,
    })),
    currentOrganization: currentOrganization || null,
  };

  // Construcción del valor del contexto con tipos explícitos
  const contextValue: OrganizationFlowContextType = {
    isFlowActive: Boolean(isFlowActive),
    currentStep,
    refreshOrganizationStatus,
    completeFlow,
    resetRedirection,
    organizationData,
    isRefreshing,
    lastRefresh,
  };

  return (
    <OrganizationFlowContext.Provider value={contextValue}>
      {children}
    </OrganizationFlowContext.Provider>
  );
}

export function useOrganizationFlow() {
  const context = useContext(OrganizationFlowContext);
  if (context === undefined) {
    throw new Error('useOrganizationFlow must be used within an OrganizationFlowProvider');
  }
  return context;
}