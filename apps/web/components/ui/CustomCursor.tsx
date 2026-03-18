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
    let posX = -100;
    let posY = -100;

    // Use transform only — avoids layout-triggering left/top changes on every mousemove
    const setTransform = () => {
      cursor.style.transform = `translate3d(${posX - 10}px, ${posY - 10}px, 0) scale(${isHovering ? 1.5 : 1})`;
    };

    const updateHoverStyles = () => {
      setTransform();
      cursor.style.borderColor = isHovering ? "#E8A87C" : "#5BB5A2";
      cursor.style.background = isHovering ? "rgba(232, 168, 124, 0.1)" : "transparent";
    };

    const handleMouseMove = (e: MouseEvent) => {
      posX = e.clientX;
      posY = e.clientY;
      setTransform();
    };

    const handleMouseEnter = () => {
      isHovering = true;
      updateHoverStyles();
    };

    const handleMouseLeave = () => {
      isHovering = false;
      updateHoverStyles();
    };
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
      className="custom-cursor fixed w-5 h-5 rounded-full border-2 pointer-events-none z-[9999] transition-[transform,border-color,background] duration-150 ease-out"
      style={{
        top: 0,
        left: 0,
        transform: "translate3d(-100px, -100px, 0) scale(1)",
        borderColor: "#5BB5A2",
        background: "transparent",
      }}
    />
  );
}
