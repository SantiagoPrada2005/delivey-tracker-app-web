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
import { Mail, Clock, ArrowRight, RefreshCw } from 'lucide-react';

interface PendingInvitationsFlowProps {
  className?: string;
}

export function PendingInvitationsFlow({ className }: PendingInvitationsFlowProps) {
  const router = useRouter();
  const { currentStep, isFlowActive, organizationData, refreshOrganizationStatus, isRefreshing, resetRedirection } = useOrganizationFlow();

  // Solo mostrar si el estado es PENDING_INVITATION
  if (!isFlowActive || currentStep !== 'pending-invitation') {
    return null;
  }

  const pendingInvitations = organizationData?.pendingInvitations || [];

  const handleViewInvitations = () => {
    resetRedirection();
    router.push('/organization/invitations');
  };

  const handleRefreshStatus = async () => {
    await refreshOrganizationStatus();
  };

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 ${className}`}>
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Invitaciones Pendientes</h1>
          <p className="text-muted-foreground">
            Tienes {pendingInvitations.length} invitación{pendingInvitations.length !== 1 ? 'es' : ''} pendiente{pendingInvitations.length !== 1 ? 's' : ''} para unirte a una organización.
          </p>
        </div>

        {/* Lista de invitaciones */}
        <div className="space-y-4">
          {pendingInvitations.map((invitation, index) => (
            <Card key={invitation.id || index} className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Clock className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{invitation.organizationName}</CardTitle>
                      <CardDescription>
                        Invitado por: {invitation.inviterEmail}
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
                <h3 className="font-medium">¿Qué puedes hacer?</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button 
                    onClick={handleViewInvitations}
                    className="w-full"
                    size="lg"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Ver y Gestionar Invitaciones
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-500/10 rounded-lg mt-0.5">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Importante</h4>
                  <p className="text-sm text-muted-foreground">
                    Las invitaciones pueden tener fecha de expiración. Revisa tu email y acepta las invitaciones lo antes posible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}