"use client";

interface AnimatedMascotProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: { outer: "w-10 h-10", eye: "w-1 h-1 gap-2", smile: "w-3 h-1.5" },
  md: { outer: "w-[52px] h-[52px]", eye: "w-1.5 h-1.5 gap-2.5", smile: "w-3.5 h-[7px]" },
  lg: { outer: "w-16 h-16", eye: "w-2 h-2 gap-3", smile: "w-4 h-2" },
};

export function AnimatedMascot({ size = "md", className = "" }: AnimatedMascotProps) {
  const sizes = sizeClasses[size];

  return (
    <div
      className={`${sizes.outer} relative cursor-pointer transition-transform duration-300 hover:scale-110 ${className}`}
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
          className="absolute inset-1 rounded-full flex flex-col items-center justify-center gap-1"
          style={{ background: "#FDF8F3" }}
        >
          {/* Eyes */}
          <div className={`flex ${sizes.eye} mt-1`}>
            <div
              className="rounded-full"
              style={{
                width: size === "sm" ? "4px" : size === "md" ? "6px" : "8px",
                height: size === "sm" ? "4px" : size === "md" ? "6px" : "8px",
                background: "#4A3728",
                animation: "blink 4s ease-in-out infinite",
              }}
            />
            <div
              className="rounded-full"
              style={{
                width: size === "sm" ? "4px" : size === "md" ? "6px" : "8px",
                height: size === "sm" ? "4px" : size === "md" ? "6px" : "8px",
                background: "#4A3728",
                animation: "blink 4s ease-in-out infinite",
              }}
            />
          </div>
          {/* Smile */}
          <div
            className={`${sizes.smile} border-2 border-t-0 rounded-b-full`}
            style={{ borderColor: "#4A3728" }}
          />
        </div>
      </div>
    </div>
  );
}
