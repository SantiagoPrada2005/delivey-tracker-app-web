import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";
import { Pedido } from "./types";

interface PedidoActionsProps {
  onCreateClick: () => void;
  selectedPedido?: Pedido | null;
  onDeleteConfirm?: () => void;
}

export default function PedidoActions({ 
  onCreateClick, 
  selectedPedido, 
  onDeleteConfirm 
}: PedidoActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pedidos</h1>
      </div>
      
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <Button onClick={onCreateClick} className="w-full sm:w-auto text-sm">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden xs:inline">Nuevo Pedido</span>
          <span className="xs:hidden">Nuevo</span>
        </Button>
        
        {/* Dialog de confirmación para eliminar */}
        {selectedPedido && onDeleteConfirm && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="text-sm">
                <span className="hidden xs:inline">Eliminar Pedido</span>
                <span className="xs:hidden">Eliminar</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 max-w-md sm:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg">¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  Esta acción no se puede deshacer. Se eliminará permanentemente el pedido #{selectedPedido.id} y todos sus datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteConfirm} className="w-full sm:w-auto">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}