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
import { Plus, Users, Mail } from 'lucide-react';

interface NoOrganizationFlowProps {
  className?: string;
}

export function NoOrganizationFlow({ className }: NoOrganizationFlowProps) {
  const router = useRouter();
  const { currentStep, isFlowActive, resetRedirection } = useOrganizationFlow();

  // Solo mostrar si el estado es NO_ORGANIZATION
  if (!isFlowActive || currentStep !== 'no-organization') {
    return null;
  }

  const handleCreateOrganization = () => {
    resetRedirection();
    router.push('/organization/create');
  };

  const handleJoinOrganization = () => {
    resetRedirection();
    router.push('/organization/invitations');
  };

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 ${className}`}>
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">¡Bienvenido!</h1>
          <p className="text-muted-foreground">
            Para comenzar a usar la aplicación, necesitas crear una organización o unirte a una existente.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Crear nueva organización */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">Crear Organización</CardTitle>
              </div>
              <CardDescription>
                Crea una nueva organización y conviértete en el administrador.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Incluye:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Panel de administración completo</li>
                  <li>• Gestión de usuarios y permisos</li>
                  <li>• Configuración personalizada</li>
                  <li>• Invitaciones a miembros</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
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
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle className="text-xl">Unirse a Organización</CardTitle>
              </div>
              <CardDescription>
                Únete a una organización existente mediante una invitación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Necesitas:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Una invitación válida</li>
                  <li>• Acceso al email de invitación</li>
                  <li>• Aprobación del administrador</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
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
      </div>
    </div>
  );
}