import { fontFamily } from "../font";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, mass: 0.8 },
    durationInFrames: 25,
  });

  const titleProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12, mass: 0.8 },
    durationInFrames: 25,
  });

  const btnProgress = spring({
    frame: frame - 50,
    fps,
    config: { damping: 10, mass: 0.7 },
    durationInFrames: 20,
  });

  const urlOpacity = interpolate(frame - 80, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        fontFamily,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glows */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(251,191,36,0.08)",
        }}
      />

      {/* Logo */}
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 80,
          height: 80,
          objectFit: "contain",
          borderRadius: 16,
          opacity: logoProgress,
          transform: `scale(${interpolate(logoProgress, [0, 1], [0.6, 1])})`,
        }}
      />

      {/* Title */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.15,
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        Commencer <span style={{ color: "#fbbf24" }}>gratuitement</span>
      </div>

      {/* CTA Button */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: "18px 48px",
          fontSize: 20,
          fontWeight: 700,
          color: "#4f46e5",
          opacity: btnProgress,
          transform: `scale(${interpolate(btnProgress, [0, 1], [0.85, 1])})`,
          boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
        }}
      >
        Créer mon compte — c&apos;est gratuit
      </div>

      {/* URL */}
      <div
        style={{
          fontSize: 22,
          color: "#c7d2fe",
          opacity: urlOpacity,
          letterSpacing: "0.04em",
          fontWeight: 500,
        }}
      >
        TocTocToc.boutique
      </div>
    </div>
  );
};
