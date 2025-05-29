import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { Shelf } from "@/lib/types/shelf";
import { PlusIcon, PencilIcon, TrashIcon, ArrowRightIcon } from "lucide-react";

// Define the ShelfCardItem component
interface ShelfCardItemProps {
  shelf: Shelf;
  onView: (shelf: Shelf) => void;
  onEdit: (shelf: Shelf) => void;
  onDelete: (shelf: Shelf) => void;
}

const ShelfCardItem = ({ shelf, onView, onEdit, onDelete }: ShelfCardItemProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-words">{shelf.shelf_name}</CardTitle>
        <CardDescription className="break-words">
          {shelf.shelf_store_location || "Umístění není specifikováno"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground break-words">
          Počet pozic: {shelf.shelf_position_count}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2 sm:items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto" 
          onClick={() => onView(shelf)}
        >
          Detail
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto" 
          onClick={() => onEdit(shelf)}
        >
          Upravit
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full sm:w-auto" 
          onClick={() => onDelete(shelf)}
        >
          Smazat
        </Button>
      </CardFooter>
    </Card>
  );
};

const CARDS_PER_PAGE = 5;
const TABLE_ITEMS_PER_PAGE = 25;

interface ShelfTableProps {
  shelves: Shelf[];
  onView: (shelf: Shelf) => void;
  onEdit: (shelf: Shelf) => void;
  onDelete: (shelf: Shelf) => void;
  onAdd: () => void;
}

export const ShelfTable: React.FC<ShelfTableProps> = ({ 
  shelves, 
  onView, 
  onEdit, 
  onDelete,
  onAdd
}) => {
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const [cardCurrentPage, setCardCurrentPage] = useState(1);

  // Reset pagination if the shelves array changes
  useEffect(() => {
    setCardCurrentPage(1);
    setTableCurrentPage(1);
  }, [shelves]);

  // Calculate shelves for the current card page
  const lastCardIndex = cardCurrentPage * CARDS_PER_PAGE;
  const firstCardIndex = lastCardIndex - CARDS_PER_PAGE;
  const currentCardShelves = shelves.slice(firstCardIndex, lastCardIndex);
  const totalCardPages = Math.ceil(shelves.length / CARDS_PER_PAGE);

  // Calculate shelves for the current table page
  const lastTableIndex = tableCurrentPage * TABLE_ITEMS_PER_PAGE;
  const firstTableIndex = lastTableIndex - TABLE_ITEMS_PER_PAGE;
  const currentTableShelves = shelves.slice(firstTableIndex, lastTableIndex);
  const totalTablePages = Math.ceil(shelves.length / TABLE_ITEMS_PER_PAGE);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Regály</h2>
        <Button onClick={onAdd} className="flex items-center gap-1">
          <PlusIcon className="h-4 w-4" />
          <span>Přidat regál</span>
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Název</TableHead>
              <TableHead>Umístění</TableHead>
              <TableHead className="text-center">Počet pozic</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTableShelves.length > 0 ? (
              currentTableShelves.map((shelf) => (
                <TableRow key={shelf.id}>
                  <TableCell className="font-medium">{shelf.shelf_name}</TableCell>
                  <TableCell>{shelf.shelf_store_location || "—"}</TableCell>
                  <TableCell className="text-center">{shelf.shelf_position_count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(shelf)}
                        className="h-8 w-8 p-0"
                        title="Detail regálu"
                      >
                        <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(shelf)}
                        className="h-8 w-8 p-0"
                        title="Upravit regál"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(shelf)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-500"
                        title="Smazat regál"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Žádné regály nebyly nalezeny.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {shelves.length > TABLE_ITEMS_PER_PAGE && (
          <div className="mt-4 hidden md:flex justify-center items-center space-x-2">
            <Button 
              onClick={() => setTableCurrentPage(prev => Math.max(1, prev - 1))} 
              disabled={tableCurrentPage === 1}
              variant="outline"
              size="sm"
            >
              Předchozí
            </Button>
            <span className="text-sm text-muted-foreground">
              Stránka {tableCurrentPage} z {totalTablePages}
            </span>
            <Button 
              onClick={() => setTableCurrentPage(prev => Math.min(totalTablePages, prev + 1))} 
              disabled={tableCurrentPage === totalTablePages}
              variant="outline"
              size="sm"
            >
              Další
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {shelves.length > 0 ? (
            currentCardShelves.map((shelf) => (
              <ShelfCardItem
                key={shelf.id}
                shelf={shelf}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground p-4 border rounded-md">
              Žádné regály nebyly nalezeny.
            </div>
          )}
        </div>
        {shelves.length > CARDS_PER_PAGE && (
          <div className="mt-4 flex justify-center items-center space-x-2">
            <Button 
              onClick={() => setCardCurrentPage(prev => Math.max(1, prev - 1))} 
              disabled={cardCurrentPage === 1}
              variant="outline"
              size="sm"
            >
              Předchozí
            </Button>
            <span className="text-sm text-muted-foreground">
              Stránka {cardCurrentPage} z {totalCardPages}
            </span>
            <Button 
              onClick={() => setCardCurrentPage(prev => Math.min(totalCardPages, prev + 1))} 
              disabled={cardCurrentPage === totalCardPages}
              variant="outline"
              size="sm"
            >
              Další
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
