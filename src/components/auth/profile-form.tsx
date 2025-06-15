'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, AlertCircle, CheckCircle, User } from 'lucide-react';

export function ProfileForm() {
  const { user, loading, error, updateUserProfile, updateUserEmail, updateUserPassword, clearError, isAuthenticated } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Cargar datos del usuario cuando esté disponible
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    setSuccess(null);
    setIsUpdatingProfile(true);

    try {
      // Actualizar nombre de usuario
      if (user?.displayName !== displayName) {
        await updateUserProfile(displayName);
      }
      
      // Actualizar correo electrónico
      if (user?.email !== email && currentPassword) {
        await updateUserEmail(email, currentPassword);
      } else if (user?.email !== email && !currentPassword) {
        setFormError('Se requiere la contraseña actual para actualizar el correo electrónico');
        setIsUpdatingProfile(false);
        return;
      }
      
      setSuccess('Perfil actualizado correctamente');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Error al actualizar el perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    setSuccess(null);
    
    // Validación básica
    if (!currentPassword) {
      setFormError('Por favor, ingresa tu contraseña actual');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setFormError('Las contraseñas nuevas no coinciden');
      return;
    }
    
    if (newPassword.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      await updateUserPassword(currentPassword, newPassword);
      setSuccess('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Error al actualizar la contraseña');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Debes iniciar sesión para ver tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Formulario de perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Información de perfil</CardTitle>
          <CardDescription>
            Actualiza tu información personal
            {user?.role && (
              <span className="block mt-1 text-sm font-medium text-blue-600">
                Rol: {user.role === 'ADMIN' ? 'Administrador' : 
                      user.role === 'MANAGER' ? 'Gerente' : 
                      user.role === 'USER' ? 'Usuario' : user.role}
              </span>
            )}
            {user?.organizationId && (
              <span className="block mt-1 text-sm text-green-600">
                Organización ID: {user.organizationId}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre completo</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Tu nombre"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isUpdatingProfile || loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isUpdatingProfile || loading}
              />
            </div>

            {success && (
              <div className="bg-green-50 text-green-800 p-3 rounded-md flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">{success}</div>
              </div>
            )}

            {(error || formError) && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">{formError || error}</div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isUpdatingProfile || loading}
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Formulario de cambio de contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Cambiar contraseña</CardTitle>
          <CardDescription>
            Actualiza tu contraseña de acceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isUpdatingPassword || loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isUpdatingPassword || loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isUpdatingPassword || loading}
              />
            </div>

            <Button
              type="submit"
              disabled={isUpdatingPassword || loading}
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Cambiar contraseña
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}