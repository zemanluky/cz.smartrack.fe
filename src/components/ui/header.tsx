import { useAuthStore } from "@/lib/stores/authStore";
import { Link } from "react-router-dom";

export const Header = () => {
  const user = useAuthStore((state) => state.user);
  return (
    <header className="h-12 border-b px-6 flex items-center justify-between bg-white">
      <Link to="/" className="text-lg font-semibold">
        Chytrý regál
      </Link>
      <span className="text-sm text-muted-foreground">{user?.name}</span>
    </header>
  );
};
