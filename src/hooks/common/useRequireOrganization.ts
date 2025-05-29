import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/stores/userStore';
import { useOrganizationStore } from '@/lib/stores/organizationsStore';

/**
 * Redirects sys_admin (and org_admin if includeOrgAdmin is true) to /organizations if no org is selected.
 * Returns true if a redirect or loading is happening (show a loading message), false otherwise.
 */
export function useRequireOrganization({ includeOrgAdmin = false }: { includeOrgAdmin?: boolean } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useUserStore();
  const { selectedOrganizationId } = useOrganizationStore(); // setSelectedOrganizationId is not used for writing here

  const hasShownToastAndNavigated = useRef(false);

  useEffect(() => {
    if (!currentUser) return; // Wait for user data

    const needsOrgSelection =
      currentUser.role === 'sys_admin' ||
      (includeOrgAdmin && currentUser.role === 'org_admin');

    if (needsOrgSelection) {
      if (!selectedOrganizationId) {
        // Only navigate if not already on the target page and action hasn't been taken yet
        if (location.pathname !== '/organizations' && !hasShownToastAndNavigated.current) {
          toast.info('Please select an organization to continue.');
          navigate('/organizations');
          hasShownToastAndNavigated.current = true; // Mark that action has been taken
        }
      } else {
        // If an organization is selected, reset the flag, allowing for re-trigger if selection is cleared later
        hasShownToastAndNavigated.current = false;
      }
    } else {
      // If user role doesn't require org selection (or includeOrgAdmin is false for org_admin),
      // ensure the flag is reset so it doesn't persist a true state from a previous role/condition.
      hasShownToastAndNavigated.current = false;
    }
  }, [currentUser, selectedOrganizationId, navigate, location.pathname, includeOrgAdmin]);

  // Determine if loading/redirecting state should be signaled to the component using the hook
  if (!currentUser) return true; // User data not yet loaded

  const userShouldBeRedirected =
    (currentUser.role === 'sys_admin' || (includeOrgAdmin && currentUser.role === 'org_admin')) &&
    !selectedOrganizationId &&
    location.pathname !== '/organizations';

  if (userShouldBeRedirected) {
    return true; // Signal that a redirect is pending or has just occurred, so UI can show loading/wait
  }

  return false; // Otherwise, content can be displayed
}
