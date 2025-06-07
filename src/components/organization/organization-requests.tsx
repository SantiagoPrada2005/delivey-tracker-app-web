'use client';

import React, { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Building2, Calendar, RefreshCw, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrganizationRequestsProps {
  className?: string;
}

export function OrganizationRequests({ className }: OrganizationRequestsProps) {
  const router = useRouter();
  const { organizationData, refreshOrganizationStatus, isRefreshing, resetRedirection } = useOrganizationFlow();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar los datos al montar el componente
    const loadData = async () => {
      await refreshOrganizationStatus();
      setIsLoading(false);
    };
    loadData();
  }, [refreshOrganizationStatus]);

  const handleRefresh = async () => {
    await refreshOrganizationStatus();
  };

  const handleGoBack = () => {
    resetRedirection();
    router.back();
  };

  const handleCreateOrganization = () => {
    resetRedirection();
    router.push('/organization/create');
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Solicitudes</h1>
            <p className="text-muted-foreground">
              Cargando tus solicitudes de organización...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const pendingRequests = organizationData.pendingRequests || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="-ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Solicitudes</h1>
          <p className="text-muted-foreground">
            Gestiona tus solicitudes para unirte a organizaciones
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Solicitudes pendientes */}
      {pendingRequests.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Solicitudes Pendientes</h2>
            <Badge variant="secondary">{pendingRequests.length}</Badge>
          </div>
          
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {request.organizationName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Solicitado el {new Date(request.requestedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pendiente
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Tu solicitud está siendo revisada por los administradores de la organización.
                    Te notificaremos cuando haya una respuesta.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No tienes solicitudes pendientes</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Actualmente no tienes solicitudes para unirte a ninguna organización.
                  Puedes crear tu propia organización o esperar a recibir una invitación.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={handleCreateOrganization}>
              <Building2 className="h-4 w-4 mr-2" />
              Crear Organización
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Información adicional */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>¿Necesitas ayuda?</strong> Las solicitudes pueden tardar en ser procesadas.
          Si tienes dudas, contacta directamente con la organización a la que solicitaste unirte.
        </AlertDescription>
      </Alert>
    </div>
  );
}