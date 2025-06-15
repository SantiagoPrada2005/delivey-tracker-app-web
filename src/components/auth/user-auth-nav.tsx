'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings } from 'lucide-react';

export function UserAuthNav() {
  const { user, signOut, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Si está cargando, mostrar un estado de carga
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar botones de inicio de sesión y registro
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => router.push('/auth/login')}
        >
          Iniciar sesión
        </Button>
        <Button
          onClick={() => router.push('/auth/register')}
        >
          Registrarse
        </Button>
      </div>
    );
  }

  // Si hay usuario autenticado, mostrar menú desplegable con opciones
  // Verificación adicional de seguridad para TypeScript
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Usuario'} />
            <AvatarFallback>{getInitials(user.displayName || user.email || 'Usuario')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || 'Usuario'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {user.role && (
              <p className="text-xs leading-none text-blue-600 font-medium">
                {user.role === 'ADMIN' ? 'Administrador' : 
                 user.role === 'MANAGER' ? 'Gerente' : 
                 user.role === 'USER' ? 'Usuario' : user.role}
              </p>
            )}
            {user.organizationId && (
              <p className="text-xs leading-none text-green-600">
                Org: {user.organizationId}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/perfil')}>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/configuracion')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.push('/auth/login');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Función para obtener las iniciales del nombre
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}