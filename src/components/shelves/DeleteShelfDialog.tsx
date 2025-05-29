import React from "react";
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
  const { removeShelf } = useShelvesStore();

  const handleDelete = async () => {
    if (!shelf) {
      toast.error("Nelze smazat regál, protože nebyl nalezen");
      return;
    }

    try {
      await removeShelf(shelf.id);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Nepodařilo se smazat regál");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Opravdu chcete smazat tento regál?</AlertDialogTitle>
          <AlertDialogDescription>
            {shelf ? (
              <>
                Chystáte se smazat regál <strong>{shelf.shelf_name}</strong>. Tato akce nelze vzít zpět.
                {shelf.shelf_position_count > 0 && (
                  <div className="mt-2 text-red-500">
                    Upozornění: Tento regál obsahuje {shelf.shelf_position_count} pozic, které budou také smazány!
                  </div>
                )}
              </>
            ) : (
              "Načítání detailů regálu..."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Zrušit</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Smazat
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
