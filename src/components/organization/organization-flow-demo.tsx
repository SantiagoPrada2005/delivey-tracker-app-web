'use client';

import React from 'react';
import { useOrganizationFlow } from '@/contexts/organization-flow-context';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, User, Building2, Clock, CheckCircle2 } from 'lucide-react';

interface OrganizationFlowDemoProps {
  className?: string;
}

export function OrganizationFlowDemo({ className }: OrganizationFlowDemoProps) {
  const { user } = useAuth();
  const { organizationStatus, checkingStatus, currentOrganization } = useOrganization();
  const {
    currentStep,
    isFlowActive,
    organizationData,
    refreshOrganizationStatus,
    isRefreshing,
    lastRefresh,
    resetRedirection,
    completeFlow
  } = useOrganizationFlow();

  const getStepColor = (step: string) => {
    switch (step) {
      case 'loading':
        return 'bg-gray-100 text-gray-800';
      case 'no-organization':
        return 'bg-red-100 text-red-800';
      case 'pending-invitation':
        return 'bg-blue-100 text-blue-800';
      case 'pending-request':
        return 'bg-yellow-100 text-yellow-800';
      case 'has-organization':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Estado del Flujo de Organización
          </CardTitle>
          <CardDescription>
            Información detallada sobre el estado actual del flujo de organización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado del Usuario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Usuario</h4>
              <Badge variant={user ? 'default' : 'secondary'}>
                {user ? `Autenticado: ${user.email}` : 'No autenticado'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Estado Actual</h4>
              <Badge className={getStepColor(currentStep)}>
                <span className="flex items-center gap-1">
                  {getStepIcon(currentStep)}
                  {currentStep.replace('-', ' ').toUpperCase()}
                </span>
              </Badge>
            </div>
          </div>

          {/* Estado de Verificación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Verificando Estado</h4>
              <Badge variant={checkingStatus ? 'default' : 'secondary'}>
                {checkingStatus ? 'Verificando...' : 'Completado'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Flujo Activo</h4>
              <Badge variant={isFlowActive ? 'destructive' : 'default'}>
                {isFlowActive ? 'Requiere Acción' : 'Completado'}
              </Badge>
            </div>
          </div>

          {/* Organización Actual */}
          {currentOrganization && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Organización Actual</h4>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">{currentOrganization.name}</p>
                <p className="text-sm text-green-600">Slug: {currentOrganization.slug}</p>
                {currentOrganization.address && (
                  <p className="text-sm text-green-600">Dirección: {currentOrganization.address}</p>
                )}
              </div>
            </div>
          )}

          {/* Datos del Flujo */}
          {organizationData && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Datos del Flujo</h4>
              
              {organizationData.pendingInvitations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-600">
                    Invitaciones Pendientes ({organizationData.pendingInvitations.length})
                  </p>
                  {organizationData.pendingInvitations.map((invitation, index) => (
                    <div key={invitation.id || index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <p className="font-medium">{invitation.organizationName}</p>
                      <p className="text-blue-600">De: {invitation.inviterEmail}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {organizationData.pendingRequests.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-600">
                    Solicitudes Pendientes ({organizationData.pendingRequests.length})
                  </p>
                  {organizationData.pendingRequests.map((request, index) => (
                    <div key={request.id || index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <p className="font-medium">{request.organizationName}</p>
                      <p className="text-yellow-600">Estado: {request.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Última Actualización */}
          {lastRefresh && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Última Actualización</h4>
              <p className="text-sm text-muted-foreground">
                {lastRefresh.toLocaleString()}
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              onClick={refreshOrganizationStatus}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar Estado
            </Button>
            
            <Button
              onClick={resetRedirection}
              variant="outline"
              size="sm"
            >
              Resetear Redirección
            </Button>
            
            {currentStep === 'has-organization' && (
              <Button
                onClick={completeFlow}
                variant="outline"
                size="sm"
              >
                Completar Flujo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información de Debug */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Información de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
            {JSON.stringify({
              currentStep,
              isFlowActive,
              checkingStatus,
              organizationStatus: organizationStatus?.status,
              hasOrganization: !!currentOrganization,
              pendingInvitations: organizationData?.pendingInvitations?.length || 0,
              pendingRequests: organizationData?.pendingRequests?.length || 0,
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}