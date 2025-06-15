/**
 * @fileoverview Hook de autenticación con Firebase
 * @version 2.0.0
 * @author Santiago Prada
 * @date 2025-01-20
 * 
 * @description
 * Hook personalizado para manejar la autenticación con Firebase Auth.
 * Proporciona funciones para iniciar sesión, registrarse, cerrar sesión,
 * y gestionar el estado del usuario autenticado. Actualizado para usar
 * las nuevas utilidades de autenticación y mejores prácticas de React.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  IdTokenResult
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

// Tipos para el usuario extendido con información de la base de datos
interface ExtendedUser extends User {
  role?: string;
  organizationId?: string;
  permissions?: string[];
  customClaims?: Record<string, unknown>;
}

// Tipo para el estado de autenticación
interface AuthState {
  user: ExtendedUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Definir el tipo para el contexto de autenticación
interface AuthContextType extends AuthState {
  // Métodos de autenticación
  signIn: (email: string, password: string) => Promise<ExtendedUser>;
  signInWithGoogle: () => Promise<ExtendedUser>;
  signUp: (email: string, password: string, displayName?: string) => Promise<ExtendedUser>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Métodos de gestión de perfil
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  updateUserEmail: (email: string, password: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Métodos de tokens y verificación
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  getIdTokenResult: (forceRefresh?: boolean) => Promise<IdTokenResult | null>;
  refreshUser: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  
  // Métodos de utilidad
  clearError: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  belongsToOrganization: (organizationId: string) => boolean;
}

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    initialized: false
  });

  // Función para sincronizar usuario con la base de datos y obtener información extendida
  const syncUserWithDatabase = async (firebaseUser: User): Promise<ExtendedUser> => {
    try {
      const idToken = await firebaseUser.getIdToken();
      
      const syncData = {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || undefined,
        emailVerified: firebaseUser.emailVerified,
        photoURL: firebaseUser.photoURL || undefined,
        providerId: firebaseUser.providerData[0]?.providerId || undefined
      };

      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(syncData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Auth Sync] Error al sincronizar usuario:', errorData);
        throw new Error(errorData.error || 'Error al sincronizar usuario');
      }

      const result = await response.json();
      console.log('[Auth Sync] Usuario sincronizado exitosamente:', result.user?.email);
      
      // Obtener claims personalizados del token
      const idTokenResult = await firebaseUser.getIdTokenResult();
      
      // Crear usuario extendido preservando los métodos de Firebase User
      const extendedUser = firebaseUser as ExtendedUser;
      extendedUser.role = result.user?.role || (idTokenResult.claims.role as string | undefined);
      extendedUser.organizationId = result.user?.organizationId || (idTokenResult.claims.organizationId as string | undefined);
      extendedUser.permissions = result.user?.permissions || (idTokenResult.claims.permissions as string[]) || [];
      extendedUser.customClaims = idTokenResult.claims;

      return extendedUser;
      
    } catch (error) {
      console.error('[Auth Sync] Error en sincronización:', error);
      // En caso de error, devolver el usuario básico de Firebase preservando métodos
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const extendedUser = firebaseUser as ExtendedUser;
      extendedUser.role = idTokenResult.claims.role as string | undefined;
      extendedUser.organizationId = idTokenResult.claims.organizationId as string | undefined;
      extendedUser.permissions = (idTokenResult.claims.permissions as string[]) || [];
      extendedUser.customClaims = idTokenResult.claims;
      
      return extendedUser;
    }
  };

  // Efecto para manejar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth State] Cambio detectado:', firebaseUser?.email || 'Usuario no autenticado');
      
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      if (firebaseUser) {
        try {
          // Obtener el token ID
          const idToken = await firebaseUser.getIdToken();
          
          // Configurar la cookie con el token
          const isProduction = process.env.NODE_ENV === 'production';
          document.cookie = `firebase-token=${idToken}; path=/; max-age=3600; samesite=${isProduction ? 'strict' : 'lax'}; ${isProduction ? 'secure' : ''}`;
          
          console.log('[Auth State] Token configurado en cookie');
          
          // Sincronizar con la base de datos y obtener usuario extendido
          const extendedUser = await syncUserWithDatabase(firebaseUser);
          
          setAuthState({
            user: extendedUser,
            loading: false,
            error: null,
            initialized: true
          });
        } catch (error) {
          console.error('[Auth State] Error al procesar usuario:', error);
          setAuthState({
            user: null,
            loading: false,
            error: 'Error al procesar la autenticación',
            initialized: true
          });
        }
      } else {
        // Limpiar cookie cuando no hay usuario
        document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setAuthState({
          user: null,
          loading: false,
          error: null,
          initialized: true
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Función para iniciar sesión con email y contraseña
  const signIn = useCallback(async (email: string, password: string): Promise<ExtendedUser> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const extendedUser = await syncUserWithDatabase(userCredential.user);
      
      return extendedUser;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  // Función para iniciar sesión con Google
  const signInWithGoogle = useCallback(async (): Promise<ExtendedUser> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const extendedUser = await syncUserWithDatabase(userCredential.user);
      
      return extendedUser;
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión con Google';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  // Función para registrar un nuevo usuario
  const signUp = useCallback(async (email: string, password: string, displayName?: string): Promise<ExtendedUser> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Si se proporciona un displayName, actualizar el perfil
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      const extendedUser = await syncUserWithDatabase(userCredential.user);
      
      return extendedUser;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar usuario';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  // Función para cerrar sesión
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Limpiar la cookie antes de cerrar sesión
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  // Función para restablecer contraseña
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      await sendPasswordResetEmail(auth, email);
      
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Error al enviar email de restablecimiento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar email de restablecimiento';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  // Función para actualizar el perfil del usuario
  const updateUserProfile = useCallback(async (displayName?: string, photoURL?: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!authState.user) {
        throw new Error('No hay usuario autenticado');
      }
      
      await updateProfile(authState.user, { displayName, photoURL });
      
      // Sincronizar cambios con la base de datos
      const updatedUser = await syncUserWithDatabase(authState.user);
      
      setAuthState(prev => ({ ...prev, user: updatedUser, loading: false }));
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar perfil';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [authState.user]);

  // Función para actualizar el email del usuario
  const updateUserEmail = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!authState.user) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Reautenticar al usuario antes de actualizar el email
      const credential = EmailAuthProvider.credential(authState.user.email!, password);
      await reauthenticateWithCredential(authState.user, credential);
      
      // Actualizar el email
      await updateEmail(authState.user, email);
      
      // Sincronizar cambios con la base de datos
      const updatedUser = await syncUserWithDatabase(authState.user);
      
      setAuthState(prev => ({ ...prev, user: updatedUser, loading: false }));
    } catch (error) {
      console.error('Error al actualizar email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar email';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [authState.user]);

  // Función para actualizar la contraseña del usuario
  const updateUserPassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!authState.user) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Reautenticar al usuario antes de actualizar la contraseña
      const credential = EmailAuthProvider.credential(authState.user.email!, currentPassword);
      await reauthenticateWithCredential(authState.user, credential);
      
      // Actualizar la contraseña
      await updatePassword(authState.user, newPassword);
      
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar contraseña';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [authState.user]);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Funciones de utilidad memoizadas
  const isAuthenticated = useMemo(() => !!authState.user, [authState.user]);

  // Función para obtener el token ID
  const getIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    try {
      console.log('[useAuth] getIdToken - authState.user:', authState.user ? 'Usuario presente' : 'Usuario null');
      console.log('[useAuth] getIdToken - isAuthenticated:', isAuthenticated);
      console.log('[useAuth] getIdToken - loading:', authState.loading);
      
      if (!authState.user) {
        console.log('[useAuth] getIdToken - No hay usuario autenticado');
        return null;
      }
      
      const token = await authState.user.getIdToken(forceRefresh);
      console.log('[useAuth] getIdToken - Token obtenido:', token ? `${token.substring(0, 20)}...` : 'null');
      return token;
    } catch (error) {
      console.error('[useAuth] getIdToken - Error al obtener token ID:', error);
      return null;
    }
  }, [authState.user, authState.loading, isAuthenticated]);

  // Función para obtener el resultado del token ID con claims
  const getIdTokenResult = useCallback(async (forceRefresh = false): Promise<IdTokenResult | null> => {
    try {
      if (!authState.user) return null;
      return await authState.user.getIdTokenResult(forceRefresh);
    } catch (error) {
      console.error('Error al obtener resultado del token ID:', error);
      return null;
    }
  }, [authState.user]);

  // Función para refrescar la información del usuario
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      if (!authState.user) return;
      
      setAuthState(prev => ({ ...prev, loading: true }));
      const updatedUser = await syncUserWithDatabase(authState.user);
      setAuthState(prev => ({ ...prev, user: updatedUser, loading: false }));
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      setAuthState(prev => ({ ...prev, loading: false, error: 'Error al refrescar información del usuario' }));
    }
  }, [authState.user]);

  // Función para verificar el token
  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = await getIdToken();
      if (!token) return false;
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return false;
    }
  }, [getIdToken]);
  
  const hasRole = useCallback((role: string): boolean => {
    return authState.user?.role === role || false;
  }, [authState.user?.role]);
  
  const hasPermission = useCallback((permission: string): boolean => {
    return authState.user?.permissions?.includes(permission) || false;
  }, [authState.user?.permissions]);
  
  const belongsToOrganization = useCallback((organizationId: string): boolean => {
    return authState.user?.organizationId === organizationId || false;
  }, [authState.user?.organizationId]);

  // Valor del contexto
  const value: AuthContextType = useMemo(() => ({
    ...authState,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    getIdToken,
    getIdTokenResult,
    refreshUser,
    verifyToken,
    clearError,
    isAuthenticated,
    hasRole,
    hasPermission,
    belongsToOrganization,
  }), [
    authState,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    getIdToken,
    getIdTokenResult,
    refreshUser,
    verifyToken,
    clearError,
    isAuthenticated,
    hasRole,
    hasPermission,
    belongsToOrganization,
  ]);
  
  // REMOVED: Efecto duplicado para verificar el estado de organización
  // La verificación de organización se maneja en useOrganization hook
  // Este useEffect estaba causando conflictos con el middleware

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}