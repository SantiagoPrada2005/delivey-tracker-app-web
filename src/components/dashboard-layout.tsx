'use client';

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
      <Sidebar>
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
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumb.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                      {item.href ? (
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <main className="flex-1 space-y-4 p-4 md:p-6 pt-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}