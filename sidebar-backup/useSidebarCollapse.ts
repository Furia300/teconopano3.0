import { createContext, useContext } from "react";

export interface SidebarCollapseState {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const SidebarCollapseContext = createContext<SidebarCollapseState>({
  collapsed: false,
  setCollapsed: () => {},
});

export function useSidebarCollapse() {
  return useContext(SidebarCollapseContext);
}
