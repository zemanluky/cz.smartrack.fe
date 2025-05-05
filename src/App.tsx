import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/ui/layout";
import StockPage from "@/app/stock/page";
import ReportsPage from "@/app/reports/page";
import OrganizationsPage from "./app/organizations/page";
import { useAuthStore } from "./stores/authStore";
import LoginPage from "./app/login/page";

const Placeholder = ({ title }: { title: string }) => (
  <div className="text-2xl font-bold">{title}</div>
);

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const token = useAuthStore((state) => state.token);
  return token ? element : <Navigate to="/login" />;
};

export default function App() {
  // const restoreSession = useAuthStore((state) => state.restoreSession);
  // const isSessionRestored = useAuthStore((state) => state.isSessionRestored);

  // useEffect(() => {
  //   restoreSession();
  // }, []);

  // if (!isSessionRestored)
  //   return (
  //     <div className="flex items-center justify-center h-screen text-xl font-semibold">
  //       Loading...
  //     </div>
  //   );

  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute element={<Placeholder title="Přehled" />} />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute element={<Placeholder title="Přehled" />} />
            }
          />
          <Route
            path="/stock"
            element={<ProtectedRoute element={<StockPage />} />}
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute element={<Placeholder title="Inventura" />} />
            }
          />
          <Route
            path="/reports"
            element={<ProtectedRoute element={<ReportsPage />} />}
          />
          <Route
            path="/organizations"
            element={<ProtectedRoute element={<OrganizationsPage />} />}
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
