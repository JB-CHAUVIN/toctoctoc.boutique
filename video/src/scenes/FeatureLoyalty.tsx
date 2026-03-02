import { fontFamily } from "../font";
import { useCurrentFrame, interpolate, spring, useVideoConfig, staticFile } from "remotion";
import { ImageReveal } from "../components/ImageReveal";

export const FeatureLoyalty: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 12, mass: 0.8 },
    durationInFrames: 25,
  });

  const badgeOpacity = interpolate(frame - 60, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stampOpacities = [0, 1, 2, 3, 4, 5].map((i) =>
    interpolate(frame - (60 + i * 12), [0, 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0f172a",
        display: "flex",
        fontFamily,
      }}
    >
      {/* Left panel — image */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <ImageReveal
          src={staticFile("resources/carte-loyalty.png")}
          delay={10}
          direction="left"
          width={360}
          height={360}
          style={{ borderRadius: 24, boxShadow: "0 32px 64px rgba(251,191,36,0.25)" }}
        />
      </div>

      {/* Right panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px 60px 40px",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(251,191,36,0.15)",
            border: "1px solid rgba(251,191,36,0.4)",
            borderRadius: 24,
            padding: "6px 16px",
            opacity: badgeOpacity,
            alignSelf: "flex-start",
          }}
        >
          <span style={{ fontSize: 14, color: "#fbbf24", fontWeight: 600 }}>FIDÉLITÉ</span>
        </div>

        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            opacity: textProgress,
            transform: `translateX(${interpolate(textProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          Zéro papier.
          <br />
          <span style={{ color: "#fbbf24" }}>100% digital.</span>
        </div>

        {/* Stamps row */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {stampOpacities.map((opacity, i) => (
            <div
              key={i}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: i < 5 ? "#fbbf24" : "rgba(251,191,36,0.2)",
                border: i < 5 ? "none" : "2px dashed rgba(251,191,36,0.4)",
                opacity,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {i < 5 ? "☕" : ""}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 18,
            color: "#94a3b8",
            lineHeight: 1.6,
            opacity: interpolate(frame - 90, [0, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Carte NFC scannée en 1 seconde.
          <br />
          Récompenses automatiques. Clients fidèles.
        </div>
      </div>
    </div>
  );
};
