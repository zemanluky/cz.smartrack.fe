import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/ui/layout";
import StockPage from "@/app/stock/page";
import ProductDetailPage from "@/app/stock/[productId]/page";
import ReportsPage from "@/app/reports/page";

const Placeholder = ({ title }: { title: string }) => (
    <div className="text-2xl font-bold">{title}</div>
);

export default function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/dashboard" element={<Placeholder title="Přehled" />} />
                    <Route path="/stock" element={<StockPage />} />
                    <Route path="/stock/:productId" element={<ProductDetailPage />} />
                    <Route path="/inventory" element={<Placeholder title="Inventura" />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="*" element={<StockPage />} /> {/* Default route */}
                </Routes>
            </Layout>
        </Router>
    );
}