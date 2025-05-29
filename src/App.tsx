import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/ui/layout";
import ProductsPage from "@/app/products/page";
import OrganizationsPage from "./app/organizations/page";
import OrganizationDashboardPage from "./app/dashboard/page";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUserStore } from "@/lib/stores/userStore"; 
import LoginPage from "./app/login/page";
import UsersPage from "./app/users/page";
import { ProtectedRoute } from "./components/auth/ProtectedRoute"; // Import new ProtectedRoute
import DeviceManagementPage from "./components/devices/DeviceManagementPage"; // Import DeviceManagementPage

export default function App() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isSessionRestored = useAuthStore((state) => state.isSessionRestored);
  const isUserLoaded = useUserStore((state) => state.isUserLoaded); // Get isUserLoaded

  useEffect(() => {
    // restoreSession is now called from within authStore when token exists or not
    // but we still need to trigger the initial check if not restored.
    if (!isSessionRestored) { // This will also trigger fetchCurrentUser if token exists
      restoreSession();
    }
  }, [isSessionRestored, restoreSession]);

  if (!isSessionRestored || !isUserLoaded) { // Update loading condition
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold">
        Initializing session...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={ // Assuming '/' is an alias for '/dashboard'
            <Layout>
              <ProtectedRoute 
                element={<OrganizationDashboardPage />}
                allowedRoles={["sys_admin", "org_admin", "org_user"]}
              />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <ProtectedRoute 
                element={<OrganizationDashboardPage />}
                allowedRoles={["sys_admin", "org_admin", "org_user"]}
              />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout>
              <ProtectedRoute 
                element={<ProductsPage />}
                allowedRoles={["sys_admin", "org_admin", "org_user"]}
              />
            </Layout>
          }
        />
        {/* Placeholder for /inventory, can be removed or implemented later */}
        {/* <Route
          path="/inventory"
          element={
            <Layout>
              <ProtectedRoute element={<Placeholder title="Inventura" />} allowedRoles={["sys_admin", "org_admin", "org_user"]}/>
            </Layout>
          }
        /> */}
        <Route
          path="/organizations"
          element={
            <Layout>
              <ProtectedRoute 
                element={<OrganizationsPage />}
                allowedRoles={["sys_admin"]}
              />
            </Layout>
          }
        />
        <Route
          path="/users"
          element={
            <Layout>
              <ProtectedRoute 
                element={<UsersPage />}
                allowedRoles={["sys_admin", "org_admin"]}
              />
            </Layout>
          }
        />
        <Route 
          path="/admin/device-management"
          element={ 
            <Layout>
              <ProtectedRoute 
                element={<DeviceManagementPage />}
                allowedRoles={["sys_admin"]}
              />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
