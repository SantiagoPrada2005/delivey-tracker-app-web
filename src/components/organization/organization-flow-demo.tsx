'use client';

import React from 'react';
import { useOrganizationFlow } from '@/contexts/organization-flow-context';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, User, Building, Clock, CheckCircle } from 'lucide-react';

interface OrganizationFlowDemoProps {
  className?: string;
}

export function OrganizationFlowDemo({ className }: OrganizationFlowDemoProps) {
  const { user } = useAuth();
  const {
    isFlowActive,
    currentStep,
    refreshOrganizationStatus,
    organizationData,
    isRefreshing,
    lastRefresh,
  } = useOrganizationFlow();

  const getStepBadgeVariant = (step: string) => {
    switch (step) {
      case 'loading':
        return 'secondary';
      case 'no-organization':
        return 'destructive';
      case 'pending-invitation':
      case 'pending-request':
        return 'default';
      case 'has-organization':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'loading':
        return <Clock className="h-4 w-4" />;
      case 'no-organization':
        return <User className="h-4 w-4" />;
      case 'pending-invitation':
      case 'pending-request':
        return <Clock className="h-4 w-4" />;
      case 'has-organization':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStepDescription = (step: string) => {
    switch (step) {
      case 'loading':
        return 'Verificando estado de organización...';
      case 'no-organization':
        return 'El usuario no tiene organización';
      case 'pending-invitation':
        return 'El usuario tiene invitaciones pendientes';
      case 'pending-request':
        return 'El usuario tiene solicitudes pendientes';
      case 'has-organization':
        return 'El usuario tiene acceso a una organización';
      default:
        return 'Estado desconocido';
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Estado del Flujo de Organización
          </CardTitle>
          <CardDescription>
            Usuario no autenticado
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Estado del Flujo de Organización
        </CardTitle>
        <CardDescription>
          Información del estado actual del usuario en el flujo de organización
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado actual */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Estado actual:</span>
            <Badge variant={getStepBadgeVariant(currentStep)} className="flex items-center gap-1">
              {getStepIcon(currentStep)}
              {currentStep}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {isFlowActive ? 'Flujo activo' : 'Flujo completado'}
          </div>
        </div>

        {/* Descripción */}
        <div className="text-sm text-muted-foreground">
          {getStepDescription(currentStep)}
        </div>

        {/* Datos de organización */}
        {organizationData && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Datos de organización:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Invitaciones pendientes:</span>
                <span className="ml-1">{organizationData.pendingInvitations?.length || 0}</span>
              </div>
              <div>
                <span className="font-medium">Solicitudes pendientes:</span>
                <span className="ml-1">{organizationData.pendingRequests?.length || 0}</span>
              </div>
            </div>
            {organizationData.currentOrganization && (
              <div className="text-xs">
                <span className="font-medium">Organización actual:</span>
                <span className="ml-1">{organizationData.currentOrganization.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Última actualización */}
        {lastRefresh && (
          <div className="text-xs text-muted-foreground">
            Última actualización: {lastRefresh.toLocaleTimeString()}
          </div>
        )}

        {/* Botón de actualización */}
        <Button
          onClick={refreshOrganizationStatus}
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          className="w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar Estado'}
        </Button>
      </CardContent>
    </Card>
  );
}