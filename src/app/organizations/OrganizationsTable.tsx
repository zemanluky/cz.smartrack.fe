import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useOrganizationStore, type Organization } from "@/lib/stores/organizationsStore"; // Import Organization type
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

// Define the OrganizationCardItem component
interface OrganizationCardItemProps {
  organization: Organization;
  onViewDashboard: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
}

const OrganizationCardItem = ({ organization, onViewDashboard, onDelete }: OrganizationCardItemProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-words">{organization.name}</CardTitle>
        <CardDescription className="break-words">ID: {organization.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={`text-sm font-medium break-words ${organization.active ? 'text-green-600' : 'text-red-600'}`}>
          Status: {organization.active ? "Active" : "Inactive"}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2 sm:items-center">
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => onViewDashboard(organization)}>
          View Dashboard
        </Button>
        <Button variant="destructive" size="sm" className="w-full sm:w-auto" onClick={() => onDelete(organization)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export function OrganizationsTable() {
  const {
    organizations,
    setOrganizations,
    removeOrganization,
    setSelectedOrganizationId,
  } = useOrganizationStore();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

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
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Organizations</h2>
        <AddOrganization />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
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
      <div className="block md:hidden space-y-3">
        {organizations.length > 0 ? (
          organizations.map((org) => (
            <OrganizationCardItem
              key={org.id}
              organization={org}
              onViewDashboard={(organizationToView) => {
                setSelectedOrganizationId(String(organizationToView.id));
                toast.info("Switched to organization: " + organizationToView.name);
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
