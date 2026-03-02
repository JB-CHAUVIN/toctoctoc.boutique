import { fontFamily } from "../font";
import { useCurrentFrame, interpolate, spring, useVideoConfig, staticFile } from "remotion";
import { ImageReveal } from "../components/ImageReveal";

const Star: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame - delay, [0, 12], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span style={{ fontSize: 44, opacity, transform: `scale(${scale})`, display: "inline-block" }}>⭐</span>
  );
};

export const FeatureAvis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, mass: 0.8 },
    durationInFrames: 25,
  });

  const badgeOpacity = interpolate(frame - 40, [0, 20], [0, 1], {
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
        fontFamily,
      }}
    >
      {/* Left panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 40px 60px 80px",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(79,70,229,0.2)",
            border: "1px solid rgba(79,70,229,0.4)",
            borderRadius: 24,
            padding: "6px 16px",
            opacity: badgeOpacity,
            alignSelf: "flex-start",
          }}
        >
          <span style={{ fontSize: 14, color: "#a5b4fc", fontWeight: 600 }}>
            AVIS CLIENTS
          </span>
        </div>

        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            opacity: textProgress,
            transform: `translateX(${interpolate(textProgress, [0, 1], [-30, 0])}px)`,
          }}
        >
          Boostez vos avis{"\n"}5 étoiles
          <br />
          <span style={{ color: "#4f46e5" }}>légalement</span>
        </div>

        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} delay={i * 10 + 40} />
          ))}
        </div>

        <div
          style={{
            fontSize: 18,
            color: "#94a3b8",
            lineHeight: 1.6,
            opacity: interpolate(frame - 80, [0, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Le client <b>laisse un avis</b> <br /> et tente de gagner une
          <b>récompense via une roulette</b>.
        </div>
      </div>

      {/* Right panel */}
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
          src={staticFile("resources/carte-reviews.png")}
          delay={20}
          direction="right"
          width={360}
          height={360}
          style={{
            borderRadius: 24,
            boxShadow: "0 32px 64px rgba(79,70,229,0.4)",
          }}
        />
      </div>
    </div>
  );
};
