'use client';

import React from 'react';
import { Loader2, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface OrganizationLoadingProps {
  message?: string;
  className?: string;
}

export function OrganizationLoading({ 
  message = "Verificando estado de organización...",
  className 
}: OrganizationLoadingProps) {
  return (
    <div className={`flex items-center justify-center min-h-screen p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <Loader2 className="h-6 w-6 text-primary animate-spin absolute -top-1 -right-1" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-medium text-lg">Cargando...</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}