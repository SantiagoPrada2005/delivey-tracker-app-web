'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationFlow } from '@/contexts/organization-flow-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, ArrowRight, RefreshCw, Plus } from 'lucide-react';

interface PendingRequestsFlowProps {
  className?: string;
}

export function PendingRequestsFlow({ className }: PendingRequestsFlowProps) {
  const router = useRouter();
  const { currentStep, isFlowActive, organizationData, refreshOrganizationStatus, isRefreshing, resetRedirection } = useOrganizationFlow();

  // Solo mostrar si el estado es PENDING_REQUEST
  if (!isFlowActive || currentStep !== 'pending-request') {
    return null;
  }

  const pendingRequests = organizationData?.pendingRequests || [];

  const handleViewRequests = () => {
    resetRedirection();
    router.push('/organization/requests');
  };

  const handleCreateOrganization = () => {
    resetRedirection();
    router.push('/organization/create');
  };

  const handleRefreshStatus = async () => {
    await refreshOrganizationStatus();
  };

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 ${className}`}>
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-500/10 rounded-full">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes Pendientes</h1>
          <p className="text-muted-foreground">
            Tienes {pendingRequests.length} solicitud{pendingRequests.length !== 1 ? 'es' : ''} pendiente{pendingRequests.length !== 1 ? 's' : ''} de unión a organizaciones.
          </p>
        </div>

        {/* Lista de solicitudes */}
        <div className="space-y-4">
          {pendingRequests.map((request, index) => (
            <Card key={request.id || index} className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <FileText className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{request.organizationName}</CardTitle>
                      <CardDescription>
                        Solicitud enviada • Esperando aprobación
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="font-medium">¿Qué puedes hacer mientras esperas?</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <Button 
                    onClick={handleViewRequests}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Solicitudes
                  </Button>
                  <Button 
                    onClick={handleRefreshStatus}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Actualizando...' : 'Actualizar Estado'}
                  </Button>
                  <Button 
                    onClick={handleCreateOrganization}
                    className="w-full"
                    size="lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Organización
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg mt-0.5">
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Tiempo de espera</h4>
                    <p className="text-sm text-muted-foreground">
                      Las solicitudes son revisadas por los administradores de la organización. El tiempo de respuesta puede variar.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-500/10 rounded-lg mt-0.5">
                    <Plus className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Alternativa</h4>
                    <p className="text-sm text-muted-foreground">
                      Si necesitas acceso inmediato, puedes crear tu propia organización y comenzar a trabajar de inmediato.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}