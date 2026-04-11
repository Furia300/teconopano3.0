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
          className="flex min-h-screen flex-col"
          style={{
            paddingLeft: sidebarWidth,
            transition: "padding-left .25s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 dark:bg-[#1A1A1A] dark:bg-none">
            <div className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 sm:py-7">{children}</div>
          </main>
        </div>
      </div>
    </SidebarCollapseContext.Provider>
  );
}
