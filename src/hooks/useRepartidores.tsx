/**
 * @fileoverview Hook para manejar operaciones CRUD de repartidores
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Este hook proporciona funcionalidades para gestionar repartidores,
 * incluyendo operaciones CRUD con autenticación Firebase.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface Repartidor {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
  disponible: boolean;
  organizationId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RepartidorFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
  disponible?: boolean;
}

interface UseRepartidoresState {
  repartidores: Repartidor[];
  loading: boolean;
  error: string | null;
}

interface UseRepartidoresReturn extends UseRepartidoresState {
  fetchRepartidores: () => Promise<void>;
  createRepartidor: (repartidorData: RepartidorFormData) => Promise<Repartidor | null>;
  updateRepartidor: (id: string, repartidorData: Partial<RepartidorFormData>) => Promise<boolean>;
  deleteRepartidor: (id: string) => Promise<boolean>;
  getRepartidorById: (id: string) => Promise<Repartidor | null>;
  refreshRepartidores: () => Promise<void>;
  clearError: () => void;
}

export const useRepartidores = (): UseRepartidoresReturn => {
  const { user, isAuthenticated, getIdToken } = useAuth();
  
  const [state, setState] = useState<UseRepartidoresState>({
    repartidores: [],
    loading: false,
    error: null
  });

  // Función para hacer peticiones autenticadas
  const authenticatedFetch = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    if (!isAuthenticated || !user) {
      throw new Error('Usuario no autenticado');
    }

    const token = await getIdToken();
    if (!token) {
      throw new Error('No se pudo obtener el token de autenticación');
    }

    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }, [isAuthenticated, user, getIdToken]);

  // Obtener todos los repartidores
  const fetchRepartidores = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch('/api/repartidores');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // La API devuelve { success: true, repartidores: [...] }
      if (data.success && data.repartidores) {
        setState(prev => ({
          ...prev,
          repartidores: data.repartidores,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          repartidores: data.repartidores || [],
          loading: false
        }));
      }
      
    } catch (error) {
      console.error('[useRepartidores] Error al obtener repartidores:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar repartidores'
      }));
    }
  }, [authenticatedFetch]);

  // Obtener un repartidor por ID
  const getRepartidorById = useCallback(async (id: string): Promise<Repartidor | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch(`/api/repartidores?id=${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setState(prev => ({ ...prev, loading: false }));
      
      // La API devuelve { success: true, repartidor: {...} }
      if (data.success && data.repartidor) {
        return data.repartidor;
      }
      return data.repartidor || null;
      
    } catch (error) {
      console.error('[useRepartidores] Error al obtener repartidor por ID:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al obtener repartidor'
      }));
      return null;
    }
  }, [authenticatedFetch]);

  // Crear un nuevo repartidor
  const createRepartidor = useCallback(async (repartidorData: RepartidorFormData): Promise<Repartidor | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch('/api/repartidores', {
        method: 'POST',
        body: JSON.stringify(repartidorData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Refrescar la lista de repartidores para obtener los datos actualizados
      await fetchRepartidores();
      
      setState(prev => ({ ...prev, loading: false }));
      
      // Si la API retorna el ID del repartidor creado, intentar obtenerlo
      if (data.id) {
        try {
          const newRepartidor = await getRepartidorById(data.id.toString());
          return newRepartidor;
        } catch (getError) {
          console.warn('[useRepartidores] No se pudo obtener el repartidor recién creado:', getError);
          // Retornar un objeto básico con los datos enviados
          return {
            id: data.id,
            ...repartidorData,
            disponible: repartidorData.disponible ?? true,
            organizationId: user?.organizationId ? parseInt(user.organizationId) : 0,
            createdAt: new Date().toISOString()
          } as Repartidor;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('[useRepartidores] Error al crear repartidor:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear repartidor'
      }));
      return null;
    }
  }, [authenticatedFetch, fetchRepartidores, getRepartidorById, user?.organizationId]);

  // Actualizar un repartidor existente
  const updateRepartidor = useCallback(async (
    id: string, 
    repartidorData: Partial<RepartidorFormData>
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch('/api/repartidores', {
        method: 'PUT',
        body: JSON.stringify({ id: parseInt(id), ...repartidorData })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Refrescar la lista de repartidores
      await fetchRepartidores();
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
      
    } catch (error) {
      console.error('[useRepartidores] Error al actualizar repartidor:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar repartidor'
      }));
      return false;
    }
  }, [authenticatedFetch, fetchRepartidores]);

  // Eliminar un repartidor
  const deleteRepartidor = useCallback(async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch(`/api/repartidores?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Refrescar la lista de repartidores
      await fetchRepartidores();
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
      
    } catch (error) {
      console.error('[useRepartidores] Error al eliminar repartidor:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar repartidor'
      }));
      return false;
    }
  }, [authenticatedFetch, fetchRepartidores]);

  // Refrescar repartidores (alias de fetchRepartidores)
  const refreshRepartidores = useCallback(async (): Promise<void> => {
    await fetchRepartidores();
  }, [fetchRepartidores]);

  // Limpiar errores
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cargar repartidores automáticamente cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRepartidores();
    }
  }, [isAuthenticated, user, fetchRepartidores]);

  return {
    ...state,
    fetchRepartidores,
    createRepartidor,
    updateRepartidor,
    deleteRepartidor,
    getRepartidorById,
    refreshRepartidores,
    clearError
  };
};

export default useRepartidores;