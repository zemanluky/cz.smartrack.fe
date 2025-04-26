import { useAuthStore } from "@/stores/authStore";

export const Header = () => {
  const user = useAuthStore((state) => state.user);
  return (
    <header className="h-12 border-b px-6 flex items-center justify-between bg-white">
      <span className="text-lg font-semibold">Chytrý regál</span>
      <span className="text-sm text-muted-foreground">{user?.name}</span>
    </header>
  );
};
