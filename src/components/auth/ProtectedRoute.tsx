// src/components/auth/ProtectedRoute.tsx

import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUserStore, UserRole } from "@/lib/stores/userStore";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  element: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const token = useAuthStore((state) => state.token);
  const isSessionRestored = useAuthStore((state) => state.isSessionRestored);
  
  const currentUser = useUserStore((state) => state.currentUser);
  const isUserLoaded = useUserStore((state) => state.isUserLoaded);

  const location = useLocation();

  if (!isSessionRestored || !isUserLoaded) {
    // V App.tsx by měl být globální loader, takže zde můžeme vrátit null,
    // nebo specifický loader pro routu, pokud by App.tsx loader nebyl dostatečný.
    // Prozatím necháme null, aby se spoléhalo na globální loader v App.tsx.
    return null; 
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
      // Přesměrovat na dashboard (nebo jinou "access denied" stránku)
      // Můžeme zvážit přesměrování na specifickou "access-denied" stránku místo dashboardu
      // pro lepší UX, ale prozatím dashboard postačí.
      return <Navigate to="/dashboard" replace />; 
    }
  }

  return <>{element}</>;
};
