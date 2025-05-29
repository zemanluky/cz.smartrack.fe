import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ShelfPosition } from "@/lib/types/shelf";
import { toast } from "sonner";

interface ShelfPositionGridProps {
  shelfId: number;
  positions: ShelfPosition[];
}

export const ShelfPositionGrid = ({ shelfId, positions }: ShelfPositionGridProps) => {
  const navigate = useNavigate();
  
  // Najdeme maximální hodnoty řádků a sloupců, abychom mohli vytvořit mřížku
  const maxRow = Math.max(...positions.map(pos => pos.row), 0);
  const maxColumn = Math.max(...positions.map(pos => pos.column), 0);
  
  // Vytvoříme 2D pole pro reprezentaci mřížky
  const grid: (ShelfPosition | null)[][] = Array(maxRow).fill(null)
    .map(() => Array(maxColumn).fill(null));
  
  // Naplníme mřížku pozicemi
  positions.forEach(position => {
    // Indexy v poli jsou 0-based, zatímco pozice v regálu mohou začínat od 1
    const rowIndex = position.row - 1;
    const columnIndex = position.column - 1;
    
    if (rowIndex >= 0 && rowIndex < grid.length && 
        columnIndex >= 0 && columnIndex < grid[0].length) {
      grid[rowIndex][columnIndex] = position;
    }
  });
  
  // Funkce pro zobrazení detailu pozice
  const handlePositionClick = (position: ShelfPosition) => {
    toast.info(`Zobrazení detailu pozice [${position.row},${position.column}] bude implementováno v další fázi`);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-max p-4 bg-white rounded-lg border">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${maxColumn}, minmax(120px, 1fr))` }}>
            {/* Záhlaví sloupců */}
            <div className="col-start-1 col-end-1"></div>
            {Array.from({ length: maxColumn }, (_, i) => (
              <div key={`header-${i+1}`} className="text-center font-medium">
                Sloupec {i+1}
              </div>
            ))}
            
            {/* Řádky s pozicemi */}
            {grid.map((row, rowIndex) => (
              <>
                <div key={`row-label-${rowIndex+1}`} className="font-medium">
                  Řádek {rowIndex+1}
                </div>
                {row.map((position, colIndex) => (
                  <div key={`position-${rowIndex+1}-${colIndex+1}`} className="h-32">
                    {position ? (
                      <Card 
                        className={`h-full cursor-pointer transition-all hover:shadow-md ${
                          position.is_low_stock ? "border-red-500" : ""
                        }`}
                        onClick={() => handlePositionClick(position)}
                      >
                        <CardContent className="p-3 h-full flex flex-col justify-between">
                          <div>
                            <div className="font-semibold mb-1 truncate">
                              {position.product ? position.product.name : "Prázdná pozice"}
                            </div>
                            {position.product && (
                              <Badge variant={position.is_low_stock ? "destructive" : "outline"} className="mb-2">
                                {position.current_stock_percent !== null 
                                  ? `${position.current_stock_percent}%`
                                  : "Neznámé množství"}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Pozice [{position.row},{position.column}]
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="h-full border border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                        Prázdné místo
                      </div>
                    )}
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
