import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
  staticFile,
} from "remotion";

const BRAND = {
  cream: "#FAF6F0",
  chocolate: "#4B2E1E",
  coral: "#E8A87C",
  fontSans: '"DM Sans", sans-serif',
  fontSerif: '"Fraunces", serif',
};

const Title: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 15, 45, 60], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = spring({ fps, frame, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", backgroundColor: BRAND.cream }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Fraunces:opsz,wght@9..144,700&display=swap" rel="stylesheet" />
      <h1 style={{ color: BRAND.chocolate, fontSize: 100, opacity, transform: `scale(${scale})`, fontFamily: BRAND.fontSerif, textAlign: "center", fontWeight: 700 }}>
        {text}
      </h1>
    </AbsoluteFill>
  );
};

const PlainChat: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.cream, justifyContent: "center", alignItems: "center", opacity }}>
      <div style={{ padding: 40, border: "2px solid #e5e5e5", backgroundColor: "#ffffff", borderRadius: 20, width: "60%", boxShadow: "0 10px 30px rgba(75, 46, 30, 0.05)" }}>
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", backgroundColor: "#eee" }} />
          <div style={{ flex: 1, height: 20, backgroundColor: "#eee", marginTop: 15, borderRadius: 10 }} />
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", backgroundColor: "#10a37f" }} />
          <div style={{ flex: 1 }}>
             <div style={{ height: 20, backgroundColor: "#f3f3f3", marginBottom: 10, borderRadius: 10, width: "90%" }} />
             <div style={{ height: 20, backgroundColor: "#f3f3f3", marginBottom: 10, borderRadius: 10, width: "80%" }} />
             <div style={{ height: 20, backgroundColor: "#f3f3f3", borderRadius: 10, width: "60%" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ThemeShowcase: React.FC<{ src: string; name: string }> = ({ src, name }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = spring({ fps, frame, from: 0.95, to: 1, config: { damping: 100 } });
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.cream, justifyContent: "center", alignItems: "center", opacity }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@700&display=swap" rel="stylesheet" />
      <Img src={staticFile(`themes/${src}`)} style={{ width: "95%", height: "95%", objectFit: "contain", transform: `scale(${scale})`, borderRadius: 20, boxShadow: "0 20px 50px rgba(75, 46, 30, 0.2)" }} />
      <div style={{ position: "absolute", bottom: 50, backgroundColor: BRAND.chocolate, padding: "15px 40px", borderRadius: 30, boxShadow: "0 10px 20px rgba(75, 46, 30, 0.3)" }}>
        <h2 style={{ color: BRAND.cream, fontSize: 45, margin: 0, fontFamily: BRAND.fontSans, fontWeight: 700 }}>{name}</h2>
      </div>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ fps, frame, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.cream, justifyContent: "center", alignItems: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Fraunces:opsz,wght@9..144,700&display=swap" rel="stylesheet" />
      <h1 style={{ color: BRAND.chocolate, fontSize: 130, fontFamily: BRAND.fontSerif, fontWeight: 700, textAlign: "center", margin: 0 }}>
        ThemeGPT
      </h1>
      <h2 style={{ color: BRAND.coral, fontSize: 60, fontFamily: BRAND.fontSans, marginTop: 20, fontWeight: 500 }}>
        Beautiful Themes for ChatGPT
      </h2>
      <div style={{ transform: `scale(${scale})`, marginTop: 60, backgroundColor: BRAND.coral, color: BRAND.cream, padding: "30px 60px", borderRadius: 40, fontSize: 50, fontWeight: 700, fontFamily: BRAND.fontSans, boxShadow: "0 15px 30px rgba(232, 168, 124, 0.4)" }}>
        Install for Free
      </div>
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  const themes = [
    { file: "aurora_borealis_1-lg.webp", name: "Aurora Borealis" },
    { file: "dracula_1-lg.webp", name: "Dracula" },
    { file: "electric_dreams_1-lg.webp", name: "Electric Dreams" },
    { file: "frosted_windowpane_1-lg.webp", name: "Frosted Windowpane" },
    { file: "high_contrast_1-lg.webp", name: "High Contrast" },
    { file: "monokai_pro_1-lg.webp", name: "Monokai Pro" },
    { file: "one_dark_1-lg.webp", name: "One Dark" },
    { file: "shades_of_purple_1-lg.webp", name: "Shades of Purple" },
    { file: "silent_night_1-lg.webp", name: "Silent Night" },
    { file: "solarized_dark_1-lg.webp", name: "Solarized Dark" },
    { file: "sunset_blaze_1-lg.webp", name: "Sunset Blaze" },
    { file: "synth_wave_1-lg.webp", name: "Synth Wave" },
    { file: "themegpt_dark_1-lg.webp", name: "ThemeGPT Dark" },
    { file: "themegpt_light_1-lg.webp", name: "ThemeGPT Light" },
    { file: "woodland_retreat_1-lg.webp", name: "Woodland Retreat" }
  ];

  const THEME_DURATION = 40;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.cream }}>
      <Sequence from={0} durationInFrames={60}>
        <Title text="Default ChatGPT is boring." />
      </Sequence>
      
      <Sequence from={60} durationInFrames={60}>
        <PlainChat />
      </Sequence>

      <Sequence from={120} durationInFrames={60}>
        <Title text="Make it yours." />
      </Sequence>

      {themes.map((theme, index) => (
        <Sequence key={theme.name} from={180 + index * THEME_DURATION} durationInFrames={THEME_DURATION}>
          <ThemeShowcase src={theme.file} name={theme.name} />
        </Sequence>
      ))}

      <Sequence from={180 + themes.length * THEME_DURATION} durationInFrames={120}>
        <CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
