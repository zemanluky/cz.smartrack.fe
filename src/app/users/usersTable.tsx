import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useOrganizationUsersStore, type User } from "@/lib/stores/organizationUsersStore"; // Import User type
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
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
import { AddUser } from "./addUser";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";
import { useRequireOrganization } from "@/hooks/common/useRequireOrganization";
import { useUserStore } from "@/lib/stores/userStore";

// Define the UserCardItem component
interface UserCardItemProps {
  user: User;
  onView: (user: User) => void;
  onDelete: (user: User) => void;
  currentUserRole?: string;
}

const UserCardItem = ({ user, onView, onDelete, currentUserRole }: UserCardItemProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-words">{user.name}</CardTitle>
        <CardDescription className="break-words">{user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground break-words">Role: {user.role}</p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2 sm:items-center">
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => onView(user)}>
          View
        </Button>
        {(currentUserRole === "sys_admin") && (
          <Button variant="destructive" size="sm" className="w-full sm:w-auto" onClick={() => onDelete(user)}>
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export function UsersTable() {
  const { users, fetchUsers, deleteUser } = useOrganizationUsersStore();
  const { selectedOrganizationId, organizations, setOrganizations } =
    useOrganizationStore();
  const currentUser = useUserStore((state) => state.currentUser);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadingOrRedirecting = useRequireOrganization({
    includeOrgAdmin: true,
  });

  useEffect(() => {
    if (organizations.length === 0) {
      setOrganizations();
    }
    if (selectedOrganizationId) {
      fetchUsers();
    }
    console.log(users);
  }, [
    selectedOrganizationId,
    fetchUsers,
    organizations.length,
    setOrganizations,
  ]);

  if (loadingOrRedirecting) {
    return <div>Loading or redirecting...</div>;
  }

  const selectedOrg = organizations.find(
    (o) => String(o.id) === selectedOrganizationId
  );

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id)
        .then(() => {
          toast.success(`User ${selectedUser.name} deleted successfully.`);
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
          toast.error(`Failed to delete user ${selectedUser.name}.`);
        });
      toast.error(`User ${selectedUser.name} deleted.`);
      setDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
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
              toast.info(`Viewing user: ${row.original.name}`);
            }}
          >
            View
          </Button>

          {currentUser?.role === "sys_admin" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setSelectedUser(row.original);
                setDialogOpen(true);
              }}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Users of {selectedOrg?.name}</h2>
        {(currentUser?.role === "sys_admin" ||
          currentUser?.role === "org_admin") && <AddUser />}
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
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {users.length > 0 ? (
          users.map((user) => (
            <UserCardItem
              key={user.id}
              user={user}
              onView={(userToView) => toast.info(`Viewing user: ${userToView.name}`)}
              onDelete={(userToDelete) => {
                setSelectedUser(userToDelete);
                setDialogOpen(true);
              }}
              currentUserRole={currentUser?.role}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground p-4 border rounded-md">
            No users found.
          </div>
        )}
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user.
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
