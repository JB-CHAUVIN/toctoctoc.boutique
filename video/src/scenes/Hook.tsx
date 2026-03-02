import { fontFamily } from "../font";
import { useCurrentFrame } from "remotion";
import { AnimatedWord } from "../components/AnimatedWord";

const TAGLINE = "Digitalisez votre commerce en 5 minutes".split(" ");

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #4338ca 0%, #4f46e5 60%, #6366f1 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        fontFamily,
      }}
    >
      {/* Decorative dots */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#fbbf24",
          opacity: frame > 10 ? 1 : 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 100,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "#a5b4fc",
          opacity: frame > 20 ? 0.6 : 0,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          gap: "0",
          maxWidth: 960,
          lineHeight: 1.2,
        }}
      >
        {TAGLINE.map((word, i) => (
          <AnimatedWord
            key={i}
            word={word}
            delay={i * 6 + 10}
            fontSize={word === "5" ? 72 : 58}
            color={word === "5" ? "#fbbf24" : "#ffffff"}
            fontWeight={800}
          />
        ))}
      </div>

      {/* Sub-line */}
      <div
        style={{
          marginTop: 32,
          fontSize: 22,
          color: "#c7d2fe",
          opacity: frame > 60 ? 1 : 0,
          transition: "opacity 0.3s",
          fontFamily,
        }}
      >
        Avis · Fidélité · Réservations · Vitrine
      </div>
    </div>
  );
};
