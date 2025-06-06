'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useRouter, usePathname } from 'next/navigation';

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
  hasOrganization: boolean;
  hasPendingInvitations: boolean;
  hasPendingRequests: boolean;
  organization?: Organization;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationStatus, setOrganizationStatus] = useState<OrganizationStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  // Rutas que no requieren verificación de organización
  const exemptRoutes = useMemo(() => [
    '/login',
    '/register',
    '/organization/create',
    '/organization/invitations',
    '/organization/requests'
  ], []);

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
      const idToken = await user.getIdToken();
      const response = await fetch('/api/user/organization-status', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al verificar el estado de la organización');
      }

      const data = await response.json();
      setOrganizationStatus(data);

      // Redirigir según el estado de la organización si no estamos en una ruta exenta
      if (!exemptRoutes.some(route => pathname?.startsWith(route))) {
        if (!data.hasOrganization) {
          if (data.hasPendingInvitations) {
            router.push('/organization/invitations');
          } else if (data.hasPendingRequests) {
            router.push('/organization/requests');
          } else {
            router.push('/organization/create');
          }
        }
      }
      
      // Si el usuario tiene una organización, cargar las organizaciones
      if (data.hasOrganization && data.organization) {
        setOrganizations([data.organization]);
        selectOrganization(data.organization.id);
      }
    } catch (error) {
      console.error('Error al verificar organización:', error);
      setError(error instanceof Error ? error.message : 'Error al verificar organización');
    } finally {
      setCheckingStatus(false);
    }
  }, [user, authLoading, pathname, router, exemptRoutes, selectOrganization]);

  // Verificar estado de organización cuando cambia el usuario
  useEffect(() => {
    if (user && !authLoading) {
      checkOrganizationStatus();
    }
  }, [user, authLoading, checkOrganizationStatus]);
  
  // Cargar organizaciones al montar el componente
  useEffect(() => {
    if (user && !authLoading) {
      loadOrganizations();
    }
  }, [user, authLoading, loadOrganizations]);

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