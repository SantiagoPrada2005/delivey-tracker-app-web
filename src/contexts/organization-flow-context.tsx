'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Determinar el paso actual del flujo
  const getCurrentStep = useCallback((): OrganizationFlowStep => {
    console.log('🔍 OrganizationFlow - getCurrentStep:', {
      checkingStatus,
      organizationStatus: organizationStatus ? {
        status: organizationStatus.status,
        success: organizationStatus.success,
        error: organizationStatus.error
      } : null
    });
    
    if (checkingStatus) return 'loading';
    if (!organizationStatus) return 'loading';
    
    switch (organizationStatus.status) {
      case 'NO_ORGANIZATION':
        console.log('🚫 OrganizationFlow - Estado: NO_ORGANIZATION');
        return 'no-organization';
      case 'PENDING_INVITATION':
        console.log('📧 OrganizationFlow - Estado: PENDING_INVITATION');
        return 'pending-invitation';
      case 'PENDING_REQUEST':
        console.log('📝 OrganizationFlow - Estado: PENDING_REQUEST');
        return 'pending-request';
      case 'HAS_ORGANIZATION':
        console.log('✅ OrganizationFlow - Estado: HAS_ORGANIZATION');
        return 'has-organization';
      default:
        console.log('❓ OrganizationFlow - Estado desconocido:', organizationStatus.status);
        return 'loading';
    }
  }, [checkingStatus, organizationStatus]);

  const currentStep = getCurrentStep();
  const isFlowActive = user && currentStep !== 'has-organization';

  console.log('🎯 OrganizationFlow - Estado calculado:', {
    user: !!user,
    currentStep,
    isFlowActive
  });

  // NOTA: La función handleRedirection fue removida ya que no se está utilizando
  // debido a que las redirecciones automáticas están deshabilitadas en favor
  // del componente bloqueador de pantalla completa

  // Efecto para manejar redirecciones automáticas cuando cambia el estado
  // DESHABILITADO: Permitir que el componente bloqueador se muestre en lugar de redirigir
  // useEffect(() => {
  //   // Solo redirigir si el usuario está autenticado, no está verificando estado,
  //   // y el paso actual requiere redirección
  //   if (user && !checkingStatus && currentStep !== 'loading' && currentStep !== 'has-organization' && !hasRedirected) {
  //     handleRedirection(currentStep);
  //   }
  // }, [user, checkingStatus, currentStep, handleRedirection, hasRedirected]);

  // Refrescar el estado de la organización
  const refreshOrganizationStatus = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await checkOrganizationStatus();
      setLastRefresh(new Date());
      
      // DESHABILITADO: No redirigir automáticamente, permitir que el componente bloqueador se muestre
      // setTimeout(() => {
      //   const step = getCurrentStep();
      //   if (step !== 'has-organization' && step !== 'loading') {
      //     handleRedirection(step);
      //   }
      // }, 100);
    } catch (error) {
      console.error('Error refreshing organization status:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [checkOrganizationStatus]);

  // Completar el flujo (cuando el usuario tiene organización)
  const completeFlow = useCallback(() => {
    // Forzar una actualización del estado para asegurar que el flujo se complete
    setTimeout(() => {
      checkOrganizationStatus();
    }, 500);
    console.log('Organization flow completed');
  }, [checkOrganizationStatus]);
  
  // Resetear el estado de redirección (función mantenida para compatibilidad)
  const resetRedirection = useCallback(() => {
    // No hay estado de redirección que resetear ya que las redirecciones automáticas están deshabilitadas
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