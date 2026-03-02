import { fontFamily } from "../font";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface PricingCardProps {
  plan: string;
  price: string;
  features: string[];
  highlight?: boolean;
  delay: number;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, price, features, highlight, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.8 },
    durationInFrames: 30,
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        background: highlight ? "linear-gradient(135deg, #4f46e5, #6366f1)" : "rgba(255,255,255,0.05)",
        border: highlight ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: "36px 32px",
        width: 300,
        opacity,
        transform: `translateY(${interpolate(progress, [0, 1], [60, 0])}px) scale(${interpolate(
          progress,
          [0, 1],
          [0.85, 1]
        )})`,
        position: "relative",
        overflow: "hidden",
        boxShadow: highlight ? "0 24px 48px rgba(79,70,229,0.4)" : "none",
      }}
    >
      {highlight && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#fbbf24",
            borderRadius: 12,
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "0.05em",
          }}
        >
          POPULAIRE
        </div>
      )}
      <div style={{ fontSize: 14, fontWeight: 600, color: highlight ? "#c7d2fe" : "#94a3b8", letterSpacing: "0.08em", marginBottom: 12 }}>
        {plan}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
        <span style={{ fontSize: 52, fontWeight: 800, color: "#ffffff" }}>{price}</span>
        <span style={{ fontSize: 16, color: highlight ? "#c7d2fe" : "#64748b" }}>/mois</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: highlight ? "#fbbf24" : "#4f46e5", fontSize: 16 }}>✓</span>
            <span style={{ fontSize: 14, color: highlight ? "#e0e7ff" : "#94a3b8" }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Pricing: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame - 10, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        fontFamily,
      }}
    >
      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          color: "#ffffff",
          opacity: titleOpacity,
          textAlign: "center",
        }}
      >
        Des tarifs{" "}
        <span style={{ color: "#4f46e5" }}>transparents</span>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <PricingCard
          plan="FREE"
          price="0€"
          features={["1 commerce", "Site vitrine", "Lien Google Maps"]}
          delay={20}
        />
        <PricingCard
          plan="STARTER"
          price="9€"
          features={["1 commerce", "Avis NFC", "Fidélité digitale", "Réservations"]}
          highlight
          delay={50}
        />
        <PricingCard
          plan="PRO"
          price="19€"
          features={["3 commerces", "Tout STARTER", "Réseaux sociaux", "Support prioritaire"]}
          delay={80}
        />
      </div>
    </div>
  );
};
