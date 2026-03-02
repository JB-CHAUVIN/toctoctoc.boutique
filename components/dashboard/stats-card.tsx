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
        "flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-3 sm:p-6",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
        {icon && (
          <span
            className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-base sm:h-9 sm:w-9 sm:text-lg", colorClasses[color])}
          >
            {icon}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 sm:text-3xl">{value}</div>
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
