// src/app/shelf-management/[id]/page.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useShelvesStore } from "@/lib/stores/shelvesStore";
import { EditShelfDialog } from "@/components/shelves/EditShelfDialog";
import { DeleteShelfDialog } from "@/components/shelves/DeleteShelfDialog";
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useUserStore } from "@/lib/stores/userStore";
import type { Shelf } from "@/lib/types/shelf";

export default function ShelfManagementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedShelf, fetchShelfById, setSelectedShelf } = useShelvesStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Kontrola oprávnění - tato stránka je pouze pro sys_admin
  useEffect(() => {
    if (currentUser?.role !== 'sys_admin') {
      navigate('/dashboard');
      return;
    }

    if (id) {
      // Načtení detailu regálu
      fetchShelfById(Number(id));
    }

    // Při opuštění stránky vyčistíme detail regálu
    return () => {
      setSelectedShelf(null);
    };
  }, [id, fetchShelfById, setSelectedShelf, currentUser, navigate]);

  if (currentUser?.role !== 'sys_admin') {
    return null; // Už se přesměruje v useEffect
  }

  if (!selectedShelf) {
    return <div className="container py-6">Načítání detailu regálu...</div>;
  }

  const handleBack = () => {
    navigate("/shelf-management"); // Aktualizovaná cesta zpět na správu regálů
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Button variant="outline" size="sm" onClick={handleBack} className="mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Zpět na správu regálů
          </Button>
          <h1 className="text-2xl font-bold">{selectedShelf.shelf_name}</h1>
          <p className="text-muted-foreground">
            {selectedShelf.shelf_store_location || "Umístění není specifikováno"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
            className="flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Upravit regál
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Smazat regál
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Informace o regálu</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">ID:</span> {selectedShelf.id}</p>
                  <p><span className="font-medium">Název:</span> {selectedShelf.shelf_name}</p>
                  <p>
                    <span className="font-medium">Umístění:</span>{" "}
                    {selectedShelf.shelf_store_location || "Není specifikováno"}
                  </p>
                  {selectedShelf.organization && (
                    <p><span className="font-medium">Organizace:</span> {selectedShelf.organization.name}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Pozice</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Počet pozic:</span> {selectedShelf.shelf_position_count || 0}</p>
                  <Button>Přidat pozici</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Mřížka pozic regálu</h2>
        {selectedShelf.shelf_positions && selectedShelf.shelf_positions.length > 0 ? (
          <div className="bg-muted p-8 rounded-lg text-center">
            <p className="text-muted-foreground">Zobrazení mřížky pozic regálu bude implementováno v další fázi.</p>
          </div>
        ) : (
          <div className="bg-muted p-8 rounded-lg text-center">
            <p className="text-muted-foreground">Tento regál zatím nemá žádné pozice.</p>
            <Button className="mt-4">Přidat první pozici</Button>
          </div>
        )}
      </div>

      {/* Dialogy */}
      <EditShelfDialog
        shelf={selectedShelf as Shelf}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <DeleteShelfDialog
        shelf={selectedShelf as Shelf}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
