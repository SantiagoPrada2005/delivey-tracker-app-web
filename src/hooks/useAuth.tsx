'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

// Definir el tipo para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signUp: (email: string, password: string, displayName?: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  updateUserEmail: (email: string, password: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar el token de Firebase
  const handleFirebaseToken = async (user: User | null) => {
    if (user) {
      try {
        // Obtener el token ID del usuario
        const idToken = await user.getIdToken();
        
        // Guardar el token en una cookie
        document.cookie = `firebaseToken=${idToken}; path=/; max-age=3600; secure; samesite=strict`;
        
        console.log('[Auth] Token de Firebase guardado en cookie');
      } catch (error) {
        console.error('[Auth] Error al obtener token de Firebase:', error);
      }
    } else {
      // Eliminar el token de la cookie cuando el usuario cierre sesión
      document.cookie = 'firebaseToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      console.log('[Auth] Token de Firebase eliminado de cookie');
    }
  };

  // Efecto para escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      await handleFirebaseToken(user);
      setLoading(false);
    }, (error) => {
      console.error('Error en onAuthStateChanged:', error);
      setError(error instanceof Error ? error.message : 'Error en la autenticación');
      setLoading(false);
    });

    // Limpiar la suscripción al desmontar
    return () => unsubscribe();
  }, []);

  // Función para iniciar sesión
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // El token se manejará automáticamente en onAuthStateChanged
      return userCredential.user;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar sesión con Google
  const signInWithGoogle = async (): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      // Opcional: agregar scopes adicionales
      provider.addScope('profile');
      provider.addScope('email');
      
      const userCredential = await signInWithPopup(auth, provider);
      
      // El token se manejará automáticamente en onAuthStateChanged
      return userCredential.user;
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión con Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar un nuevo usuario
  const signUp = async (email: string, password: string, displayName?: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Si se proporciona un displayName, actualizar el perfil
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // El token se manejará automáticamente en onAuthStateChanged
      return userCredential.user;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError(error instanceof Error ? error.message : 'Error al registrar usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Firebase signOut automáticamente disparará onAuthStateChanged con user = null
      // lo que eliminará el token de la cookie
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError(error instanceof Error ? error.message : 'Error al cerrar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para restablecer contraseña
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      setError(error instanceof Error ? error.message : 'Error al restablecer contraseña');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar el perfil del usuario
  const updateUserProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      await updateProfile(user, { displayName, photoURL });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar perfil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar el email del usuario
  const updateUserEmail = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Reautenticar al usuario antes de actualizar el email
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
      
      // Actualizar el email
      await updateEmail(user, email);
    } catch (error) {
      console.error('Error al actualizar email:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar la contraseña del usuario
  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Reautenticar al usuario antes de actualizar la contraseña
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Actualizar la contraseña
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar contraseña');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar errores
  const clearError = () => setError(null);

  // Valor del contexto
  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}