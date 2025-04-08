import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/ui/layout";

const Placeholder = ({ title }: { title: string }) => (
  <div className="text-2xl font-bold">{title}</div>
);

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Placeholder title="Přehled" />} />
          <Route path="/stock" element={<Placeholder title="Sklad" />} />
          <Route
            path="/inventory"
            element={<Placeholder title="Inventura" />}
          />
          <Route path="/reports" element={<Placeholder title="Reporty" />} />
        </Routes>
      </Layout>
    </Router>
  );
}
