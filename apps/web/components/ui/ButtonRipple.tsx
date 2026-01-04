"use client";

import { useState, useCallback, MouseEvent } from "react";

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = useCallback((e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 500);
  }, []);

  return { ripples, createRipple };
}

interface RippleContainerProps {
  ripples: Ripple[];
  color?: string;
}

export function RippleContainer({ ripples, color = "rgba(255, 255, 255, 0.4)" }: RippleContainerProps) {
  return (
    <>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            background: color,
          }}
        />
      ))}
    </>
  );
}
