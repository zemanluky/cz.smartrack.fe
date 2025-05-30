import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ShelfPosition } from "@/lib/types/shelf";
import { AssignProductDialog } from "./AssignProductDialog";
import { useShelvesStore } from "@/lib/stores/shelvesStore";

interface ShelfPositionGridProps {
  shelfId: number;
  positions: ShelfPosition[];
  onPositionUpdate?: () => void;
}

export const ShelfPositionGrid = ({ shelfId, positions, onPositionUpdate }: ShelfPositionGridProps) => {
  const { fetchShelfById } = useShelvesStore();
  
  // Stav dialogu
  const [selectedPosition, setSelectedPosition] = useState<ShelfPosition | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  
  // Najdeme maximální hodnoty řádků a sloupců
  const maxRow = Math.max(...positions.map(pos => pos.row), 0);
  const maxColumn = Math.max(...positions.map(pos => pos.column), 0);
  
  // Vytvoříme mapování pozic podle souřadnic
  const positionMap = new Map<string, ShelfPosition>();
  positions.forEach(pos => {
    positionMap.set(`${pos.row}-${pos.column}`, pos);
  });
  
  // Funkce pro zpracování kliknutí na pozici
  const handlePositionClick = (position: ShelfPosition) => {
    setSelectedPosition(position);
    setAssignDialogOpen(true);
  };
  
  // Funkce pro zpracování úspěšného přiřazení produktu
  const handleAssignSuccess = async () => {
    // Aktualizujeme data regálu
    await fetchShelfById(shelfId);
    
    // Pokud je definován callback pro aktualizaci, zavoláme ho
    if (onPositionUpdate) {
      onPositionUpdate();
    }
  };

  // Zobrazení pro mobilní zařízení - lineární seznam pozic
  const mobileView = (
    <div className="space-y-2 block md:hidden">
      {positions.sort((a, b) => (a.row === b.row ? a.column - b.column : a.row - b.row)).map((position) => (
        <Card key={`mobile-${position.row}-${position.column}`} 
          className={`overflow-hidden cursor-pointer ${position.is_low_stock ? "border-red-300" : ""}`}
          onClick={() => handlePositionClick(position)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <div className="font-medium">Pozice [{position.row}, {position.column}]</div>
                {position.product ? (
                  <>
                    <div className="text-sm mt-1 font-semibold truncate">{position.product.name}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={position.is_low_stock ? "destructive" : "secondary"}>
                        {position.current_stock_percent !== null 
                          ? `${position.current_stock_percent}%` 
                          : "Neznámé množství"}
                      </Badge>
                      {position.is_low_stock && (
                        <span className="text-xs text-destructive">Docházející zásoba</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground text-sm mt-1">Prázdná pozice</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Vytvoř mřížku pro desktop
  const rows = [];
  for (let r = 1; r <= maxRow; r++) {
    const cells = [];
    for (let c = 1; c <= maxColumn; c++) {
      const position = positionMap.get(`${r}-${c}`);
      cells.push(
        <div 
          key={`${r}-${c}`} 
          className={`border h-20 w-20 flex flex-col justify-center items-center ${position ? 'bg-background hover:bg-muted/50 cursor-pointer' : 'bg-muted/30'}`}
          onClick={() => position && handlePositionClick(position)}
        >
          {position ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center w-full h-full flex flex-col justify-center items-center p-1">
                    <div className="text-xs text-muted-foreground mb-1">[{r},{c}]</div>
                    {position.product ? (
                      <>
                        <div className="font-medium truncate max-w-full text-xs">{position.product.name}</div>
                        <Badge variant={position.is_low_stock ? "destructive" : "secondary"} className="mt-1 text-xs">
                          {position.current_stock_percent !== null 
                            ? `${position.current_stock_percent}%` 
                            : "?"}
                        </Badge>
                      </>
                    ) : (
                      <div className="text-muted-foreground text-xs">Prázdná</div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <div className="font-semibold">Pozice [{r},{c}]</div>
                    {position.product ? (
                      <>
                        <div>Produkt: {position.product.name}</div>
                        <div>Množství: {position.current_stock_percent !== null 
                          ? `${position.current_stock_percent}%` 
                          : "Neznámé"}</div>
                        {position.is_low_stock && (
                          <div className="text-destructive font-medium">Docházející zásoba!</div>
                        )}
                      </>
                    ) : (
                      <div>Pozice je prázdná</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="text-xs text-muted-foreground opacity-50">[{r},{c}]</div>
          )}
        </div>
      );
    }
    rows.push(
      <div key={`row-${r}`} className="flex flex-nowrap">
        {cells}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobilní zobrazení */}
      {mobileView}
      
      {/* Desktop zobrazení */}
      <div className="hidden md:block overflow-x-auto">
        <div className="p-4 bg-card rounded-lg border relative min-w-max">
          {/* Záhlaví mřížky */}
          <div className="flex mb-2 ml-16">
            {Array.from({ length: maxColumn }, (_, i) => (
              <div key={`header-${i+1}`} className="w-20 text-center font-medium text-sm">
                Sloupec {i+1}
              </div>
            ))}
          </div>
          
          {/* Mřížka pozic */}
          <div className="flex flex-col">
            {rows.map((row, i) => (
              <div key={`row-container-${i+1}`} className="flex items-center">
                <div className="w-16 font-medium text-sm mr-2 flex justify-end items-center bg-background px-2 py-1 border-r-0 border rounded-l-md">
                  Řádek {i+1}
                </div>
                {row}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Dialog pro přiřazení produktu */}
      {selectedPosition && (
        <AssignProductDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          shelfId={shelfId}
          position={selectedPosition}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
};
