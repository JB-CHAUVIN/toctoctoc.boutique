import type { HoursContent } from "./types";

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

interface HoursBlockProps {
  content: HoursContent;
  business: {
    primaryColor: string;
  };
  bookingConfig?: {
    openTime: string;
    closeTime: string;
    workDays: unknown;
  } | null;
}

export function HoursBlock({ content, business, bookingConfig }: HoursBlockProps) {
  const title = content.title || "Horaires";

  // Use custom schedule or derive from bookingConfig
  let schedule: Array<{ label: string; hours: string }> = [];

  if (content.schedule && content.schedule.length > 0) {
    schedule = content.schedule;
  } else if (bookingConfig) {
    const workDays = Array.isArray(bookingConfig.workDays)
      ? (bookingConfig.workDays as number[])
      : JSON.parse(bookingConfig.workDays as string) as number[];

    schedule = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
      label: DAY_LABELS[day],
      hours: workDays.includes(day)
        ? `${bookingConfig.openTime} – ${bookingConfig.closeTime}`
        : "Fermé",
    }));
  }

  if (schedule.length === 0) return null;

  const todayIndex = new Date().getDay();

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-20">
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: business.primaryColor }}
          >
            {title}
          </span>
          <div className="mt-4 h-px w-12" style={{ backgroundColor: business.primaryColor }} />
        </div>

        <div className="max-w-sm">
          {schedule.map((row, i) => {
            const isClosed = row.hours.toLowerCase() === "fermé";
            // Try to detect if it's today
            const dayLabel = row.label.toLowerCase();
            const todayLabel = DAY_LABELS[todayIndex].toLowerCase();
            const isToday = dayLabel === todayLabel;

            return (
              <div
                key={i}
                className={`flex items-center justify-between py-3 ${
                  i < schedule.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    isToday ? "font-bold" : "text-slate-700"
                  }`}
                  style={isToday ? { color: business.primaryColor } : undefined}
                >
                  {row.label}
                  {isToday && (
                    <span className="ml-2 text-xs font-normal text-slate-400">— {"aujourd'hui"}</span>
                  )}
                </span>
                <span
                  className={`text-sm ${
                    isClosed ? "text-slate-300" : isToday ? "font-medium" : "text-slate-500"
                  }`}
                >
                  {row.hours}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
