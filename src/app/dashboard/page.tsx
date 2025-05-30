"use client";

import { useUserStore } from '@/lib/stores/userStore';
import { useOrganizationStore } from '@/lib/stores/organizationsStore';
import { useRequireOrganization } from '@/hooks/common/useRequireOrganization';
import React from 'react';

const OrganizationDashboardPage = () => {
  const { currentUser } = useUserStore();
  const { organizations, selectedOrganizationId, setOrganizations } = useOrganizationStore();
  const loadingOrRedirecting = useRequireOrganization({ includeOrgAdmin: true });

  // Fetch orgs if not loaded
  React.useEffect(() => {
    if (organizations.length === 0) {
      setOrganizations();
    }
  }, [organizations.length, setOrganizations]);

  if (!currentUser) return <div>Načítání uživatele...</div>;
  if (loadingOrRedirecting) return <div>Načítání nebo přesměrování...</div>;

  const selectedOrg = organizations.find(o => String(o.id) === selectedOrganizationId);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {selectedOrg ? selectedOrg.name : "Přehled organizace"}
      </h1>
      <div className="mt-4 space-y-2">
        <p>Vítejte, {currentUser.name} ({currentUser.role})!</p>
        {selectedOrganizationId ? (
          <p>Zobrazují se data pro organizaci: <strong>{selectedOrg ? selectedOrg.name : selectedOrganizationId}</strong></p>
        ) : (
          <p>Není vybrána žádná organizace.</p>
        )}
        {/* Placeholder for actual dashboard content based on selectedOrganizationId */}
        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <p className="text-lg font-semibold">Oblast specifická pro organizaci</p>
          <p>Data týkající se organizace {selectedOrg ? selectedOrg.name : selectedOrganizationId} budou zobrazena zde.</p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboardPage;