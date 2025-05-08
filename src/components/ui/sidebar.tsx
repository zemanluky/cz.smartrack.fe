import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Boxes } from "lucide-react";

const navItems = [

  { label: "Organizace", to: "/organizations", icon: LayoutDashboard },
  { label: "Přehled", to: "/dashboard", icon: LayoutDashboard },
  { label: "Produkty", to: "/products", icon: Boxes },


];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-50 h-full border-r bg-white p-4">
      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                ${
                  active
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
