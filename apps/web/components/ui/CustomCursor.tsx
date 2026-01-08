"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Check if device supports hover (not touch)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return;

    let isHovering = false;

    const updateHoverStyles = () => {
      cursor.style.transform = `translate(-50%, -50%) ${isHovering ? "scale(1.5)" : "scale(1)"}`;
      cursor.style.borderColor = isHovering ? "#E8A87C" : "#5BB5A2";
      cursor.style.background = isHovering ? "rgba(232, 168, 124, 0.1)" : "transparent";
    };

    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    const handleMouseEnter = () => {
      isHovering = true;
      updateHoverStyles();
    };

    const handleMouseLeave = () => {
      isHovering = false;
      updateHoverStyles();
    };

    updateHoverStyles();
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

  return (
    <div
      ref={cursorRef}
      className="custom-cursor fixed w-5 h-5 rounded-full border-2 pointer-events-none z-[9999] transition-transform duration-150 ease-out"
      style={{
        left: 0,
        top: 0,
        transform: "translate(-50%, -50%) scale(1)",
        borderColor: "#5BB5A2",
        background: "transparent",
      }}
    />
  );
}
