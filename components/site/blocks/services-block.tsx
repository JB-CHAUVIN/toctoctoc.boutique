import type { ServicesContent } from "./types";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number | null;
  price: number | null;
  isActive: boolean;
}

interface ServicesBlockProps {
  content: ServicesContent;
  services: Service[];
  business: {
    primaryColor: string;
    accentColor: string;
  };
}

export function ServicesBlock({ content, services, business }: ServicesBlockProps) {
  const active = services.filter((s) => s.isActive);
  if (active.length === 0) return null;

  const title = content.title || "Nos services";

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="mb-12 grid md:grid-cols-[1fr_2fr] md:gap-20">
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: business.primaryColor }}
          >
            {title}
          </span>
          <div className="mt-4 h-px w-12" style={{ backgroundColor: business.primaryColor }} />
          {content.subtitle && (
            <p className="mt-4 text-sm text-slate-400">{content.subtitle}</p>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {active.map((service, i) => (
          <div
            key={service.id}
            className="group grid grid-cols-[auto_1fr_auto] gap-x-8 gap-y-1 py-6 md:gap-x-12"
          >
            {/* Number */}
            <span className="mt-0.5 font-mono text-xs tabular-nums text-slate-300">
              {String(i + 1).padStart(2, "0")}
            </span>

            {/* Name + description */}
            <div>
              <h3 className="text-base font-semibold text-slate-900 md:text-lg">
                {service.name}
              </h3>
              {service.description && (
                <p className="mt-1 text-sm text-slate-400">{service.description}</p>
              )}
              {service.duration !== null && (
                <p className="mt-1 text-xs text-slate-300">{service.duration} min</p>
              )}
            </div>

            {/* Price */}
            {service.price !== null && (
              <div className="text-right">
                <span className="text-base font-semibold text-slate-800">
                  {service.price % 1 === 0
                    ? `${service.price}€`
                    : `${service.price.toFixed(2)}€`}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
