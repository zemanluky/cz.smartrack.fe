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
  const [showUnassigned, setShowUnassigned] = useState(false);

  useEffect(() => {
    const loadShelves = async () => {
      if (!currentUser || currentUser.role !== 'sys_admin') return;
      
      const filterOptions: ShelfFilterOptions = {
        // Pro sys_admina chceme buď všechny, nebo jen nepřiřazené
        // organization_id se zde explicitně nenastavuje, pokud chceme všechny
        // nebo se nastaví na null/undefined pro nepřiřazené v getShelvesFilterOptions
        // Pro jednoduchost zde můžeme poslat jen příznak showUnassigned
        // a logika ve store/API si to přebere.
        // Pokud by store vyžadoval organization_id: null pro nepřiřazené, přidali bychom to.
        unassigned: showUnassigned ? true : undefined, 
      };
      await fetchShelves(filterOptions);
    };
    
    loadShelves();
  }, [currentUser, fetchShelves, showUnassigned]);

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">
              {showUnassigned ? "Nepřiřazené Regály" : "Správa Všech Regálů"}
            </h1>
            <p className="text-muted-foreground">
              Vytvářejte, upravujte a spravujte strukturu všech regálů v systému.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-md">
              <input 
                type="checkbox" 
                id="show-unassigned"
                checked={showUnassigned}
                onChange={(e) => setShowUnassigned(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <label htmlFor="show-unassigned" className="text-sm font-medium">
                Zobrazit pouze nepřiřazené
              </label>
            </div>
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
