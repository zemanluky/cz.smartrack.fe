import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useOrganizationUsersStore } from "@/lib/stores/organizationUsersStore";
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
// Input is not used
import { Pagination } from "@/components/ui/pagination";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";
import { useRequireOrganization } from "@/hooks/common/useRequireOrganization";
import { useUserStore } from "@/lib/stores/userStore";
import { UserFormDialog } from "./userFormDialog";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  // CardDescription, // No longer used in UserCardItem
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface UserCardItemProps {
  user: User;
  onEdit: (user: User) => void;
  currentUserRole?: string;
}

const UserCardItem = ({ user, onEdit, currentUserRole }: UserCardItemProps) => {
  const canEdit = currentUserRole === "sys_admin" ||
                  currentUserRole === "org_admin" ||
                  (currentUserRole === "org_user" && useUserStore.getState().currentUser?.id === user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-words">{user.name}</CardTitle>
        {/* Email moved to CardContent */}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground break-words">{user.email}</p>
        <p className="text-sm text-muted-foreground break-words">Role: {user.role}</p>
        <p className={`text-sm font-medium break-words ${user.active ? 'text-green-600' : 'text-red-600'}`}>
          Status: {user.active ? "Active" : "Inactive"}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:justify-end sm:space-x-2 sm:items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto" 
          onClick={() => onEdit(user)}
          disabled={!canEdit}
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
};

const ITEMS_PER_PAGE = 10;

export function UsersTable() {
  const users = useOrganizationUsersStore((state) => state.users);
  const fetchUsers = useOrganizationUsersStore((state) => state.fetchUsers);
  const addUser = useOrganizationUsersStore((state) => state.addUser);
  const editUser = useOrganizationUsersStore((state) => state.editUser);
  const totalUsersCount = useOrganizationUsersStore((state) => state.totalUsersCount);

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  // hasNextPage and setHasNextPage are not used
  const [isAddOpen, setIsAddOpen] = useState(false); // Corrected setter name
  const [isEditOpen, setIsEditOpen] = useState(false); // Corrected setter name
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const { selectedOrganizationId, organizations } = // Removed setOrganizations
    useOrganizationStore();
  const currentUser = useUserStore((state) => state.currentUser);

  useRequireOrganization(); // Hook to ensure organization is selected

  useEffect(() => {
    if (selectedOrganizationId) {
      fetchUsers(currentPage, ITEMS_PER_PAGE);
    }
  }, [currentPage, fetchUsers, selectedOrganizationId]);

  useEffect(() => {
    if (totalUsersCount > 0) {
      setTotalPages(Math.ceil(totalUsersCount / ITEMS_PER_PAGE));
    } else {
      setTotalPages(0);
    }
  }, [totalUsersCount]);

  useEffect(() => {
    if (selectedOrganizationId) {
      const orgUsers = users.filter(
        (user) => user.organization?.id === Number(selectedOrganizationId)
      );
      setFilteredUsers(orgUsers);
    } else {
      setFilteredUsers([]); // Clear users if no organization is selected
    }
  }, [users, selectedOrganizationId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onEditUser = (user: User) => {
    setUserToEdit(user);
    setIsEditOpen(true); // Corrected setter name
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
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
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) => (row.original.active ? "Yes ✅" : "No ❌"), // Restored emoji
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="space-x-2">
          {(currentUser?.role === "sys_admin" ||
            currentUser?.role === "org_admin") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditUser(row.original)}
            >
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!selectedOrganizationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Please select an organization to view users.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Container for title and button, changed from flex to block stacking */}
      <div>
        <h2 className="text-lg font-semibold mb-4"> {/* Added mb-4 for spacing */}
          Users of {organizations.find((o) => String(o.id) === selectedOrganizationId)?.name}
        </h2>

        {(currentUser?.role === "sys_admin" ||
          currentUser?.role === "org_admin") && (
          <Button
            className="w-full sm:w-auto flex items-center gap-2"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      <div className="rounded-md border hidden min-[950px]:block">
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

      <div className="block min-[950px]:hidden space-y-3 mt-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserCardItem
              key={user.id}
              user={user}
              onEdit={onEditUser}
              currentUserRole={currentUser?.role}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground p-4 border rounded-md">
            No users found for the current page.
          </div>
        )}
      </div>

      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="py-4"
        />
      )}

      {/* add user modal */}
      <UserFormDialog
        open={isAddOpen} // Corrected variable name
        onOpenChange={setIsAddOpen} // Corrected setter name
        onSubmit={async (data) => {
          await addUser(data);
          setIsAddOpen(false); // Corrected setter name
        }}
      />

      {/* edit user modal */}
      <UserFormDialog
        open={isEditOpen} // Corrected variable name
        onOpenChange={setIsEditOpen} // Corrected setter name
        initialData={userToEdit || undefined}
        onSubmit={async (data) => {
          if (userToEdit) {
            await editUser(Number(userToEdit.id), data);
            setIsEditOpen(false); // Corrected setter name
            setUserToEdit(null);
          }
        }}
      />
    </div>
  );
}
