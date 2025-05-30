// src/app/shelf-management/page.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShelfTable } from "@/components/shelves/ShelfTable";
import { AddShelfDialog } from "@/components/shelves/AddShelfDialog";
import { EditShelfDialog } from "@/components/shelves/EditShelfDialog";
import { DeleteShelfDialog } from "@/components/shelves/DeleteShelfDialog";
import { useShelvesStore } from "@/lib/stores/shelvesStore";
import { useUserStore } from "@/lib/stores/userStore";
import type { Shelf, ShelfFilterOptions } from "@/lib/types/shelf";
// import { toast } from "sonner"; // Zatím není explicitně použito pro onAdd

export default function AdminShelfManagementPage() {
  const navigate = useNavigate();
  const { shelves, fetchShelves, isLoading: shelvesLoading } = useShelvesStore();
  const currentUser = useUserStore((state) => state.currentUser);
  
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadShelves = async () => {
      if (!currentUser || currentUser.role !== 'sys_admin') return;
      
      const filterOptions: ShelfFilterOptions = {
        // Pro sys_admina chceme buď všechny, nebo jen nepřiřazené
        // organization_id se zde explicitně nenastavuje, pokud chceme všechny
        // nebo se nastaví na null/undefined pro nepřiřazené v getShelvesFilterOptions
        // Filtrování podle unassigned bylo odstraněno
      };
      await fetchShelves(filterOptions);
    };
    
    loadShelves();
  }, [currentUser, fetchShelves]);

  if (shelvesLoading && shelves.length === 0) {
    return <div className="container mx-auto p-4">Načítání regálů...</div>;
  }
  
  if (currentUser?.role !== 'sys_admin') {
     return <div className="container mx-auto p-4">Přístup odepřen. Tato stránka je pouze pro systémové administrátory.</div>;
  }

  const handleViewShelf = (shelf: Shelf) => {
    // Navigace na detail regálu pod admin správou
    // Tuto routu jsme upravili v App.tsx na novou cestu bez prefixu /admin/
    navigate(`/shelf-management/${shelf.id}`); 
  };

  const handleEditShelf = (shelf: Shelf) => {
    setSelectedShelf(shelf);
    setEditDialogOpen(true);
  };

  const handleDeleteShelf = (shelf: Shelf) => {
    setSelectedShelf(shelf);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div className="w-full sm:w-auto mb-4 sm:mb-0 sm:pr-4">
            <h1 className="text-2xl font-bold">
              Správa Všech Regálů
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Vytvářejte, upravujte a spravujte strukturu všech regálů v systému.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <AddShelfDialog /> 
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ShelfTable
          shelves={shelves}
          onView={handleViewShelf} // Upraveno pro admin cestu
          onEdit={handleEditShelf}
          onDelete={handleDeleteShelf}
          // onAdd je nyní řešeno tlačítkem AddShelfDialog výše
        />
      </div>

      {selectedShelf && (
        <>
          <EditShelfDialog
            shelf={selectedShelf}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <DeleteShelfDialog
            shelf={selectedShelf}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </div>
  );
}
