"use client";

import { useState, useCallback, MouseEvent } from "react";

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
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    const rotateY = (mouseX / (rect.width / 2)) * 8;
    const rotateX = -(mouseY / (rect.height / 2)) * 8;
    setTilt({ rotateX, rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  }, []);

  return (
    <div
      className={`absolute rounded-[20px] transition-all duration-300 cursor-pointer ${className}`}
      style={{
        width: size.width,
        height: size.height,
        background: gradient,
        transform: isHovered
          ? `rotate(${rotation}deg) perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
          : `rotate(${rotation}deg)`,
        animation: isHovered ? "none" : `${animationName} 6s ease-in-out infinite`,
        animationDelay,
        boxShadow: isHovered
          ? "0 4px 8px rgba(74,55,40,0.1), 0 16px 32px rgba(74,55,40,0.15), 0 32px 64px rgba(74,55,40,0.1)"
          : "0 20px 50px rgba(74,55,40,0.12)",
        ...position,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
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
