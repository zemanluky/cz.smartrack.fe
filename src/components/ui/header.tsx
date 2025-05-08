import { useUserStore } from "@/lib/stores/userStore";
import { Link } from "react-router-dom";
import { LogoutButton } from "./LogoutButton";

export const Header = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  return (
    <header className="h-12 border-b px-6 flex items-center justify-between bg-white">
      <Link to="/dashboard" className="text-lg font-semibold">
        Chytrý regál
      </Link>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">{currentUser?.name}</span>
        <LogoutButton />
      </div>
    </header>
  );
};
