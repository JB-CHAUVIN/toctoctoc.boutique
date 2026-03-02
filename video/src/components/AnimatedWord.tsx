import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { fontFamily } from "../font";

interface AnimatedWordProps {
  word: string;
  delay: number;
  fontSize?: number;
  color?: string;
  fontWeight?: string | number;
}

export const AnimatedWord: React.FC<AnimatedWordProps> = ({
  word,
  delay,
  fontSize = 56,
  color = "#ffffff",
  fontWeight = 700,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 100 },
    durationInFrames: 20,
  });

  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(progress, [0, 1], [24, 0]);

  return (
    <span
      style={{
        display: "inline-block",
        marginRight: "0.25em",
        fontSize,
        fontWeight,
        fontFamily,
        color,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {word}
    </span>
  );
};
