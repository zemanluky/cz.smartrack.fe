import { OrganizationsTable } from "./OrganizationsTable";
import { useOrganizationStore } from "@/stores/organizationsStore";

export default function OrganizationsPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Organizace</h1>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <OrganizationsTable />
        </div>
      </div>
    </div>
  );
}
