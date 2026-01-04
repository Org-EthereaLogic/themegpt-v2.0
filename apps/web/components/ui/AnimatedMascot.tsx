"use client";

interface AnimatedMascotProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: {
    outer: "w-10 h-10",
    eyeGap: 8,      // gap between eyes in px
    eyeSize: 4,     // individual eye size in px
    smile: "w-3 h-1.5",
  },
  md: {
    outer: "w-[52px] h-[52px]",
    eyeGap: 10,     // gap between eyes in px
    eyeSize: 6,     // individual eye size in px
    smile: "w-3.5 h-[7px]",
  },
  lg: {
    outer: "w-16 h-16",
    eyeGap: 12,     // gap between eyes in px
    eyeSize: 8,     // individual eye size in px
    smile: "w-4 h-2",
  },
};

export function AnimatedMascot({ size = "md", className = "" }: AnimatedMascotProps) {
  const config = sizeConfig[size];

  return (
    <div
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
