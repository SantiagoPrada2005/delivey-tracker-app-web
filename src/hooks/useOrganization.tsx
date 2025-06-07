'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './useAuth';

// Definir el tipo Organization localmente para evitar importar desde database
export interface Organization {
  id: number;
  name: string;
  slug: string;
  nit?: string;
  phoneService?: string | null;
  address?: string | null;
  regimenContribucion?: string | null;
}

interface OrganizationContextType {
  selectedOrganizationId: number | null;
  organizations: Organization[];
  currentOrganization: Organization | undefined;
  loading: boolean;
  error: string | null;
  hasOrganizations: boolean;
  organizationStatus: OrganizationStatus | null;
  checkingStatus: boolean;
  selectOrganization: (organizationId: number) => void;
  loadOrganizations: () => Promise<void>;
  checkOrganizationStatus: () => Promise<void>;
}

type OrganizationStatus = {
  success: boolean;
  status: 'HAS_ORGANIZATION' | 'PENDING_INVITATION' | 'PENDING_REQUEST' | 'NO_ORGANIZATION';
  data?: {
    user: {
      id: number;
      email: string;
      organizationId: number | null;
      role: string;
    };
    organization?: {
      id: number;
      name: string;
      slug: string;
    };
    pendingInvitations?: Array<{
      id: number;
      organizationName: string;
      inviterEmail: string;
      token: string;
      expiresAt: Date;
    }>;
    pendingRequests?: Array<{
      id: number;
      organizationName: string;
      status: string;
      requestedAt: Date;
    }>;
  };
  error?: string;
  code?: string;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationStatus, setOrganizationStatus] = useState<OrganizationStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  


  const selectOrganization = useCallback((organizationId: number) => {
    setSelectedOrganizationId(organizationId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedOrganizationId', organizationId.toString());
    }
  }, []);

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/organizations');
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      
      const orgs: Organization[] = await response.json();
      setOrganizations(orgs);
      
      // Si no hay organización seleccionada y hay organizaciones disponibles,
      // seleccionar la primera automáticamente
      if (!selectedOrganizationId && orgs.length > 0) {
        selectOrganization(orgs[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar organizaciones');
    } finally {
      setLoading(false);
    }
  }, [selectedOrganizationId, selectOrganization]);

  // Verificar el estado de la organización del usuario
  const checkOrganizationStatus = useCallback(async () => {
    if (!user || authLoading) return;
    
    try {
      setCheckingStatus(true);
      setError(null); // Limpiar errores previos
      
      const idToken = await user.getIdToken();
      const response = await fetch('/api/user/organization-status', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      // Manejar diferentes códigos de estado de manera robusta
      if (response.ok) {
        const data = await response.json();
        setOrganizationStatus(data);
        
        // Si el usuario tiene una organización, cargar las organizaciones
        if (data.status === 'HAS_ORGANIZATION' && data.data?.organization) {
          setOrganizations([data.data.organization]);
          selectOrganization(data.data.organization.id);
        }
      } else {
        // Manejar respuestas no exitosas sin lanzar error
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Error de comunicación con el servidor' };
        }
        
        // Si es un error de autenticación (401), establecer estado sin organización
        if (response.status === 401) {
          setOrganizationStatus({
            success: false,
            status: 'NO_ORGANIZATION',
            error: 'Usuario no autenticado',
            code: 'AUTH_REQUIRED'
          });
        } else if (response.status === 404) {
          // Usuario no encontrado en la base de datos
          setOrganizationStatus({
            success: false,
            status: 'NO_ORGANIZATION',
            error: 'Usuario no encontrado',
            code: 'USER_NOT_FOUND'
          });
        } else {
          // Otros errores del servidor
          setOrganizationStatus({
            success: false,
            status: 'NO_ORGANIZATION',
            error: errorData.error || 'Error del servidor',
            code: errorData.code || 'SERVER_ERROR'
          });
        }
        
        console.warn('Error al verificar organización:', {
          status: response.status,
          error: errorData
        });
      }
    } catch (error) {
      console.error('Error de red al verificar organización:', error);
      
      // En caso de error de red, establecer estado sin organización
      setOrganizationStatus({
        success: false,
        status: 'NO_ORGANIZATION',
        error: 'Error de conexión',
        code: 'NETWORK_ERROR'
      });
      
      setError('Error de conexión al verificar organización');
    } finally {
      setCheckingStatus(false);
    }
  }, [user, authLoading, selectOrganization]);

  // Verificar estado de organización cuando cambia el usuario
  useEffect(() => {
    if (user && !authLoading) {
      checkOrganizationStatus();
    }
  }, [user, authLoading, checkOrganizationStatus]);
  
  // Cargar organizaciones solo si no se obtuvieron del checkOrganizationStatus
  useEffect(() => {
    if (user && !authLoading && organizations.length === 0 && organizationStatus?.status !== 'HAS_ORGANIZATION') {
      loadOrganizations();
    }
  }, [user, authLoading, organizations.length, organizationStatus?.status, loadOrganizations]);

  // Cargar organización seleccionada desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrgId = localStorage.getItem('selectedOrganizationId');
      if (savedOrgId) {
        setSelectedOrganizationId(parseInt(savedOrgId, 10));
      }
    }
  }, []);

  const currentOrganization = organizations.find(org => org.id === selectedOrganizationId);
  const hasOrganizations = organizations.length > 0;

  const value: OrganizationContextType = {
    selectedOrganizationId,
    organizations,
    currentOrganization,
    loading: loading || authLoading || checkingStatus,
    error,
    hasOrganizations,
    organizationStatus,
    checkingStatus,
    selectOrganization,
    loadOrganizations,
    checkOrganizationStatus,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

/**
 * Hook simplificado que solo retorna el ID de la organización seleccionada
 * Útil para componentes que solo necesitan el ID para hacer consultas
 */
export function useCurrentOrganizationId(): number | null {
  const { selectedOrganizationId } = useOrganization();
  return selectedOrganizationId;
}

export { OrganizationProvider };