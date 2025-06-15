/**
 * @fileoverview Hook para manejar operaciones CRUD de clientes
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Este hook proporciona funcionalidades para gestionar clientes,
 * incluyendo operaciones CRUD con autenticación Firebase.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  estado: 'activo' | 'inactivo' | 'pendiente';
  fechaRegistro: string;
  totalPedidos: number;
  valorTotal: number;
  ciudad: string;
  organizationId: number;
}

export type ClienteFormData = Omit<Cliente, 'id' | 'totalPedidos' | 'valorTotal' | 'fechaRegistro'>;

interface UseClientesState {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
}

interface UseClientesReturn extends UseClientesState {
  fetchClientes: () => Promise<void>;
  createCliente: (clienteData: ClienteFormData) => Promise<Cliente | null>;
  updateCliente: (id: string, clienteData: Partial<ClienteFormData>) => Promise<boolean>;
  deleteCliente: (id: string) => Promise<boolean>;
  getClienteById: (id: string) => Promise<Cliente | null>;
  refreshClientes: () => Promise<void>;
}

export const useClientes = (): UseClientesReturn => {
  const { user, isAuthenticated, getIdToken } = useAuth();
  
  const [state, setState] = useState<UseClientesState>({
    clientes: [],
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

  // Obtener todos los clientes
  const fetchClientes = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch('/api/clientes');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        clientes: data.clientes || [],
        loading: false
      }));
      
    } catch (error) {
      console.error('[useClientes] Error al obtener clientes:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar clientes'
      }));
    }
  }, [authenticatedFetch]);

  // Obtener un cliente por ID
  const getClienteById = useCallback(async (id: string): Promise<Cliente | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch(`/api/clientes?id=${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setState(prev => ({ ...prev, loading: false }));
      
      return data.cliente || null;
      
    } catch (error) {
      console.error('[useClientes] Error al obtener cliente por ID:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al obtener cliente'
      }));
      return null;
    }
  }, [authenticatedFetch]);

  // Crear un nuevo cliente
  const createCliente = useCallback(async (clienteData: ClienteFormData): Promise<Cliente | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch('/api/clientes', {
        method: 'POST',
        body: JSON.stringify(clienteData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Refrescar la lista de clientes para obtener los datos actualizados
      await fetchClientes();
      
      setState(prev => ({ ...prev, loading: false }));
      
      // Si la API retorna el ID del cliente creado, intentar obtenerlo
      if (data.id) {
        try {
          const newCliente = await getClienteById(data.id.toString());
          return newCliente;
        } catch (getError) {
          console.warn('[useClientes] No se pudo obtener el cliente recién creado:', getError);
          // Retornar un objeto básico con los datos enviados
          return {
            id: data.id.toString(),
            ...clienteData,
            fechaRegistro: new Date().toISOString().split('T')[0],
            totalPedidos: 0,
            valorTotal: 0
          } as Cliente;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('[useClientes] Error al crear cliente:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear cliente'
      }));
      return null;
    }
  }, [authenticatedFetch, fetchClientes, getClienteById]);

  // Actualizar un cliente existente
  const updateCliente = useCallback(async (
    id: string, 
    clienteData: Partial<ClienteFormData>
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch('/api/clientes', {
        method: 'PUT',
        body: JSON.stringify({ id, ...clienteData })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Refrescar la lista de clientes
      await fetchClientes();
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
      
    } catch (error) {
      console.error('[useClientes] Error al actualizar cliente:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar cliente'
      }));
      return false;
    }
  }, [authenticatedFetch, fetchClientes]);

  // Eliminar un cliente
  const deleteCliente = useCallback(async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch(`/api/clientes?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Refrescar la lista de clientes
      await fetchClientes();
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
      
    } catch (error) {
      console.error('[useClientes] Error al eliminar cliente:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar cliente'
      }));
      return false;
    }
  }, [authenticatedFetch, fetchClientes]);

  // Refrescar clientes (alias de fetchClientes)
  const refreshClientes = useCallback(async (): Promise<void> => {
    await fetchClientes();
  }, [fetchClientes]);

  // Cargar clientes automáticamente cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchClientes();
    }
  }, [isAuthenticated, user, fetchClientes]);

  return {
    ...state,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    refreshClientes
  };
};

export default useClientes;