import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  Users, // Changed from User to Users for clarity
  Building,
  Settings,
  RouterIcon,
  // BookmarkIcon, // Odebráno, nahrazeno specifičtějšími ikonami
  ArchiveIcon, // Nová ikona pro správu regálů (struktura)
  PackageSearchIcon, // Nová ikona pro správu skladu (obsah)
} from "lucide-react";
import { useUserStore } from "@/lib/stores/userStore";

const systemAdminNavItems = [
  {
    label: "Organizace",
    to: "/organizations",
    icon: Building,
    roles: ["sys_admin"],
  },
  {
    label: "Správa Zařízení",
    to: "/device-management",
    icon: RouterIcon,
    roles: ["sys_admin"],
  },
  {
    label: "Správa Regálů", // Správa struktury regálů
    to: "/shelf-management",
    icon: ArchiveIcon, 
    roles: ["sys_admin"],
  },
];

const commonNavItems = [
  {
    label: "Uživatelé",
    to: "/users",
    icon: Users, 
    roles: ["sys_admin", "org_admin"],
  },
  // Položky "Přehled" a "Produkty" byly přesunuty do organizationUserNavItems
];

const organizationUserNavItems = [
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
    label: "Správa Skladu", // Správa obsahu regálů
    to: "/shelf-stock",
    icon: PackageSearchIcon,
    roles: ["sys_admin", "org_admin", "org_user"], // Všechny role mají mít přístup
  },
];

type NavItem = {
  label: string;
  to: string;
  icon: React.ElementType;
  roles: string[];
};

type SidebarProps = {
  onNavItemClick?: () => void; 
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

  const renderNavLinks = (items: ReadonlyArray<NavItem>) => {
    return items
      .filter(({ roles }) => roles.includes(userRole!)) 
      .map(({ label, to, icon: Icon }) => {
        const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to + "/"));
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavItemClick} 
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
  const filteredOrganizationUserItems = organizationUserNavItems.filter(({ roles }) => roles.includes(userRole!));
  const filteredCommonNavItems = commonNavItems.filter(({ roles }) => roles.includes(userRole!));

  return (
    <aside className="w-64 h-full border-r bg-background p-4 flex flex-col shadow-sm">
      <nav className="flex flex-col gap-1 flex-grow">
        {filteredSystemAdminItems.length > 0 && (
          <>
            <div className="px-1 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center">
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Systémová Správa
            </div>
            {renderNavLinks(systemAdminNavItems)}
            {(filteredCommonNavItems.length > 0 || filteredOrganizationUserItems.length > 0) && <hr className="my-3 border-border" />}
          </>
        )}
        
        {filteredCommonNavItems.length > 0 && 
          <>
            {renderNavLinks(commonNavItems)}
            {filteredOrganizationUserItems.length > 0 && <hr className="my-3 border-border" />}
          </>
        }

        {filteredOrganizationUserItems.length > 0 && (
           <>
            <div className="px-1 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center">
              <Building className="h-3.5 w-3.5 mr-1.5" />
              Správa Organizace
            </div>
            {renderNavLinks(organizationUserNavItems)}
           </>
        )}
      </nav>
    </aside>
  );
};
