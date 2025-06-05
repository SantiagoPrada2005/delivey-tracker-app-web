'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword, loading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    setSuccess(false);

    // Validación básica
    if (!email) {
      setFormError('Por favor, ingresa tu correo electrónico');
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      // El error ya se maneja en el contexto de autenticación
      console.error('Error en el formulario de restablecimiento de contraseña:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Restablecer contraseña</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico para recibir un enlace de restablecimiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="bg-green-50 text-green-800 p-4 rounded-md flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Correo enviado</p>
              <p className="text-sm mt-1">
                Hemos enviado un enlace de restablecimiento de contraseña a {email}.
                Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/auth/login')}
              >
                Volver al inicio de sesión
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {(error || formError) && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">{formError || error}</div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar enlace de restablecimiento
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          ¿Recordaste tu contraseña?{' '}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => router.push('/auth/login')}
          >
            Inicia sesión
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}