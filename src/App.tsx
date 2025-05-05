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
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Layout>
              <ProtectedRoute element={<Placeholder title="Přehled" />} />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <ProtectedRoute element={<Placeholder title="Přehled" />} />
            </Layout>
          }
        />
        <Route
          path="/stock"
          element={
            <Layout>
              <ProtectedRoute element={<StockPage />} />
            </Layout>
          }
        />
        <Route
          path="/inventory"
          element={
            <Layout>
              <ProtectedRoute element={<Placeholder title="Inventura" />} />
            </Layout>
          }
        />
        <Route
          path="/reports"
          element={
            <Layout>
              <ProtectedRoute element={<ReportsPage />} />
            </Layout>
          }
        />
        <Route
          path="/organizations"
          element={
            <Layout>
              <ProtectedRoute element={<OrganizationsPage />} />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
