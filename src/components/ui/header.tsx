import { useUserStore } from "@/lib/stores/userStore";
import { Link } from "react-router-dom";
import { LogoutButton } from "./LogoutButton";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

type HeaderProps = {
  onMenuClick: () => void;
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const currentUser = useUserStore((state) => state.currentUser);
  return (
    <header className="h-16 border-b px-4 md:px-6 flex items-center justify-between bg-background shadow-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2" // Skryje na md a větších, přidán margin
          onClick={onMenuClick}
          aria-label="Otevřít menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary">
            <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z"/>
            <path d="M4 7.5L12 12L20 7.5"/>
            <path d="M12 12V21"/>
            <path d="M10 14.5L7 13"/>
            <path d="M14 14.5L17 13"/>
          </svg>
          <h2 className="text-xl font-bold text-primary tracking-tight hidden sm:inline">Smart IoT</h2>
        </Link>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <span className="text-sm text-muted-foreground">{currentUser?.name}</span>
        <LogoutButton />
      </div>
    </header>
  );
};
