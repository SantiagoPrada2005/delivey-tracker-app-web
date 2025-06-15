/**
 * @fileoverview Hook de usuario para gestión avanzada de datos del usuario
 * @version 1.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Hook personalizado para manejar operaciones específicas del usuario
 * como gestión de perfil, preferencias, organizaciones y permisos.
 * Complementa el hook useAuth con funcionalidades más específicas.
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';

// Tipos para el perfil del usuario
interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  organizationId?: string;
  permissions?: string[];
  preferences?: UserPreferences;
  metadata?: UserMetadata;
}

// Tipos para las preferencias del usuario
interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard?: {
    layout: string;
    widgets: string[];
  };
}

// Tipos para metadatos del usuario
interface UserMetadata {
  createdAt?: string;
  lastLoginAt?: string;
  loginCount?: number;
  lastActiveAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Tipos para la organización
interface Organization {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  settings?: Record<string, unknown>;
  members?: OrganizationMember[];
}

// Tipos para miembros de la organización
interface OrganizationMember {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
  permissions: string[];
  joinedAt: string;
}

// Estado del hook useUser
interface UserState {
  profile: UserProfile | null;
  organization: Organization | null;
  loading: boolean;
  error: string | null;
}

// Tipo del hook useUser
interface UseUserReturn extends UserState {
  // Métodos de perfil
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Métodos de organización
  getOrganization: () => Promise<Organization | null>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  leaveOrganization: () => Promise<void>;
  
  // Métodos de permisos
  checkPermission: (permission: string) => boolean;
  checkRole: (role: string) => boolean;
  getEffectivePermissions: () => string[];
  
  // Métodos de utilidad
  clearError: () => void;
  isProfileComplete: boolean;
  canManageOrganization: boolean;
  canInviteUsers: boolean;
}

/**
 * Hook personalizado para gestión avanzada de datos del usuario
 */
export const useUser = (): UseUserReturn => {
  const { user, isAuthenticated, getIdToken } = useAuth();
  
  const [userState, setUserState] = useState<UserState>({
    profile: null,
    organization: null,
    loading: false,
    error: null
  });

  // Función para obtener el perfil completo del usuario
  const fetchUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      if (!user || !isAuthenticated) return null;
      
      const token = await getIdToken();
      if (!token) return null;
      
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener perfil del usuario');
      }
      
      const data = await response.json();
      return data.profile;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }, [user, isAuthenticated, getIdToken]);

  // Función para actualizar el perfil del usuario
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<void> => {
    try {
      setUserState(prev => ({ ...prev, loading: true, error: null }));
      
      const token = await getIdToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar perfil');
      }
      
      const data = await response.json();
      setUserState(prev => ({
        ...prev,
        profile: data.profile,
        loading: false
      }));
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar perfil';
      setUserState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [getIdToken]);

  // Función para actualizar las preferencias del usuario
  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>): Promise<void> => {
    try {
      setUserState(prev => ({ ...prev, loading: true, error: null }));
      
      const token = await getIdToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar preferencias');
      }
      
      const data = await response.json();
      setUserState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, preferences: data.preferences } : null,
        loading: false
      }));
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar preferencias';
      setUserState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [getIdToken]);

  // Función para refrescar el perfil del usuario
  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      setUserState(prev => ({ ...prev, loading: true, error: null }));
      
      const profile = await fetchUserProfile();
      setUserState(prev => ({ ...prev, profile, loading: false }));
    } catch (error) {
      console.error('Error al refrescar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al refrescar perfil';
      setUserState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, [fetchUserProfile]);

  // Función para obtener la organización del usuario
  const getOrganization = useCallback(async (): Promise<Organization | null> => {
    try {
      if (!user?.organizationId) return null;
      
      const token = await getIdToken();
      if (!token) return null;
      
      const response = await fetch(`/api/organizations/${user.organizationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener organización');
      }
      
      const data = await response.json();
      return data.organization;
    } catch (error) {
      console.error('Error al obtener organización:', error);
      return null;
    }
  }, [user?.organizationId, getIdToken]);

  // Función para actualizar la organización
  const updateOrganization = useCallback(async (updates: Partial<Organization>): Promise<void> => {
    try {
      if (!user?.organizationId) {
        throw new Error('Usuario no pertenece a ninguna organización');
      }
      
      setUserState(prev => ({ ...prev, loading: true, error: null }));
      
      const token = await getIdToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      const response = await fetch(`/api/organizations/${user.organizationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar organización');
      }
      
      const data = await response.json();
      setUserState(prev => ({
        ...prev,
        organization: data.organization,
        loading: false
      }));
    } catch (error) {
      console.error('Error al actualizar organización:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar organización';
      setUserState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [user?.organizationId, getIdToken]);

  // Función para salir de la organización
  const leaveOrganization = useCallback(async (): Promise<void> => {
    try {
      if (!user?.organizationId) {
        throw new Error('Usuario no pertenece a ninguna organización');
      }
      
      setUserState(prev => ({ ...prev, loading: true, error: null }));
      
      const token = await getIdToken();
      if (!token) throw new Error('No hay token de autenticación');
      
      const response = await fetch(`/api/organizations/${user.organizationId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al salir de la organización');
      }
      
      setUserState(prev => ({
        ...prev,
        organization: null,
        loading: false
      }));
    } catch (error) {
      console.error('Error al salir de la organización:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al salir de la organización';
      setUserState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [user?.organizationId, getIdToken]);

  // Función para verificar permisos
  const checkPermission = useCallback((permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  }, [user?.permissions]);

  // Función para verificar rol
  const checkRole = useCallback((role: string): boolean => {
    return user?.role === role || false;
  }, [user?.role]);

  // Función para obtener permisos efectivos
  const getEffectivePermissions = useCallback((): string[] => {
    const userPermissions = user?.permissions || [];
    const rolePermissions = getRolePermissions(user?.role);
    
    // Combinar permisos del usuario y del rol, eliminando duplicados
    return [...new Set([...userPermissions, ...rolePermissions])];
  }, [user?.permissions, user?.role]);

  // Función auxiliar para obtener permisos por rol
  const getRolePermissions = (role?: string): string[] => {
    const rolePermissionsMap: Record<string, string[]> = {
      'admin': ['read', 'write', 'delete', 'manage_users', 'manage_organization'],
      'manager': ['read', 'write', 'manage_users'],
      'user': ['read', 'write'],
      'viewer': ['read']
    };
    
    return rolePermissionsMap[role || ''] || [];
  };

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setUserState(prev => ({ ...prev, error: null }));
  }, []);

  // Propiedades computadas
  const isProfileComplete = useMemo(() => {
    if (!userState.profile) return false;
    
    const requiredFields = ['displayName', 'email'];
    return requiredFields.every(field => {
      const value = userState.profile![field as keyof UserProfile];
      return value !== null && value !== undefined && value !== '';
    });
  }, [userState.profile]);

  const canManageOrganization = useMemo(() => {
    return checkPermission('manage_organization') || checkRole('admin');
  }, [checkPermission, checkRole]);

  const canInviteUsers = useMemo(() => {
    return checkPermission('manage_users') || checkRole('admin') || checkRole('manager');
  }, [checkPermission, checkRole]);

  // Efecto para cargar el perfil cuando el usuario cambia
  useEffect(() => {
    if (user && isAuthenticated) {
      refreshProfile();
    } else {
      setUserState({
        profile: null,
        organization: null,
        loading: false,
        error: null
      });
    }
  }, [user, isAuthenticated, refreshProfile]);

  // Efecto para cargar la organización cuando el perfil cambia
  useEffect(() => {
    if (userState.profile?.organizationId && !userState.organization) {
      getOrganization().then(org => {
        if (org) {
          setUserState(prev => ({ ...prev, organization: org }));
        }
      }).catch(error => {
        console.error('Error al cargar organización:', error);
      });
    }
  }, [userState.profile?.organizationId, userState.organization, getOrganization]);

  return {
    ...userState,
    updateProfile,
    updatePreferences,
    refreshProfile,
    getOrganization,
    updateOrganization,
    leaveOrganization,
    checkPermission,
    checkRole,
    getEffectivePermissions,
    clearError,
    isProfileComplete,
    canManageOrganization,
    canInviteUsers
  };
};

// Hook auxiliar para usar solo el perfil del usuario
export const useUserProfile = () => {
  const { profile, loading, error, updateProfile, refreshProfile } = useUser();
  
  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile
  };
};

// Hook auxiliar para usar solo las preferencias del usuario
export const useUserPreferences = () => {
  const { profile, updatePreferences, loading, error } = useUser();
  
  return {
    preferences: profile?.preferences,
    updatePreferences,
    loading,
    error
  };
};

// Hook auxiliar para usar solo la organización
export const useOrganization = () => {
  const { 
    organization, 
    loading, 
    error, 
    getOrganization, 
    updateOrganization, 
    leaveOrganization,
    canManageOrganization 
  } = useUser();
  
  return {
    organization,
    loading,
    error,
    getOrganization,
    updateOrganization,
    leaveOrganization,
    canManageOrganization
  };
};

export default useUser;