import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/stores/userStore';
import { useOrganizationStore } from '@/lib/stores/organizationsStore';

/**
 * Redirects sys_admin to /organizations if no org is selected.
 * Returns true if a redirect or loading is happening (show a loading message), false otherwise.
 */
export function useRequireOrganization({ includeOrgAdmin = false }: { includeOrgAdmin?: boolean } = {}) {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const { selectedOrganizationId, setSelectedOrganizationId } = useOrganizationStore();

  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'sys_admin') {
      if (!selectedOrganizationId) {
        if (!hasShownToast.current) {
          toast.info('Please select an organization to continue.');
          hasShownToast.current = true;
        }
        navigate('/organizations');
      } else {
        hasShownToast.current = false;
      }
    }
  }, [currentUser, selectedOrganizationId, navigate, setSelectedOrganizationId, includeOrgAdmin]);

  // Return true if loading/redirecting (no org selected for sys_admin)
  if (!currentUser) return true;
  if (currentUser.role === 'sys_admin' && !selectedOrganizationId) return true;
  return false;
}
