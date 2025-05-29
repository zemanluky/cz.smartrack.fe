import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  Users, // Changed from User to Users for clarity
  Building,
  Settings,
  RouterIcon,
  BookmarkIcon,
} from "lucide-react";
import { useUserStore } from "@/lib/stores/userStore";
// import { useOrganizationStore } from "@/lib/stores/organizationsStore"; // Not used in this component

const systemAdminNavItems = [
  {
    label: "Organizace",
    to: "/organizations",
    icon: Building,
    roles: ["sys_admin"],
  },
  {
    label: "Správa Zařízení",
    to: "/admin/device-management",
    icon: RouterIcon,
    roles: ["sys_admin"],
  },
];

const commonNavItems = [
  {
    label: "Uživatelé",
    to: "/users",
    icon: Users, // Using Users icon
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
  {
    label: "Regály",
    to: "/shelves",
    icon: BookmarkIcon,
    roles: ["sys_admin", "org_admin", "org_user"],
  },
];

type SidebarProps = {
  onNavItemClick?: () => void; // Optional prop to handle nav item clicks, e.g., for closing mobile sidebar
};

export const Sidebar = ({ onNavItemClick }: SidebarProps) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const userRole = currentUser?.role;
  const location = useLocation();

  if (!userRole) {
    return (
      <aside className="w-64 h-full border-r bg-background p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-primary">Smart IoT</h2>
        </div>
        <p className="text-red-500">User role not found. Please log in.</p>
      </aside>
    );
  }

  const renderNavLinks = (items: typeof systemAdminNavItems | typeof commonNavItems) => {
    return items
      .filter(({ roles }) => roles.includes(userRole!)) // userRole is checked, so it's safe to use !
      .map(({ label, to, icon: Icon }) => {
        const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to + "/"));
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavItemClick} // Call onNavItemClick when a link is clicked
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      });
  };

  const filteredSystemAdminItems = systemAdminNavItems.filter(({ roles }) => roles.includes(userRole!));

  return (
    <aside className="w-64 h-full border-r bg-background p-4 flex flex-col shadow-sm">
      {/* Logo and title moved to Header.tsx */}
      <nav className="flex flex-col gap-1 flex-grow">
        {filteredSystemAdminItems.length > 0 && (
          <>
            <div className="px-1 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center">
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Systémová Správa
            </div>
            {renderNavLinks(systemAdminNavItems)}
            <hr className="my-3 border-border" />
          </>
        )}
        {renderNavLinks(commonNavItems)}
      </nav>
      {/* Optional: Sidebar footer for user profile/logout, if not in header */}
    </aside>
  );
};
