/**
 * @fileoverview Hook personalizado para manejar la creación de organizaciones
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Este hook encapsula la lógica para crear organizaciones, incluyendo
 * la autenticación, validación y manejo de estados de carga y error.
 */

import { useState } from 'react';
import { useOrganizationFlow } from '@/contexts/organization-flow-context';
import { useRouter } from 'next/navigation';

/**
 * Interfaz para los datos de creación de organización
 */
export interface CreateOrganizationData {
  name: string;
  description?: string;
  slug?: string;
}

/**
 * Interfaz para la respuesta de la API
 */
interface CreateOrganizationResponse {
  success: boolean;
  organization?: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
  };
  error?: string;
  code?: string;
}

/**
 * Interfaz para el estado del hook
 */
export interface UseCreateOrganizationState {
  loading: boolean;
  error: string | null;
  success: boolean;
  organization: CreateOrganizationResponse['organization'] | null;
}

/**
 * Interfaz para las funciones del hook
 */
export interface UseCreateOrganizationActions {
  createOrganization: (data: CreateOrganizationData) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

/**
 * Tipo de retorno del hook
 */
export type UseCreateOrganizationReturn = UseCreateOrganizationState & UseCreateOrganizationActions;

/**
 * Hook personalizado para manejar la creación de organizaciones
 * 
 * @returns Objeto con estado y funciones para crear organizaciones
 */
export function useCreateOrganization(): UseCreateOrganizationReturn {
  const { refreshOrganizationStatus, completeFlow } = useOrganizationFlow();
  const router = useRouter();
  
  const [state, setState] = useState<UseCreateOrganizationState>({
    loading: false,
    error: null,
    success: false,
    organization: null,
  });

  /**
   * Función para crear una nueva organización
   */
  const createOrganization = async (data: CreateOrganizationData): Promise<void> => {
    // Resetear estado previo
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      // Realizar la petición a la API
      // La autenticación se maneja automáticamente por el middleware
      // que agrega los headers de usuario basados en el token de Firebase
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticación
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          slug: data.slug?.trim() || undefined,
        }),
      });

      // Parsear la respuesta
      const responseData: CreateOrganizationResponse = await response.json();

      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error(responseData.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Verificar que la respuesta contenga los datos esperados
      if (!responseData.success || !responseData.organization) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Actualizar estado con éxito
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        organization: responseData.organization,
      }));

      // Actualizar el estado de la organización en el contexto
      await refreshOrganizationStatus();
      
      // Completar el flujo de organización
      completeFlow();
      
      // Redireccionar al dashboard después de un breve retraso
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('[useCreateOrganization] Error al crear organización:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido al crear la organización';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  /**
   * Función para resetear el estado del hook
   */
  const reset = (): void => {
    setState({
      loading: false,
      error: null,
      success: false,
      organization: null,
    });
  };

  /**
   * Función para limpiar solo el error
   */
  const clearError = (): void => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  };

  return {
    // Estado
    loading: state.loading,
    error: state.error,
    success: state.success,
    organization: state.organization,
    
    // Acciones
    createOrganization,
    reset,
    clearError,
  };
}

/**
 * Hook simplificado que solo retorna la función de creación
 * Útil cuando solo necesitas la función sin el estado
 */
export function useCreateOrganizationMutation() {
  const { createOrganization } = useCreateOrganization();
  return createOrganization;
}

export default useCreateOrganization;