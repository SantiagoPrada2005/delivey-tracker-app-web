'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useOrganization } from '@/hooks/useOrganization';
import { Badge } from '@/components/ui/badge';

interface OrganizationSelectorProps {
  className?: string;
}

export function OrganizationSelector({ className }: OrganizationSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const {
    selectedOrganizationId,
    organizations,
    currentOrganization,
    loading,
    error,
    selectOrganization,
    hasOrganizations
  } = useOrganization();

  if (loading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Building2 className="h-4 w-4 animate-pulse" />
        <span className="text-sm text-muted-foreground">Cargando organizaciones...</span>
      </div>
    );
  }

  if (error || !hasOrganizations) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Building2 className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">
          {error || 'No hay organizaciones disponibles'}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] justify-between"
          >
            {currentOrganization ? (
              <div className="flex items-center space-x-2">
                <span className="truncate">
                  {currentOrganization.nit ? `NIT: ${currentOrganization.nit}` : `Org ${currentOrganization.id}`}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {currentOrganization.regimenContribucion === 'Regimen simplificado' ? 'Simplificado' : 'Común'}
                </Badge>
              </div>
            ) : (
              'Seleccionar organización...'
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Buscar organización..." />
            <CommandEmpty>No se encontraron organizaciones.</CommandEmpty>
            <CommandGroup>
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.id.toString()}
                  onSelect={() => {
                    selectOrganization(org.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedOrganizationId === org.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {org.nit ? `NIT: ${org.nit}` : `Organización ${org.id}`}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {org.regimenContribucion === 'Regimen simplificado' ? 'Simplificado' : 'Común'}
                      </Badge>
                    </div>
                    {org.address && (
                      <span className="text-xs text-muted-foreground truncate">
                        {org.address}
                      </span>
                    )}
                    {org.phoneService && (
                      <span className="text-xs text-muted-foreground">
                        Tel: {org.phoneService}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Componente compacto del selector de organización para usar en el sidebar
 */
export function CompactOrganizationSelector({ className }: OrganizationSelectorProps) {
  const { currentOrganization, loading } = useOrganization();

  if (loading) {
    return (
      <div className={cn('flex items-center space-x-2 p-2', className)}>
        <Building2 className="h-4 w-4 animate-pulse" />
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2 p-2 border-b', className)}>
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {currentOrganization?.nit ? `NIT: ${currentOrganization.nit}` : 'Sin organización'}
        </span>
        {currentOrganization?.regimenContribucion && (
          <span className="text-xs text-muted-foreground">
            {currentOrganization.regimenContribucion}
          </span>
        )}
      </div>
    </div>
  );
}