import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarCollapseContext } from "@/hooks/useSidebarCollapse";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarHovering, setSidebarHovering] = useState(false);
  const sidebarWidth = collapsed ? (sidebarHovering ? 256 : 72) : 256;

  return (
    <SidebarCollapseContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-muted/30 dark:bg-[#1A1A1A]">
        <Sidebar onHoveringChange={setSidebarHovering} />
        <div
          className="flex flex-col min-h-screen"
          style={{
            paddingLeft: sidebarWidth,
            transition: "padding-left .25s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <Header />
          <main className="flex-1 p-0 overflow-x-hidden overflow-y-auto">
            <div className="mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarCollapseContext.Provider>
  );
}
