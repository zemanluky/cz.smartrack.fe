import { ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-1">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="p-6 bg-muted flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
