import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { 
  fetchShelves, 
  fetchShelfById, 
  createShelf, 
  updateShelf, 
  deleteShelf,
  createShelfPositionApi,
  updateShelfPositionApi,
  deleteShelfPositionApi
} from "@/api/shelfApi";
import type {
  Shelf,
  ShelfCreate,
  ShelfDetail,
  ShelfPosition,
  ShelfPositionCreate,
  ShelfPositionUpdate
} from "@/lib/types/shelf";
import { toast } from "sonner";

type ShelvesFilterOptions = {
  organization_id?: number;
  includeUnassigned?: boolean;
};

type ShelvesStore = {
  shelves: Shelf[];
  selectedShelf: ShelfDetail | null;
  isLoading: boolean;
  totalShelves: number;
  currentPage: number;
  pageSize: number;
  
  // Actions
  fetchShelves: (options?: ShelvesFilterOptions) => Promise<boolean>;
  fetchShelfById: (id: number) => Promise<ShelfDetail | undefined>;
  addShelf: (data: ShelfCreate) => Promise<ShelfDetail | undefined>;
  updateShelf: (id: number, data: ShelfCreate) => Promise<ShelfDetail | undefined>;
  removeShelf: (id: number) => Promise<void>;
  setSelectedShelf: (shelf: ShelfDetail | null) => void;
  setPage: (page: number) => void;
  addShelfPosition: (shelfId: number, data: ShelfPositionCreate) => Promise<ShelfPosition | undefined>;
  updateShelfPosition: (shelfId: number, positionIdOrTag: number | string, data: ShelfPositionUpdate) => Promise<ShelfPosition | undefined>;
  deleteShelfPosition: (shelfId: number, positionIdOrTag: number | string) => Promise<void>;
};

export const useShelvesStore = create<ShelvesStore>()(
  persist(
    (set, get) => ({
      shelves: [],
      selectedShelf: null,
      isLoading: false,
      totalShelves: 0,
      currentPage: 1,
      pageSize: 10,

      fetchShelves: async (options?: ShelvesFilterOptions) => {
        try {
          set({ isLoading: true });
          const response = await fetchShelves(options);
          
          if (response) {
            set({ 
              shelves: response.items,
              totalShelves: response.metadata.total_results,
              isLoading: false
            });
            return true;
          }
          
          set({ isLoading: false });
          return false;
        } catch (error: any) {
          console.error("Chyba při načítání regálů:", error);
          toast.error(error.message || "Nepodařilo se načíst regály");
          set({ isLoading: false });
          return false;
        }
      },

      fetchShelfById: async (id: number) => {
        try {
          set({ isLoading: true });
          const shelf = await fetchShelfById(id);
          
          if (shelf) {
            set({ selectedShelf: shelf });
          }
          
          set({ isLoading: false });
          return shelf;
        } catch (error: any) {
          console.error(`Chyba při načítání regálu s ID ${id}:`, error);
          toast.error(error.message || "Nepodařilo se načíst detail regálu");
          set({ isLoading: false });
          return undefined;
        }
      },

      addShelf: async (data: ShelfCreate) => {
        console.log('[shelvesStore.addShelf] Data to be sent to createShelf API:', data);
        try {
          set({ isLoading: true });
          const newShelf = await createShelf(data);
          
          if (newShelf) {
            set((state) => ({
              shelves: [...state.shelves, newShelf],
              isLoading: false
            }));
            toast.success("Regál byl úspěšně vytvořen");
            return newShelf;
          }
          
          set({ isLoading: false });
          return undefined;
        } catch (error: any) {
          console.error("Chyba při vytváření regálu:", error);
          toast.error(error.message || "Nepodařilo se vytvořit regál");
          set({ isLoading: false });
          return undefined;
        }
      },

      updateShelf: async (id: number, data: ShelfCreate) => {
        try {
          set({ isLoading: true });
          const updatedShelf = await updateShelf(id, data);
          
          set((state) => ({
            shelves: state.shelves.map((shelf) => 
              shelf.id === id ? updatedShelf : shelf
            ),
            selectedShelf: state.selectedShelf?.id === id ? updatedShelf : state.selectedShelf,
            isLoading: false
          }));
          
          toast.success("Regál byl úspěšně aktualizován");
          return updatedShelf;
        } catch (error: any) {
          console.error(`Chyba při aktualizaci regálu s ID ${id}:`, error);
          toast.error(error.message || "Nepodařilo se aktualizovat regál");
          set({ isLoading: false });
          return undefined;
        }
      },

      removeShelf: async (id: number) => {
        try {
          set({ isLoading: true });
          await deleteShelf(id);
          
          set((state) => ({
            shelves: state.shelves.filter((shelf) => shelf.id !== id),
            selectedShelf: state.selectedShelf?.id === id ? null : state.selectedShelf,
            isLoading: false
          }));
          
          toast.success("Regál byl úspěšně odstraněn");
        } catch (error: any) {
          console.error(`Chyba při odstraňování regálu s ID ${id}:`, error);
          toast.error(error.message || "Nepodařilo se odstranit regál");
          set({ isLoading: false });
        }
      },

      setSelectedShelf: (shelf: ShelfDetail | null) => {
        set({ selectedShelf: shelf });
      },

      setPage: (page: number) => {
        set({ currentPage: page });
      },

      addShelfPosition: async (shelfId: number, data: ShelfPositionCreate) => {
        try {
          set({ isLoading: true });
          const newPosition = await createShelfPositionApi(shelfId, data);

          if (newPosition) {
            set((state) => {
              // Aktualizuj selectedShelf, pokud existuje a shoduje se ID
              if (state.selectedShelf && state.selectedShelf.id === shelfId) {
                return {
                  selectedShelf: {
                    ...state.selectedShelf,
                    shelf_positions: [...state.selectedShelf.shelf_positions, newPosition],
                  },
                  isLoading: false,
                };
              }
              // Pokud selectedShelf není relevantní, jen nastav isLoading na false
              return { isLoading: false };
            });
            toast.success("Pozice byla úspěšně přidána.");
            return newPosition;
          }

          set({ isLoading: false });
          return undefined;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
          console.error(`Chyba při vytváření pozice v regálu ${shelfId}:`, error);
          toast.error(error.message || "Nepodařilo se přidat pozici.");
          set({ isLoading: false });
          return undefined;
        }
      },

      updateShelfPosition: async (shelfId: number, positionIdOrTag: number | string, data: ShelfPositionUpdate) => {
        try {
          set({ isLoading: true });
          const updatedPosition = await updateShelfPositionApi(shelfId, positionIdOrTag, data);

          if (updatedPosition) {
            set((state) => {
              // Aktualizuj selectedShelf, pokud existuje a shoduje se ID
              if (state.selectedShelf && state.selectedShelf.id === shelfId) {
                return {
                  selectedShelf: {
                    ...state.selectedShelf,
                    shelf_positions: state.selectedShelf.shelf_positions.map(pos => 
                      (pos.id === updatedPosition.id ? updatedPosition : pos)
                    ),
                  },
                  isLoading: false,
                };
              }
              return { isLoading: false };
            });
            toast.success("Pozice byla úspěšně upravena.");
            return updatedPosition;
          }

          set({ isLoading: false });
          return undefined;
        } catch (error: any) {
          console.error(`Chyba při aktualizaci pozice ${positionIdOrTag} v regálu ${shelfId}:`, error);
          toast.error(error.message || "Nepodařilo se upravit pozici.");
          set({ isLoading: false });
          return undefined;
        }
      },

      deleteShelfPosition: async (shelfId: number, positionIdOrTag: number | string) => {
        try {
          set({ isLoading: true });
          await deleteShelfPositionApi(shelfId, positionIdOrTag);
          
          set((state) => {
            // Aktualizuj selectedShelf, pokud existuje a shoduje se ID
            if (state.selectedShelf && state.selectedShelf.id === shelfId) {
              return {
                selectedShelf: {
                  ...state.selectedShelf,
                  shelf_positions: state.selectedShelf.shelf_positions.filter(pos => {
                    // Pokud positionIdOrTag je číslo, porovnáváme s pos.id
                    if (typeof positionIdOrTag === 'number' || !isNaN(Number(positionIdOrTag))) {
                      return pos.id !== Number(positionIdOrTag);
                    }
                    // Jinak předpokládáme, že jde o tag, který může být v jiném vlastnosti (např. display_code)
                    // Bezpečná implementace - pokud ID se neshoduje, ponecháme pozici
                    return true;
                  }),
                },
                isLoading: false,
              };
            }
            return { isLoading: false };
          });
          
          toast.success("Pozice byla úspěšně odstraněna.");
        } catch (error: any) {
          console.error(`Chyba při odstraňování pozice ${positionIdOrTag} z regálu ${shelfId}:`, error);
          toast.error(error.message || "Nepodařilo se odstranit pozici.");
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "shelves-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Neukládáme data regálů do localStorage, jen základní nastavení
        currentPage: state.currentPage,
        pageSize: state.pageSize,
      }),
    }
  )
);
