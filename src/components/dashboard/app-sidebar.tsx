"use client";

import * as React from "react";
import { Home, Package, Users, ShoppingBag, Truck, Settings, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

// Definir los elementos del menú principal
const mainMenuItems = [
  { title: "Dashboard", url: "/", icon: Home },
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

export function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          {/* Título del sidebar */}
          <div className="flex h-14 items-center border-b px-4 font-semibold">
            <h1 className="text-xl">Administrador de Pedidos</h1>
          </div>
          
          {/* Menú principal */}
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex justify-between w-full">
                        <span className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </span>
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
          
          {/* Sección de notificaciones */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notificaciones</span>
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {notificationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex justify-between w-full">
                        <span>{item.title}</span>
                        {item.count > 0 && (
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
      </Sidebar>
    </SidebarProvider>
  );
}