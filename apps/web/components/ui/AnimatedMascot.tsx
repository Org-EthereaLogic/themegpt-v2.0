"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface AnimatedMascotProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: {
    outer: "w-10 h-10",
    eyeGap: 8,      // gap between eyes in px
    eyeSize: 4,     // individual eye size in px
    eyeOffset: 1.5, // max eye movement in px
    smile: "w-3 h-1.5",
  },
  md: {
    outer: "w-[52px] h-[52px]",
    eyeGap: 10,     // gap between eyes in px
    eyeSize: 6,     // individual eye size in px
    eyeOffset: 2,   // max eye movement in px
    smile: "w-3.5 h-[7px]",
  },
  lg: {
    outer: "w-16 h-16",
    eyeGap: 12,     // gap between eyes in px
    eyeSize: 8,     // individual eye size in px
    eyeOffset: 2.5, // max eye movement in px
    smile: "w-4 h-2",
  },
};

export function AnimatedMascot({ size = "md", className = "" }: AnimatedMascotProps) {
  const config = sizeConfig[size];
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Only track if cursor is within 300px
    if (distance > 300) {
      setEyeOffset({ x: 0, y: 0 });
      return;
    }

    // Normalize and apply max offset
    const maxOffset = config.eyeOffset;
    const angle = Math.atan2(distanceY, distanceX);
    const intensity = Math.min(1, distance / 150);

    setEyeOffset({
      x: Math.cos(angle) * maxOffset * intensity,
      y: Math.sin(angle) * maxOffset * intensity,
    });
  }, [config.eyeOffset]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div
      ref={containerRef}
      className={`${config.outer} relative cursor-pointer transition-transform duration-300 hover:scale-110 ${className}`}
    >
      {/* Outer ring with conic gradient */}
      <div
        className="w-full h-full rounded-full relative"
        style={{
          background: `conic-gradient(
            from 0deg at 50% 50%,
            #E8A87C 0deg,
            #5BB5A2 120deg,
            #F4E4BA 240deg,
            #E8A87C 360deg
          )`,
          animation: "mascotWobble 4s ease-in-out infinite",
        }}
      >
        {/* Inner face */}
        <div
          className="absolute inset-1 rounded-full flex flex-col items-center justify-center"
          style={{ background: "#FDF8F3" }}
        >
          {/* Eyes container - no width/height constraint, only gap */}
          <div
            className="flex"
            style={{ gap: `${config.eyeGap}px`, marginTop: "4px" }}
          >
            {/* Left eye */}
            <div
              style={{
                width: `${config.eyeSize}px`,
                height: `${config.eyeSize}px`,
                background: "#4A3728",
                borderRadius: "50%",
                animation: "blink 4s ease-in-out infinite",
                transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                transition: "transform 0.1s ease-out",
              }}
            />
            {/* Right eye */}
            <div
              style={{
                width: `${config.eyeSize}px`,
                height: `${config.eyeSize}px`,
                background: "#4A3728",
                borderRadius: "50%",
                animation: "blink 4s ease-in-out infinite",
                transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                transition: "transform 0.1s ease-out",
              }}
            />
          </div>
          {/* Smile */}
          <div
            className={`${config.smile} border-2 border-t-0 rounded-b-full`}
            style={{ borderColor: "#4A3728", marginTop: "4px" }}
          />
        </div>
      </div>
    </div>
  );
}
