"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsManagement, CategoriesManagement } from "@/components/productos";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function ProductosPage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "Productos", href: "/productos" }
  ];

  return (
    <DashboardLayout currentPage="Productos" breadcrumbItems={breadcrumbItems}>
          <Tabs defaultValue="productos" className="w-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
                <p className="text-muted-foreground">
                  Administra tus productos y categorías
                </p>
              </div>
            </div>
            
            <TabsList className="grid w-full grid-cols-2 mt-6">
              <TabsTrigger value="productos">Productos</TabsTrigger>
              <TabsTrigger value="categorias">Categorías</TabsTrigger>
            </TabsList>
            
            <TabsContent value="productos">
              <ProductsManagement />
            </TabsContent>

            <TabsContent value="categorias">
              <CategoriesManagement />
            </TabsContent>
          </Tabs>
    </DashboardLayout>
  );
}