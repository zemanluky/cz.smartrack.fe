import { ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"; 
// Button and Menu icon will be handled in Header for the trigger

export const Layout = ({ children }: { children: ReactNode }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile, visible from md breakpoint */}
      <div className="hidden md:block border-r shadow-sm"> {/* Added border and shadow like original sidebar */}
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={toggleMobileSidebar} />
        <div className="flex flex-1 overflow-y-auto">
          <main className="p-4 md:p-6 flex-1">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar in Sheet component */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r shadow-sm"> {/* Added border, shadow and ensured no padding from SheetContent itself */}
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Hlavní navigace aplikace
            </SheetDescription>
          </SheetHeader>
          {/* Pass a handler to close the sidebar on nav item click */}
          <Sidebar onNavItemClick={() => setIsMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      <Toaster />
    </div>
  );
};