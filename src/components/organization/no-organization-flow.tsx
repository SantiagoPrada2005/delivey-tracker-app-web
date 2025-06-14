'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationFlow } from '@/contexts/organization-flow-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Mail, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function NoOrganizationFlow() {
  const router = useRouter();
  const { currentStep, isFlowActive, resetRedirection } = useOrganizationFlow();

  // Logs de depuración
  console.log('🔍 NoOrganizationFlow - Estado actual:', {
    currentStep,
    isFlowActive,
    shouldRender: isFlowActive && currentStep === 'no-organization'
  });

  // Solo mostrar si el estado es NO_ORGANIZATION
  if (!isFlowActive || currentStep !== 'no-organization') {
    console.log('❌ NoOrganizationFlow - NO se renderiza porque:', {
      isFlowActive,
      currentStep,
      condition: 'isFlowActive && currentStep === no-organization'
    });
    return null;
  }

  console.log('✅ NoOrganizationFlow - SE RENDERIZA');

  const handleCreateOrganization = () => {
    resetRedirection();
    router.push('/organization/create');
  };

  const handleJoinOrganization = () => {
    resetRedirection();
    router.push('/organization/invitations');
  };

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Alerta de acceso bloqueado */}
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Acceso Restringido:</strong> Debes configurar una organización para continuar usando la aplicación.
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Configuración Requerida</h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Para acceder a la aplicación, necesitas crear una organización o unirte a una existente.
          </p>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:gap-8">
          {/* Crear nueva organización */}
          <Card className="relative overflow-hidden h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl lg:text-2xl">Crear Organización</CardTitle>
                  <CardDescription className="mt-1">
                    Crea una nueva organización y conviértete en el administrador.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground">Incluye:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Panel de administración completo
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Gestión de usuarios y permisos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Configuración personalizada
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Invitaciones a miembros
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              <Button 
                onClick={handleCreateOrganization}
                className="w-full"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Organización
              </Button>
            </CardFooter>
          </Card>

          {/* Unirse a organización existente */}
          <Card className="relative overflow-hidden h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-xl lg:text-2xl">Unirse a Organización</CardTitle>
                  <CardDescription className="mt-1">
                    Únete a una organización existente mediante una invitación.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground">Necesitas:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Una invitación válida
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Acceso al email de invitación
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Aprobación del administrador
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              <Button 
                onClick={handleJoinOrganization}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Mail className="mr-2 h-4 w-4" />
                Ver Invitaciones
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Información adicional */}
        <div className="mt-8 space-y-6">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-500/10 rounded-lg mt-0.5">
                  <Mail className="h-4 w-4 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">¿Tienes una invitación pendiente?</h4>
                  <p className="text-sm text-muted-foreground">
                    Revisa tu email para invitaciones pendientes o contacta al administrador de la organización.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mensaje de bloqueo adicional */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="h-3 w-3" />
              La aplicación permanecerá bloqueada hasta completar la configuración
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}