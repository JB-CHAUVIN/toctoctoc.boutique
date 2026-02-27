import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: { value: number; label: string };
  color?: "indigo" | "emerald" | "amber" | "rose";
  className?: string;
}

const colorClasses = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

export function StatsCard({ label, value, icon, trend, color = "indigo", className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && (
          <span
            className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-lg", colorClasses[color])}
          >
            {icon}
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {trend && (
          <div
            className={cn(
              "mt-1 text-xs font-medium",
              trend.value >= 0 ? "text-emerald-600" : "text-red-500"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </div>
        )}
      </div>
    </div>
  );
}
