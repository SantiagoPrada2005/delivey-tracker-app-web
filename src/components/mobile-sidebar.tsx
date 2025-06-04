"use client";

import { Button } from "@components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet";
import { Menu } from "lucide-react";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="flex h-full flex-col gap-4">
          <div className="flex h-14 items-center border-b px-4 font-semibold">
            <h1 className="text-xl">Administrador de Pedidos</h1>
          </div>
          <div className="flex-1 px-4">
            <nav className="flex flex-col gap-2">
              <a href="#" className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-accent-foreground">
                Dashboard
              </a>
              <a href="#" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                Pedidos
              </a>
              <a href="#" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                Clientes
              </a>
              <a href="#" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                Productos
              </a>
              <a href="#" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                Repartidores
              </a>
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}