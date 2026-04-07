import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarCollapseContext } from "@/hooks/useSidebarCollapse";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarCollapseContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-muted/30">
        <Sidebar />
        <div
          className="flex flex-col min-h-screen"
          style={{
            paddingLeft: collapsed ? 72 : 256,
            transition: "padding-left .25s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <Header />
          <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarCollapseContext.Provider>
  );
}
