"use client";

interface FloatingCardProps {
  gradient: string;
  label: string;
  dotColors: [string, string, string];
  lineColor: string;
  labelBgColor: string;
  labelTextColor: string;
  rotation: number;
  animationName: "float1" | "float2" | "float3";
  animationDelay?: string;
  position: { top?: string; right?: string; bottom?: string; left?: string };
  size: { width: number; height: number };
  className?: string;
}

export function FloatingCard({
  gradient,
  label,
  dotColors,
  lineColor,
  labelBgColor,
  labelTextColor,
  rotation,
  animationName,
  animationDelay = "0s",
  position,
  size,
  className = "",
}: FloatingCardProps) {
  return (
    <div
      className={`absolute rounded-[20px] shadow-[0_20px_50px_rgba(74,55,40,0.12)] transition-all duration-400 cursor-pointer hover:shadow-[0_30px_60px_rgba(74,55,40,0.18)] ${className}`}
      style={{
        width: size.width,
        height: size.height,
        background: gradient,
        transform: `rotate(${rotation}deg)`,
        animation: `${animationName} 6s ease-in-out infinite`,
        animationDelay,
        ...position,
      }}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Window dots */}
        <div className="flex gap-[5px] mb-3">
          {dotColors.map((color, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: color }}
            />
          ))}
        </div>
        {/* Content lines */}
        <div className="flex flex-col gap-2 flex-1">
          <div
            className="h-1.5 rounded-sm opacity-60"
            style={{ background: lineColor, width: "90%" }}
          />
          <div
            className="h-1.5 rounded-sm opacity-60"
            style={{ background: lineColor, width: "70%" }}
          />
          <div
            className="h-1.5 rounded-sm opacity-60"
            style={{ background: lineColor, width: "85%" }}
          />
        </div>
      </div>
      {/* Label */}
      <span
        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-[0.7rem] font-semibold uppercase tracking-wider"
        style={{ background: labelBgColor, color: labelTextColor }}
      >
        {label}
      </span>
    </div>
  );
}
