import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShelfTable } from "@/components/shelves/ShelfTable";
import { AddShelfDialog } from "@/components/shelves/AddShelfDialog";
import { EditShelfDialog } from "@/components/shelves/EditShelfDialog";
import { DeleteShelfDialog } from "@/components/shelves/DeleteShelfDialog";
import { useShelvesStore } from "@/lib/stores/shelvesStore";
import { useUserStore } from "@/lib/stores/userStore";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";
import { getShelvesFilterOptions } from "@/api/shelfApi";
import type { Shelf } from "@/lib/types/shelf";
import { toast } from "sonner";
import { useRequireOrganization } from "@/hooks/common/useRequireOrganization";

export default function ShelvesPage() {
  const navigate = useNavigate();
  const { shelves, fetchShelves } = useShelvesStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const { selectedOrganizationId, organizations, setOrganizations } = useOrganizationStore();
  
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Nový state pro zobrazení nepřiřazených regálů (pouze pro sys_admin)
  const [showUnassigned, setShowUnassigned] = useState(false);

  // Kontrola oprávnění - pro běžné uživatele je stále potřeba organizace
  // pro sys_admin umožníme i zobrazení všech regálů nebo nepřiřazených regálů
  const isSysAdmin = currentUser?.role === 'sys_admin';
  const requireAuthOptions = isSysAdmin ? {} : { includeOrgAdmin: true };
  const loadingOrRedirecting = useRequireOrganization(requireAuthOptions);

  useEffect(() => {
    // Načtení organizací pro sys_admin
    if (organizations.length === 0) {
      setOrganizations();
    }

    // Načtení regálů s filtrem dle role uživatele
    const loadShelves = async () => {
      if (!currentUser) return;
      
      // Získáme filtrovací možnosti podle role uživatele, vybrané organizace
      // a příznaku pro zobrazení nepřiřazených regálů
      const filterOptions = getShelvesFilterOptions(
        currentUser, 
        selectedOrganizationId, 
        showUnassigned
      );
      
      // Nahráváme regály podle filtrovacích možností
      await fetchShelves(filterOptions);
    };
    
    loadShelves();
  }, [currentUser, selectedOrganizationId, showUnassigned, organizations.length, setOrganizations]);

  if (loadingOrRedirecting) {
    return <div>Načítání...</div>;
  }

  // Získání názvu aktuální organizace
  const selectedOrg = organizations.find((o) => String(o.id) === selectedOrganizationId);

  const handleViewShelf = (shelf: Shelf) => {
    navigate(`/shelves/${shelf.id}`);
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
    <div className="container py-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">
              {currentUser?.role === "sys_admin" && selectedOrg
                ? `Regály organizace: ${selectedOrg.name}`
                : currentUser?.role === "sys_admin" && showUnassigned
                  ? "Nepřiřazené regály"
                  : currentUser?.role === "sys_admin"
                    ? "Všechny regály"
                    : "Regály"
              }
            </h1>
            <p className="text-muted-foreground">
              Správa regálů ve vašem systému.
            </p>
          </div>
          
          {/* Zobřazení filtru pouze pro sys_admin uživatele */}
          {currentUser?.role === "sys_admin" && (
            <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-md">
              <input 
                type="checkbox" 
                id="show-unassigned"
                checked={showUnassigned}
                onChange={(e) => setShowUnassigned(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <label htmlFor="show-unassigned" className="text-sm font-medium">
                Zobrazit pouze nepřiřazené regály
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <ShelfTable
          shelves={shelves}
          onView={handleViewShelf}
          onEdit={handleEditShelf}
          onDelete={handleDeleteShelf}
          onAdd={() => toast.info("Pro přidání regálu použijte tlačítko v horní části stránky")}
        />
      </div>

      <div className="fixed bottom-6 right-6 md:hidden">
        <AddShelfDialog />
      </div>

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
    </div>
  );
}
