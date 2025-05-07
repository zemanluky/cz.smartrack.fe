import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUserStore } from "@/lib/stores/userStore";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';

export const LogoutButton = () => {
  const navigate = useNavigate();
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const clearCurrentUser = useUserStore((state) => state.clearCurrentUser);

  const handleLogout = () => {
    logoutUser();
    clearCurrentUser();
    navigate("/login");
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
      <LogOut className="h-5 w-5" />
    </Button>
  );
};
