import { useCurrentFrame, interpolate } from "remotion";

interface ImageRevealProps {
  src: string;
  delay?: number;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  direction?: "left" | "right" | "bottom";
}

export const ImageReveal: React.FC<ImageRevealProps> = ({
  src,
  delay = 0,
  width = "100%",
  height = "100%",
  style,
  direction = "left",
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame - delay, [0, 30], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const clipPath =
    direction === "left"
      ? `inset(0 ${100 - progress}% 0 0)`
      : direction === "right"
      ? `inset(0 0 0 ${100 - progress}%)`
      : `inset(${100 - progress}% 0 0 0)`;

  return (
    <img
      src={src}
      style={{
        width,
        height,
        objectFit: "cover",
        clipPath,
        ...style,
      }}
    />
  );
};
