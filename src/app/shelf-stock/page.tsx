// src/app/shelf-stock/page.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShelvesStore } from "@/lib/stores/shelvesStore";
import { useUserStore } from "@/lib/stores/userStore";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Package2, Loader2 } from "lucide-react";
import type { Shelf, ShelfDetail } from "@/lib/types/shelf";
import { ShelfPositionGrid } from "@/components/shelves/ShelfPositionGrid";

export default function ShelfStockPage() {
  const navigate = useNavigate();
  const { shelves, fetchShelves, fetchShelfById, isLoading: shelvesLoading, selectedShelf: storeSelectedShelf } = useShelvesStore();
  // Sledujeme shelves přímo ze store pro logování a aktualizace UI
  const storeShelvesForLogging = useShelvesStore((state) => state.shelves);
  const currentUser = useUserStore((state) => state.currentUser);
  const isUserLoaded = useUserStore((state) => state.isUserLoaded);
  const { selectedOrganizationId } = useOrganizationStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShelves, setFilteredShelves] = useState<Shelf[]>([]);
  const [selectedShelf, setSelectedShelf] = useState<ShelfDetail | null>(null);
  const [activeTab, setActiveTab] = useState("shelves");
  
  // Kontrola oprávnění a načítání dat
  const loadShelves = useCallback(async () => {
    if (!currentUser) return;

    let orgIdToLoad: number | undefined = undefined;

    if (currentUser.role === "org_admin") {
      if (currentUser.organization && currentUser.organization.id) {
        orgIdToLoad = currentUser.organization.id;
      } else {
        toast.error("Chyba: Organizace pro vašeho uživatele nebyla nalezena při pokusu o načtení regálů.");
        return;
      }
    } else if (currentUser.role === "sys_admin") {
      // Sys_admin na této stránce prozatím načítá všechny regály.
      // Filtrování podle selectedOrganizationId zde není implementováno tak, jak na /shelf-management.
      // Pokud by bylo potřeba, musela by se ověřit a případně upravit fetchShelves a API.
      orgIdToLoad = undefined; // Zajistí načtení všech regálů
    } else {
      return; // Ostatní role by měly být přesměrovány v useEffect
    }

    console.log('[ShelfStockPage] Calling fetchShelves with organization_id:', orgIdToLoad);
    await fetchShelves({
      organization_id: orgIdToLoad,
    });
  }, [currentUser, selectedOrganizationId, fetchShelves]);

  useEffect(() => {
    if (!isUserLoaded) {
      // Počkat, dokud se nedokončí načítání uživatele
      return;
    }

    if (!currentUser) {
      toast.info("Přihlašte se pro přístup k této stránce.");
      navigate('/dashboard');
      return;
    }

    if (currentUser.role === "org_admin") {
      if (!currentUser.organization || !currentUser.organization.id) {
        toast.error("Vašemu účtu není přiřazena organizace, nebo se ji nepodařilo načíst. Kontaktujte administrátora.");
        navigate('/dashboard');
        return;
      } else {
        loadShelves(); // Načte regály pro organizaci org_admina
      }
    } else if (currentUser.role === "sys_admin") {
      loadShelves(); // Sys admin může vidět regály (všechny nebo dle výběru)
    } else {
      toast.error("Nemáte oprávnění pro přístup k této stránce.");
      navigate('/dashboard');
      return;
    }
  }, [currentUser, isUserLoaded, selectedOrganizationId, navigate, loadShelves]);

  // Logování změn v 'shelves' ze store a aktualizace UI
  useEffect(() => {
    console.log('[ShelfStockPage] Shelves in store updated:', storeShelvesForLogging);
    // Aktualizujeme filtrované regály, kdykoli se změní původní seznam
    updateFilteredShelves();
  }, [storeShelvesForLogging]);
  
  // Synchronizace selectedShelf z store
  useEffect(() => {
    if (storeSelectedShelf) {
      setSelectedShelf(storeSelectedShelf);
    }
  }, [storeSelectedShelf]);
  
  // Funkce pro aktualizaci filtrovaných regálů
  const updateFilteredShelves = useCallback(() => {
    if (!shelves) {
      setFilteredShelves([]);
      return;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = shelves.filter((shelf) => 
      shelf.shelf_name.toLowerCase().includes(lowerQuery) ||
      (shelf.shelf_store_location && shelf.shelf_store_location.toLowerCase().includes(lowerQuery))
    );
    
    setFilteredShelves(filtered);
  }, [shelves, searchQuery]);
  
  // Aktualizace filtrovaných regálů při změně vyhledávání
  useEffect(() => {
    updateFilteredShelves();
  }, [updateFilteredShelves]);
  
  const handleShelfSelect = async (shelf: Shelf) => {
    try {
      const detailShelf = await fetchShelfById(shelf.id);
      if (detailShelf) {
        setSelectedShelf(detailShelf);
        setActiveTab("shelf-detail");
      }
    } catch (error) {
      toast.error("Nepodařilo se načíst detail regálu");
    }
  };
  
  const handleBackToShelves = () => {
    setSelectedShelf(null);
    setActiveTab("shelves");
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Správa skladu</h1>
          <p className="text-muted-foreground">Přiřazujte produkty na pozice a spravujte své regály</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="shelves" disabled={activeTab === "shelf-detail"}>Přehled regálů</TabsTrigger>
          {selectedShelf && (
            <TabsTrigger value="shelf-detail">Detail regálu</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="shelves" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Hledat regály..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={loadShelves}
              disabled={shelvesLoading}
            >
              {shelvesLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                "Obnovit"
              )}
            </Button>
          </div>
          
          {shelvesLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredShelves.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShelves.map((shelf) => (
                <Card 
                  key={shelf.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleShelfSelect(shelf)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Package2 className="h-5 w-5" />
                      <span className="truncate">{shelf.shelf_name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <p>Umístění: {shelf.shelf_store_location || "Neurčeno"}</p>
                      <p>Počet pozic: {shelf.shelf_position_count}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package2 className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">Žádné regály nenalezeny</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery ? "Zkuste upravit vyhledávací dotaz" : "V této organizaci zatím nejsou žádné regály"}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="shelf-detail">
          {selectedShelf ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleBackToShelves}>
                  Zpět na přehled
                </Button>
                <h2 className="text-xl font-semibold">{selectedShelf.shelf_name}</h2>
              </div>
              
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Pozice regálu</h3>
                  <p className="text-muted-foreground text-sm">
                    Kliknutím na pozici můžete přiřadit produkt nebo upravit nastavení
                  </p>
                </CardHeader>
                <CardContent>
                  <ShelfPositionGrid 
                    shelfId={selectedShelf.id} 
                    positions={selectedShelf.shelf_positions}
                    onPositionUpdate={() => {
                      // Aktualizujeme detail regálu po změně pozice
                      fetchShelfById(selectedShelf.id);
                    }} 
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
