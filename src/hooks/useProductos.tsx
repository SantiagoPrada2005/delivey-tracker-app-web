/**
 * @fileoverview Hook para manejar operaciones CRUD de productos
 * @version 1.0.0
 * @author Claude AI
 * @date 2025-05-15
 * 
 * @description
 * Este hook proporciona funcionalidades para gestionar productos,
 * incluyendo operaciones CRUD con autenticación Firebase.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: string;
  costo?: string;
  stock: number;
  categoriaId?: number;
  imagen?: string;
  organizationId: number;
  createdAt?: string;
}

export interface ProductoFormData {
  nombre: string;
  descripcion?: string;
  precio: string;
  costo?: string;
  stock: number;
  categoriaId?: number | null;
  imagen?: string;
}

interface UseProductosState {
  productos: Producto[];
  loading: boolean;
  error: string | null;
}

interface UseProductosReturn extends UseProductosState {
  fetchProductos: () => Promise<void>;
  createProducto: (productoData: ProductoFormData) => Promise<Producto | null>;
  updateProducto: (id: string | number, productoData: Partial<ProductoFormData>) => Promise<boolean>;
  deleteProducto: (id: string | number) => Promise<boolean>;
  getProductoById: (id: string) => Promise<Producto | null>;
  refreshProductos: () => Promise<void>;
}

export const useProductos = (): UseProductosReturn => {
  const { user, isAuthenticated, getIdToken } = useAuth();
  
  const [state, setState] = useState<UseProductosState>({
    productos: [],
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

  // Obtener todos los productos
  const fetchProductos = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch('/api/productos');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        productos: data.data || [],
        loading: false
      }));
      
    } catch (error) {
      console.error('[useProductos] Error al obtener productos:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar productos'
      }));
    }
  }, [authenticatedFetch]);

  // Obtener un producto por ID
  const getProductoById = useCallback(async (id: string): Promise<Producto | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch(`/api/productos?id=${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setState(prev => ({ ...prev, loading: false }));
      
      return data.data || null;
      
    } catch (error) {
      console.error('[useProductos] Error al obtener producto por ID:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al obtener producto'
      }));
      return null;
    }
  }, [authenticatedFetch]);

  // Crear un nuevo producto
  const createProducto = useCallback(async (productoData: ProductoFormData): Promise<Producto | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch('/api/productos', {
        method: 'POST',
        body: JSON.stringify(productoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Refrescar la lista de productos para obtener los datos actualizados
      await fetchProductos();
      
      setState(prev => ({ ...prev, loading: false }));
      
      return data.data || null;
      
    } catch (error) {
      console.error('[useProductos] Error al crear producto:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al crear producto'
      }));
      return null;
    }
  }, [authenticatedFetch, fetchProductos]);

  // Actualizar un producto existente
  const updateProducto = useCallback(async (
    id: string | number, 
    productoData: Partial<ProductoFormData>
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch('/api/productos', {
        method: 'PUT',
        body: JSON.stringify({ id, ...productoData })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Refrescar la lista de productos
      await fetchProductos();
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
      
    } catch (error) {
      console.error('[useProductos] Error al actualizar producto:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar producto'
      }));
      return false;
    }
  }, [authenticatedFetch, fetchProductos]);

  // Eliminar un producto
  const deleteProducto = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authenticatedFetch(`/api/productos?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Refrescar la lista de productos
      await fetchProductos();
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
      
    } catch (error) {
      console.error('[useProductos] Error al eliminar producto:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar producto'
      }));
      return false;
    }
  }, [authenticatedFetch, fetchProductos]);

  // Refrescar productos (alias de fetchProductos)
  const refreshProductos = useCallback(async (): Promise<void> => {
    await fetchProductos();
  }, [fetchProductos]);

  // Cargar productos automáticamente cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProductos();
    }
  }, [isAuthenticated, user, fetchProductos]);

  return {
    ...state,
    fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    getProductoById,
    refreshProductos
  };
};

export default useProductos;