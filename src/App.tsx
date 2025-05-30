import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/ui/layout";
const ProductsPage = lazy(() => import("@/app/products/page"));
const ProductDetailPage = lazy(() => import("@/app/products/detail/page"));
const OrganizationsPage = lazy(() => import("./app/organizations/page"));
const OrganizationDashboardPage = lazy(() => import("./app/dashboard/page"));
const LoginPage = lazy(() => import("./app/login/page"));
const UsersPage = lazy(() => import("./app/users/page"));
const DeviceManagementPage = lazy(() => import("@/app/device-management/page"));
const AdminShelfManagementPage = lazy(() => import("@/app/shelf-management/page"));
const ShelfManagementDetailPage = lazy(() => import("@/app/shelf-management/[id]/page"));
const OrgShelfStockPage = lazy(() => import("@/app/shelf-stock/page"));

import { useAuthStore } from "@/lib/stores/authStore";
import { useUserStore } from "@/lib/stores/userStore"; 
import { ProtectedRoute } from "./components/auth/ProtectedRoute";


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
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-xl font-semibold">Načítání stránky...</div>}>
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
          path="/device-management"
          element={ 
            <Layout>
              <ProtectedRoute 
                element={<DeviceManagementPage />}
                allowedRoles={["sys_admin"]}
              />
            </Layout>
          }
        />
        {/* Staré routy pro /shelves a /shelves/:id jsou odstraněny */}
        <Route
          path="/shelf-management"
          element={
            <Layout>
              <ProtectedRoute 
                element={<AdminShelfManagementPage />}
                allowedRoles={["sys_admin"]}
              />
            </Layout>
          }
        />
        <Route
          path="/shelf-management/:id"
          element={
            <Layout>
              <ProtectedRoute 
                element={<ShelfManagementDetailPage />} // Nová komponenta pro detail regálu
                allowedRoles={["sys_admin"]}
              />
            </Layout>
          }
        />
        <Route
          path="/shelf-stock"
          element={
            <Layout>
              {/* Přidáno sys_admin pro testování */}
              <ProtectedRoute 
                element={<OrgShelfStockPage />}
                allowedRoles={["sys_admin", "org_admin", "org_user"]}
              />
            </Layout>
          }
        />
        <Route
          path="/products/detail"
          element={
            <Layout>
              <ProtectedRoute 
                element={<ProductDetailPage />}
                allowedRoles={["sys_admin", "org_admin", "org_user"]}
              />
            </Layout>
          }
        />
        </Routes>
      </Suspense>
    </Router>
  );
}
