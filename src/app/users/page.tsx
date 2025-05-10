import { UsersTable } from "./usersTable";

export default function UsersPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Users</h1>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <UsersTable />
        </div>
      </div>
    </div>
  );
}
