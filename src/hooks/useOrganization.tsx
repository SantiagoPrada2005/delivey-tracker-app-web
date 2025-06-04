'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Definir el tipo Organization localmente para evitar importar desde database
export interface Organization {
  id: number;
  nit: string;
  phoneService: string | null;
  address: string | null;
  regimenContribucion: string | null;
}

interface OrganizationContextType {
  selectedOrganizationId: number | null;
  organizations: Organization[];
  currentOrganization: Organization | undefined;
  loading: boolean;
  error: string | null;
  hasOrganizations: boolean;
  selectOrganization: (organizationId: number) => void;
  loadOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Cargar organizaciones al montar el componente
  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

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
    loading,
    error,
    hasOrganizations,
    selectOrganization,
    loadOrganizations,
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