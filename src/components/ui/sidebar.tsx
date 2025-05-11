import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Boxes, User, Building } from "lucide-react";
import { useUserStore } from "@/lib/stores/userStore";

const currentUser = useUserStore.getState().currentUser;
const userRole = currentUser?.role;

const navItems = [
  {
    label: "Organizace",
    to: "/organizations",
    icon: Building,
    roles: ["sys_admin"],
  },
  {
    label: "Uživatelé",
    to: "/users",
    icon: User,
    roles: ["sys_admin", "org_admin"],
  },
  {
    label: "Přehled",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["sys_admin", "org_admin", "org_user"],
  },
  {
    label: "Produkty",
    to: "/products",
    icon: Boxes,
    roles: ["sys_admin", "org_admin", "org_user"],
  },
];

export const Sidebar = () => {
  const location = useLocation();

  if (!userRole) {
    return (
      <aside className="w-50 h-full border-r bg-white p-4">
        <p className="text-red-500">User role not found. Please log in.</p>
      </aside>
    );
  }

  return (
    <aside className="w-50 h-full border-r bg-white p-4">
      <nav className="flex flex-col gap-1">
        {navItems
          .filter(({ roles }) => roles.includes(userRole))
          .map(({ label, to, icon: Icon }) => {
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
