interface OrganicBlobProps {
  color: "teal-soft" | "coral-soft" | "yellow" | "teal" | "coral";
  size: number;
  position: { top?: string; right?: string; bottom?: string; left?: string };
  animationDelay?: string;
  animationVariant?: "default" | "left" | "right";
  blur?: number;
  opacity?: number;
  className?: string;
}

const colorMap = {
  "teal-soft": "#7BCBB9",
  "coral-soft": "#F4C4A0",
  yellow: "#F4E4BA",
  teal: "#5BB5A2",
  coral: "#E8A87C",
};

const animationMap = {
  default: "blobFloat",
  left: "blobFloatLeft",
  right: "blobFloatRight",
};

export function OrganicBlob({
  color,
  size,
  position,
  animationDelay = "0s",
  animationVariant = "default",
  opacity = 0.5,
  className = "",
}: OrganicBlobProps) {
  const animationName = animationMap[animationVariant];
  const hexColor = colorMap[color];

  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle closest-side, ${hexColor}FF, ${hexColor}00)`,
        opacity,
        ...position,
        animation: `${animationName} 25s ease-in-out infinite`,
        animationDelay,
        willChange: "transform",
        contain: "strict",
      }}
    />
  );
}
