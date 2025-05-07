import { useAuthStore } from "@/lib/stores/authStore";
import { useUserStore } from "@/lib/stores/userStore";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const UserNav = () => {
  const { logoutUser } = useAuthStore();
  const { currentUser, clearCurrentUser } = useUserStore();
  const { clearSelectedOrganization } = useOrganizationStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    clearCurrentUser();
    clearSelectedOrganization();
    navigate("/login");
  };

  // If no user is logged in, don't render anything (or render a login button if preferred)
  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-muted-foreground">
        {currentUser.name || currentUser.email}
      </span>
      <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};
