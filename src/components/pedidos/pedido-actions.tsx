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
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button onClick={onCreateClick} className="md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pedido
        </Button>
        
        {/* Dialog de confirmación para eliminar */}
        {selectedPedido && onDeleteConfirm && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Eliminar Pedido
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el pedido #{selectedPedido.id} y todos sus datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteConfirm}>
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