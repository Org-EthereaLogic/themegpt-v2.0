"use client";

interface OrganicBlobProps {
  color: "teal-soft" | "coral-soft" | "yellow" | "teal" | "coral";
  size: number;
  position: { top?: string; right?: string; bottom?: string; left?: string };
  animationDelay?: string;
  blur?: number;
  opacity?: number;
  className?: string;
}

const colorMap = {
  "teal-soft": "var(--teal-soft)",
  "coral-soft": "var(--coral-soft)",
  yellow: "var(--yellow)",
  teal: "var(--teal)",
  coral: "var(--coral)",
};

export function OrganicBlob({
  color,
  size,
  position,
  animationDelay = "0s",
  blur = 60,
  opacity = 0.5,
  className = "",
}: OrganicBlobProps) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: colorMap[color],
        filter: `blur(${blur}px)`,
        opacity,
        ...position,
        animation: `blobFloat 20s ease-in-out infinite`,
        animationDelay,
      }}
    />
  );
}
