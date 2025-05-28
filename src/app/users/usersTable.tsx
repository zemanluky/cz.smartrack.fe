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
import { use, useEffect, useState } from "react";
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
import { toast } from "sonner";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";
import { useRequireOrganization } from "@/hooks/common/useRequireOrganization";
import { useUserStore } from "@/lib/stores/userStore";
import { UserFormDialog } from "./userFormDialog";
import { Plus } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export function UsersTable() {
  const { users, fetchUsers, addUser, editUser } = useOrganizationUsersStore();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const { selectedOrganizationId, organizations, setOrganizations } =
    useOrganizationStore();
  const currentUser = useUserStore((state) => state.currentUser);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // const [dialogOpen, setDialogOpen] = useState(false);
  // const [activateDialogOpen, setActivateDialogOpen] = useState(false);

  // const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const loadingOrRedirecting = useRequireOrganization({
    includeOrgAdmin: true,
  });

  useEffect(() => {
    if (selectedOrganizationId) {
      fetchUsers(page).then((data) => {
        setHasNextPage(data?.metadata?.has_next_page ?? false);
      });
    }
  }, [selectedOrganizationId, page, fetchUsers]);

  useEffect(() => {
    if (organizations.length === 0) {
      setOrganizations();
    }
  }, [organizations.length, setOrganizations]);

  useEffect(() => {
    if (!users) return;
    if (currentUser?.role !== "sys_admin") {
      setFilteredUsers(users.filter((user) => user.active));
    } else {
      setFilteredUsers(users);
    }
  }, [users, currentUser?.role]);

  if (loadingOrRedirecting) {
    return <div>Loading or redirecting...</div>;
  }

  const selectedOrg = organizations.find(
    (o) => String(o.id) === selectedOrganizationId
  );

  // const confirmDelete = () => {
  //   if (selectedUser) {
  //     deleteUser(Number(selectedUser.id))
  //       .then(() => {
  //         toast.success(`User ${selectedUser.name} deleted successfully.`);
  //       })
  //       .catch((error) => {
  //         console.error("Error deleting user:", error);
  //         toast.error(`Failed to delete user ${selectedUser.name}.`);
  //       });
  //     setDialogOpen(false);
  //     setSelectedUser(null);
  //   }
  // };

  // const confirmActivate = () => {
  //   if (selectedUser) {
  //     activateUser(Number(selectedUser.id))
  //       .then(() => {
  //         toast.success(`User ${selectedUser.name} activated successfully.`);
  //       })
  //       .catch((error) => {
  //         console.error("Error activating user:", error);
  //         toast.error(`Failed activating user ${selectedUser.name}.`);
  //       });
  //     setDialogOpen(false);
  //     setSelectedUser(null);
  //   }
  // };

  const onEditUser = (user: User) => {
    setUserToEdit(user);
    setEditOpen(true);
    console.log("Editing user:", user);
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
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) => (row.original.active ? "Yes ✅" : "No ❌"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="space-x-2">
          {currentUser?.role === "sys_admin" ||
          currentUser?.role === "org_admin" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditUser(row.original)}
            >
              Edit
            </Button>
          ) : currentUser?.role === "org_user" &&
            currentUser?.id === row.original.id ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditUser(row.original)}
            >
              Edit
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Edit
            </Button>
          )}
          {/* {currentUser?.role === "sys_admin" &&
            (row.original.active ? (
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
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(row.original);
                  setActivateDialogOpen(true);
                }}
              >
                Activate
              </Button>
            ))} */}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="size-full p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Users of {selectedOrg?.name}
          </h2>

          {/* add user button */}
          {(currentUser?.role === "sys_admin" ||
            currentUser?.role === "org_admin") && (
            <Button
              className="flex items-center gap-2"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          )}
        </div>

        <div className="rounded-md border">
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

        {/* delete user confirmation */}
        {/* <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
        </AlertDialog> */}

        {/* activate user confirmation */}
        {/* <AlertDialog
          open={activateDialogOpen}
          onOpenChange={setActivateDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will activate the user.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmActivate}>
                Activate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog> */}
      </div>

      {/* pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          variant="outline"
          disabled={!hasNextPage}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>

      {/* add user modal */}
      <UserFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={async (data) => {
          await addUser(data);
          setAddOpen(false);
        }}
      />

      {/* edit user modal */}
      <UserFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={userToEdit || undefined}
        onSubmit={async (data) => {
          if (userToEdit) {
            await editUser(Number(userToEdit.id), data);
            setEditOpen(false);
            setUserToEdit(null);
          }
        }}
      />
    </div>
  );
}
