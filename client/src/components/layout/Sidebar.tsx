import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  DollarSign,
  Settings,
  Box,
  ClipboardList,
  LogOut,
  QrCode,
  Factory,
  ArrowDownToLine,
  ShoppingCart
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Truck, label: "Solicitar Coleta", href: "/coleta/solicitacao" },
  { icon: ArrowDownToLine, label: "Entrada Coleta (QR)", href: "/coleta/entrada" },
  { icon: LayoutDashboard, label: "Galpão Kanban", href: "/galpao" },
  { icon: ClipboardList, label: "Triagem", href: "/separacao" },
  { icon: Factory, label: "Produção", href: "/producao" },
  { icon: Box, label: "Entrada Estoque", href: "/estoque/entrada" },
  { icon: Package, label: "Produtos", href: "/produtos" },
  { icon: ShoppingCart, label: "Clientes", href: "/clientes" },
  { icon: Truck, label: "Fornecedores", href: "/fornecedores" },
  { icon: Users, label: "Equipe", href: "/equipe" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50">
      <div className="py-6 border-b border-sidebar-border flex justify-center items-center bg-[#2e2e2e]">
        <img src="/src/assets/logo.png" alt="Tecnopano" className="w-40 h-auto" />
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar pt-[25px] pb-[25px]">
        {menuItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all cursor-pointer relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-[#FF073A] to-[#B20028] text-white shadow-md"
                    : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-[#FF073A] hover:to-[#B20028] hover:text-white"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
                <item.icon className={cn("h-5 w-5 relative z-10", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")} />
                <span className="relative z-10">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer">
          <LogOut className="h-5 w-5" />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
}
