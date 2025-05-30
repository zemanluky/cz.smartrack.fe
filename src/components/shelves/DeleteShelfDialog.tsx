import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useShelvesStore } from "@/lib/stores/shelvesStore";
import type { Shelf } from "@/lib/types/shelf";

interface DeleteShelfDialogProps {
  shelf: Shelf | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteShelfDialog: React.FC<DeleteShelfDialogProps> = ({
  shelf,
  open,
  onOpenChange,
}) => {
  const { removeShelf, fetchShelfById, deleteShelfPosition } = useShelvesStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!shelf) {
      toast.error("Nelze smazat regál, protože nebyl nalezen");
      return;
    }

    try {
      setIsDeleting(true);
      
      // Nejprve získáme detail regálu, abychom měli přístup ke všem pozicím
      const shelfDetail = await fetchShelfById(shelf.id);
      
      if (shelfDetail && shelfDetail.shelf_positions.length > 0) {
        toast.info(`Mažu všechny pozice regálu (${shelfDetail.shelf_positions.length})...`);
        
        // Postupně smažeme všechny pozice
        for (const position of shelfDetail.shelf_positions) {
          try {
            await deleteShelfPosition(shelf.id, position.id);
          } catch (posError: any) {
            console.error(`Chyba při mazání pozice ${position.id}:`, posError);
            // Pokračujeme s dalšími pozicemi, i když nějaká selhá
          }
        }
      }
      
      // Až po smazání všech pozic smažeme samotný regál
      await removeShelf(shelf.id);
      toast.success("Regál byl úspěšně smazán");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Chyba při mazání regálu:', error);
      toast.error(error.message || "Nepodařilo se smazat regál");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Opravdu chcete smazat tento regál?</AlertDialogTitle>
          <AlertDialogDescription>
            {shelf ? (
              <div className="space-y-2">
                <div>Chystáte se smazat regál <strong>{shelf.shelf_name}</strong>. Tato akce nelze vzít zpět.</div>
                {shelf.shelf_position_count > 0 && (
                  <div className="mt-2 text-red-500">
                    Upozornění: Tento regál obsahuje {shelf.shelf_position_count} pozic, které budou také smazány!
                  </div>
                )}
              </div>
            ) : (
              "Načítání detailů regálu..."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Zrušit</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Mazání..." : "Smazat"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
