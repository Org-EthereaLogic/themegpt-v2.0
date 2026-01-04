"use client";

import { useState, useCallback, MouseEvent } from "react";

interface TiltState {
  rotateX: number;
  rotateY: number;
}

export function useTilt(maxDegrees: number = 8) {
  const [tilt, setTilt] = useState<TiltState>({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateY = (mouseX / (rect.width / 2)) * maxDegrees;
      const rotateX = -(mouseY / (rect.height / 2)) * maxDegrees;

      setTilt({ rotateX, rotateY });
    },
    [maxDegrees]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  const style = {
    transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
    transition: "transform 0.15s ease-out",
  };

  return { tilt, style, handleMouseMove, handleMouseLeave };
}
