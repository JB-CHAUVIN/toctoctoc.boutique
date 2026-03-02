import { fontFamily } from "../font";
import { useCurrentFrame, spring, useVideoConfig, interpolate, Img, staticFile } from "remotion";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 100 },
    durationInFrames: 30,
  });

  const textProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 100 },
    durationInFrames: 30,
  });

  const logoOpacity = interpolate(frame - 15, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame - 30, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const overlayOpacity = interpolate(frame, [0, 20], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#0f172a" }}>
      {/* Background image */}
      <Img
        src={staticFile("resources/restaurant.jpeg")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(3px)",
          transform: "scale(1.05)",
        }}
      />
      {/* Indigo overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #4338ca 0%, #4f46e5 50%, #0f172a 100%)",
          opacity: overlayOpacity,
        }}
      />
      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <Img
          src={staticFile("logo.png")}
          style={{
            width: 96,
            height: 96,
            objectFit: "contain",
            borderRadius: 20,
            opacity: logoOpacity,
            transform: `scale(${interpolate(logoProgress, [0, 1], [0.6, 1])})`,
          }}
        />
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            opacity: textOpacity,
            transform: `translateY(${interpolate(textProgress, [0, 1], [20, 0])}px)`,
            fontFamily,
            textAlign: "center",
          }}
        >
          TocTocToc.boutique
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#a5b4fc",
            opacity: textOpacity,
            transform: `translateY(${interpolate(textProgress, [0, 1], [20, 0])}px)`,
            fontFamily,
          }}
        >
          Le digital pour votre commerce local
        </div>
      </div>
    </div>
  );
};
