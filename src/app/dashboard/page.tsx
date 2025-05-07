"use client";

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/lib/stores/userStore';
import { useOrganizationStore } from '@/lib/stores/organizationsStore';

const OrganizationDashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { selectedOrganizationId, setSelectedOrganizationId } = useOrganizationStore();

  useEffect(() => {
    if (!currentUser) {
      // If no user, redirect to login (e.g. session expired, or direct access without login)
      navigate('/login');
      return;
    }

    if (currentUser.role === 'sys_admin') {
      if (!selectedOrganizationId) {
        // Sys admin without a selected org, redirect to org selection
        navigate('/organizations');
      }
    } else if (currentUser.role === 'org_admin') {
      if (!selectedOrganizationId) {
        // Org admin without a selected org. This might happen on a refresh
        // if localStorage fails or is cleared.
        // Try to set it from the user's own organizationId.
        if (currentUser.organizationId) {
          setSelectedOrganizationId(String(currentUser.organizationId));
        } else {
          // This is an inconsistent state for an org_admin
          console.error('Org admin without an organizationId and no selected organization.');
          navigate('/login'); // Or show an error page
        }
      } else if (selectedOrganizationId !== String(currentUser.organizationId)){
        // If selected org is somehow different from user's assigned org for org_admin,
        // force it to user's own org. This is a safety check.
        console.warn('Selected organization conflicted with user\'s assigned organization. Resetting.');
        // Ensure currentUser.organizationId is not null before String conversion
        if (currentUser.organizationId) {
          setSelectedOrganizationId(String(currentUser.organizationId));
        } else {
            console.error('Org admin has no organizationId to reset to.');
            navigate('/login');
        }
      }
    }
  }, [currentUser, selectedOrganizationId, navigate, setSelectedOrganizationId]);

  if (!currentUser) {
     return <div>Loading user...</div>;
  }

  // Initial loading state or if redirection is imminent
  if ((currentUser.role === 'sys_admin' && !selectedOrganizationId) || 
      (currentUser.role === 'org_admin' && (!selectedOrganizationId || (currentUser.organizationId && selectedOrganizationId !== String(currentUser.organizationId))))) {
    return <div>Loading or redirecting...</div>; 
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
      <div className="mt-4 space-y-2">
        <p>Welcome, {currentUser.name} ({currentUser.role})!</p>
        {selectedOrganizationId ? (
          <p>Displaying data for Organization ID: <strong>{selectedOrganizationId}</strong></p>
        ) : (
          // This case should ideally not be reached for org_admin due to logic above
          <p>No organization selected.</p>
        )}
        {/* Placeholder for actual dashboard content based on selectedOrganizationId */}
        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <p className="text-lg font-semibold">Organization Specific Content Area</p>
          <p>Data related to organization {selectedOrganizationId} will be shown here.</p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboardPage;