import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  bg?: string;
  trend?: { value: number; label: string };
}

export function StatsCard({ label, value, icon: Icon, color = "text-primary", bg = "bg-primary/10", trend }: StatsCardProps) {
  return (
    <div className="bg-card rounded-xl border shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight mt-1">{value}</p>
          {trend && (
            <p className={cn("text-xs mt-1", trend.value >= 0 ? "text-success" : "text-destructive")}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", bg)}>
          <Icon className={cn("h-6 w-6", color)} />
        </div>
      </div>
    </div>
  );
}
