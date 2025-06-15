'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizationFlow } from '@/contexts/organization-flow-context';
import { authenticatedGet, authenticatedPut } from '@/lib/auth/client-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Invitation = {
  id: string;
  organizationId: string;
  organizationName: string;
  inviterEmail: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};

export function OrganizationInvitations() {
  const { isAuthenticated } = useAuth();
  const { refreshOrganizationStatus, completeFlow } = useOrganizationFlow();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await authenticatedGet('/api/organizations/invitations');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al obtener invitaciones');
      }

      const data = await response.json();
      setInvitations(data);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar invitaciones');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleInvitation = async (invitationId: string, action: 'accept' | 'reject') => {
    if (!isAuthenticated) return;
    
    try {
      setProcessingId(invitationId);
      setError(null);
      setSuccessMessage(null);
      
      const response = await authenticatedPut(`/api/organizations/invitations/${invitationId}`, { action });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error al ${action === 'accept' ? 'aceptar' : 'rechazar'} la invitación`);
      }

      // Actualizar la lista de invitaciones
      if (action === 'accept') {
        setSuccessMessage('Invitación aceptada correctamente. Redirigiendo...');
        
        // Actualizar el estado de la organización y completar el flujo
        await refreshOrganizationStatus();
        completeFlow();
        
        // Redireccionar al dashboard después de aceptar
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setSuccessMessage('Invitación rechazada');
        // Actualizar la lista de invitaciones
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
        
        // Refrescar el estado para verificar si hay más invitaciones
        await refreshOrganizationStatus();
      }
    } catch (err) {
      console.error(`Error ${action === 'accept' ? 'accepting' : 'rejecting'} invitation:`, err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando invitaciones...</span>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Invitaciones a organizaciones</CardTitle>
        <CardDescription>
          Gestiona las invitaciones que has recibido para unirte a organizaciones
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {invitations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No tienes invitaciones pendientes
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{invitation.organizationName}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Invitado por: {invitation.inviterEmail}
                </p>
                <div className="flex space-x-2 mt-3">
                  <Button
                    onClick={() => handleInvitation(invitation.id, 'accept')}
                    disabled={processingId === invitation.id}
                    className="flex-1"
                  >
                    {processingId === invitation.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : 'Aceptar'}
                  </Button>
                  <Button
                    onClick={() => handleInvitation(invitation.id, 'reject')}
                    disabled={processingId === invitation.id}
                    variant="outline"
                    className="flex-1"
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={() => router.push('/organization/create')}>
          Crear nueva organización
        </Button>
      </CardFooter>
    </Card>
  );
}