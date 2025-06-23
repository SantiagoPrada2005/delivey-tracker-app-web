'use client';

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { UserAuthNav } from '@/components/user-auth-nav';
import { Badge } from '@/components/ui/badge';
import { Bell, Home, Package, Users, ShoppingBag, Truck, Settings } from 'lucide-react';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
  }>;
}

export function DashboardLayout({ children, currentPage, breadcrumbItems }: DashboardLayoutProps) {
  // Prevenir scroll del body cuando el sidebar esté abierto en móviles
  React.useEffect(() => {
    const handleSidebarToggle = () => {
      const sidebarContainer = document.querySelector('[data-slot="sidebar-container"]');
      const isExpanded = sidebarContainer?.getAttribute('data-state') === 'expanded';
      
      if (window.innerWidth <= 768) {
        if (isExpanded) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    };

    // Observar cambios en el estado del sidebar
    const observer = new MutationObserver(handleSidebarToggle);
    const sidebarContainer = document.querySelector('[data-slot="sidebar-container"]');
    
    if (sidebarContainer) {
      observer.observe(sidebarContainer, {
        attributes: true,
        attributeFilter: ['data-state']
      });
    }

    // Cleanup
    return () => {
      observer.disconnect();
      document.body.style.overflow = '';
    };
  }, []);

  // Definir los elementos del menú principal
  const mainMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Pedidos", url: "/pedidos", icon: Package, badge: 25 },
    { title: "Clientes", url: "/clientes", icon: Users },
    { title: "Productos", url: "/productos", icon: ShoppingBag },
    { title: "Repartidores", url: "/repartidores", icon: Truck },
    { title: "Configuración", url: "/configuracion", icon: Settings },
  ];

  // Definir los elementos del menú de notificaciones
  const notificationItems = [
    { title: "Nuevos pedidos", url: "/notificaciones/pedidos", count: 5 },
    { title: "Alertas de stock", url: "/notificaciones/stock", count: 3 },
    { title: "Mensajes", url: "/notificaciones/mensajes", count: 2 },
  ];

  // Generar breadcrumb por defecto si no se proporciona
  const defaultBreadcrumb = [
    { label: "Dashboard", href: "/dashboard" },
    { label: currentPage }
  ];

  const breadcrumb = breadcrumbItems || defaultBreadcrumb;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
      <Sidebar staticOnDesktop={true}>
        <SidebarHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Delivery Tracker</span>
              <span className="truncate text-xs text-muted-foreground">Gestión de entregas</span>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificaciones
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {notificationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.count && (
                          <Badge variant="destructive" className="ml-auto">
                            {item.count}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t p-4">
          <div className="flex items-center justify-between">
            <UserAuthNav />
            <ThemeSwitcher />
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset className="min-h-screen overflow-x-hidden flex-1">
        <header className="sticky top-0 z-[60] flex h-12 sm:h-14 lg:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4">
            <SidebarTrigger className="-ml-1 h-8 w-8 sm:h-9 sm:w-9 touch-target" hideOnDesktop={true} />
            <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumb.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem className="hidden sm:block">
                      {index === breadcrumb.length - 1 ? (
                        <BreadcrumbPage className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href} className="text-xs sm:text-sm hover:text-foreground/80 truncate max-w-[100px] sm:max-w-none">{item.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumb.length - 1 && (
                      <BreadcrumbSeparator className="hidden sm:block" />
                    )}
                  </React.Fragment>
                ))}
                {/* Breadcrumb móvil simplificado */}
                <BreadcrumbItem className="sm:hidden">
                  <BreadcrumbPage className="text-xs font-medium truncate max-w-[100px]">
                    {breadcrumb[breadcrumb.length - 1]?.label}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4">
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>
            <UserAuthNav />
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 pt-3 sm:pt-4 lg:pt-6 overflow-x-hidden overflow-y-auto max-w-full">
          {children}
        </div>
      </SidebarInset>
      </div>
    </SidebarProvider>
  );
}