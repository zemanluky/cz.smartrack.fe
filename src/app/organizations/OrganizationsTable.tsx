import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel, // Added for pagination
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  useOrganizationStore,
  type Organization,
} from "@/lib/stores/organizationsStore"; // Import Organization type
import { AddOrganization } from "./addOrganization";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  // AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // CardDescription, // No longer used in OrganizationCardItem
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination"; // Use the project's custom Pagination component
import { OrgFormDialog } from "./orgFormDialog";

// Define the OrganizationCardItem component
interface OrganizationCardItemProps {
  organization: Organization;
  onViewDashboard: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
}

const OrganizationCardItem = ({
  organization,
  onViewDashboard,
  onDelete,
}: OrganizationCardItemProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-words">{organization.name}</CardTitle>
        {/* ID moved to CardContent */}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground break-words">
          ID: {organization.id}
        </p>
        <p
          className={`text-sm font-medium break-words ${
            organization.active ? "text-green-600" : "text-red-600"
          }`}
        >
          Status: {organization.active ? "Active" : "Inactive"}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2 sm:items-center">
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => onViewDashboard(organization)}
        >
          View Dashboard
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => onDelete(organization)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

interface Org {
  id: number;
  name: string;
  active: boolean;
}

export function OrganizationsTable() {
  // Ensure `row.original` is typed correctly if it wasn't automatically inferred.
  // For ColumnDef<Organization>, row.original will be Organization.

  const {
    organizations,
    setOrganizations,
    removeOrganization,
    setSelectedOrganizationId,
  } = useOrganizationStore();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false); // Corrected setter name
  const [isEditOpen, setIsEditOpen] = useState(false); // Corrected setter name
  const [orgToEdit, setOrgToEdit] = useState<Org | null>(null);

  const { addOrganization, updateOrganization } = useOrganizationStore(); // Import addOrg and editOrg functions

  useEffect(() => {
    setOrganizations();
  }, []);

  const confirmDelete = () => {
    if (selectedOrgId !== null) {
      removeOrganization(selectedOrgId);
      setDialogOpen(false);
      setSelectedOrgId(null);
    }
  };

  const onEditOrg = (org: Org) => {
    // const org = organizations.find((org) => org.id === selectedOrgId);
    setOrgToEdit(org);
    setIsEditOpen(true); // Corrected setter name
  };

  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "active",
      header: "Active",
      cell: (info) => (info.getValue() ? "✅" : "❌"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedOrganizationId(String(row.original.id));
              toast.info("Switched to organization: " + row.original.name);
              navigate("/dashboard");
            }}
          >
            View Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onEditOrg(row.original); // Use the onEditOrg function
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setSelectedOrgId(row.original.id);
              setDialogOpen(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: organizations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Added for pagination
    initialState: {
      pagination: {
        pageIndex: 0, // Initial page index
        pageSize: 10, // Items per page
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Container for title and button, changed from flex to block stacking */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Organizations</h2>{" "}
        {/* Added mb-4 for spacing */}
        <AddOrganization />
      </div>

      {/* Desktop Table View */}
      <div className="hidden min-[950px]:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center h-24"
                >
                  No organizations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="block min-[950px]:hidden space-y-3">
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <OrganizationCardItem
              key={row.original.id}
              organization={row.original}
              onViewDashboard={(organizationToView) => {
                setSelectedOrganizationId(String(organizationToView.id));
                toast.info(
                  "Switched to organization: " + organizationToView.name
                );
                navigate("/dashboard");
              }}
              onDelete={(organizationToDelete) => {
                setSelectedOrgId(organizationToDelete.id);
                setDialogOpen(true);
              }}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground p-4 border rounded-md">
            No organizations found.
          </div>
        )}
      </div>

      {/* Pagination Controls using the project's custom Pagination component */}
      {table.getPageCount() > 1 && (
        <Pagination
          className="py-4"
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)} // The component expects 1-based index
        />
      )}

      {/* add user modal */}
      <OrgFormDialog
        open={isAddOpen} // Corrected variable name
        onOpenChange={setIsAddOpen} // Corrected setter name
        onSubmit={async (data) => {
          await addOrganization(data.name, data.active);
          setIsAddOpen(false); // Corrected setter name
        }}
      />

      {/* edit user modal */}
      <OrgFormDialog
        open={isEditOpen} // Corrected variable name
        onOpenChange={setIsEditOpen} // Corrected setter name
        initialData={orgToEdit || undefined}
        onSubmit={async (data) => {
          if (orgToEdit) {
            await updateOrganization({
              id: orgToEdit.id,
              name: data.name,
              active: data.active,
            });
            setIsEditOpen(false); // Corrected setter name
            setOrgToEdit(null);
          }
        }}
      />

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
