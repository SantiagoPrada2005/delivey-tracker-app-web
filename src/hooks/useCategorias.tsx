'use client';

import { authenticatedFetch } from '@/lib/auth/client-utils';
import { useState, useEffect } from 'react';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  organizationId: number;
  createdAt: Date;
}

export interface CategoriaFormData {
  nombre: string;
  descripcion?: string;
}

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/categorias');
      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }
      const data = await response.json();
      setCategorias(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createCategoria = async (categoriaData: CategoriaFormData) => {
    try {
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoriaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear categoría');
      }

      const newCategoria = await response.json();
      setCategorias(prev => [...prev, newCategoria]);
      return newCategoria;
    } catch (err) {
      throw err;
    }
  };

  const updateCategoria = async (id: string | number, categoriaData: Partial<CategoriaFormData>) => {
    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoriaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar categoría');
      }

      const updatedCategoria = await response.json();
      setCategorias(prev => 
        prev.map(categoria => 
          categoria.id === Number(id) ? { ...categoria, ...updatedCategoria } : categoria
        )
      );
      return updatedCategoria;
    } catch (err) {
      throw err;
    }
  };

  const deleteCategoria = async (id: string | number) => {
    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar categoría');
      }

      setCategorias(prev => prev.filter(categoria => categoria.id !== Number(id)));
    } catch (err) {
      throw err;
    }
  };

  const getCategoriaById = (id: number) => {
    return categorias.find(categoria => categoria.id === id);
  };

  const refreshCategorias = () => {
    fetchCategorias();
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return {
    categorias,
    loading,
    error,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getCategoriaById,
    refreshCategorias,
  };
}