import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/ui/layout";
import StockPage from "@/app/stock/page";
import ReportsPage from "@/app/reports/page";
import { useAuthStore } from "./stores/authStore";
import OrganizationsPage from "./app/organizations/page";
import { stat } from "fs";

const Placeholder = ({ title }: { title: string }) => (
  <div className="text-2xl font-bold">{title}</div>
);

export default function App() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Placeholder title="Přehled" />} />
          <Route path="/stock" element={<StockPage />} />
          <Route
            path="/inventory"
            element={<Placeholder title="Inventura" />}
          />
          <Route path="/reports" element={<ReportsPage />} />{" "}
          <Route path="/organizations" element={<OrganizationsPage />} />
          {/* Updated to use the new ReportsPage */}
        </Routes>
      </Layout>
    </Router>
  );
}
