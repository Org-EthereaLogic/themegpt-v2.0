"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if device supports hover (not touch)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    document.addEventListener("mousemove", handleMouseMove);

    // Add hover listeners to interactive elements
    const interactives = document.querySelectorAll(
      "a, button, [role='button'], .cursor-pointer, input, select, textarea"
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="custom-cursor fixed w-5 h-5 rounded-full border-2 pointer-events-none z-[9999] transition-transform duration-150 ease-out"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) ${isHovering ? "scale(1.5)" : "scale(1)"}`,
        borderColor: isHovering ? "#E8A87C" : "#5BB5A2",
        background: isHovering ? "rgba(232, 168, 124, 0.1)" : "transparent",
      }}
    />
  );
}
