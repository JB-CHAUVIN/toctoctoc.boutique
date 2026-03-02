import { fontFamily } from "../font";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const FeatureScan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const overlayOpacity = interpolate(frame, [0, 20], [0, 0.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, mass: 0.8 },
    durationInFrames: 25,
  });

  const subtitleOpacity = interpolate(frame - 50, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgeProgress = spring({
    frame: frame - 80,
    fps,
    config: { damping: 10, mass: 0.7 },
    durationInFrames: 20,
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        fontFamily,
      }}
    >
      {/* Background photo */}
      <Img
        src={staticFile(
          "resources/passage-caisse.jpg",
        )}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.99) 0%, rgba(15,23,42,0.99) 100%)",
          opacity: overlayOpacity,
        }}
      />
      {/* Content bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          right: 80,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            opacity: titleProgress,
            transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
            marginBottom: 16,
          }}
        >
          Simple pour <span style={{ fontWeight: "bold" }}>vos clients !</span>
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#cbd5e1",
            opacity: subtitleOpacity,
            marginBottom: 32,
          }}
        >
          Scan NFC instantané & QRCode facile à utiliser.
        </div>

        {/* Badges row */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {["⚡ Instantané", "📱 Sans app", "🔒 Sécurisé"].map((label, i) => (
            <div
              key={i}
              style={{
                background: "rgba(79,70,229,0.3)",
                border: "1px solid rgba(99,102,241,0.5)",
                borderRadius: 24,
                padding: "8px 20px",
                fontSize: 16,
                color: "#e0e7ff",
                fontWeight: 600,
                opacity: interpolate(frame - (80 + i * 12), [0, 15], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                transform: `scale(${interpolate(
                  frame - (80 + i * 12),
                  [0, 15],
                  [0.85, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                )})`,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
