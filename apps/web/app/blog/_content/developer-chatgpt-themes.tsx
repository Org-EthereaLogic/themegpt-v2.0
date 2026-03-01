/* eslint-disable react/no-unescaped-entities */
export function DeveloperThemesContent() {
  return (
    <div className="blog-prose">
      <p>
        If you work in VS Code with Dracula all day and then switch to ChatGPT's blinding white
        interface, you know the jarring visual context switch all too well. Your IDE is tuned exactly
        how you want it — carefully balanced contrast, warm dark tones, the right accent colors.
        ChatGPT looks like it was designed for a different species.
      </p>
      <p>
        ThemeGPT brings four canonical developer themes directly into ChatGPT. No configuration, no
        tinkering — just install the extension and pick your theme. Here's what you need to know
        about each one.
      </p>

      <h2>Why Developer Themes Matter in an AI Chat Interface</h2>
      <p>
        Developer themes like Dracula, Monokai, and Solarized weren't designed by accident. Each
        was built with specific goals around readability, contrast ratios, and visual fatigue during
        extended sessions. When you spend hours reading code and documentation, these palettes are
        genuinely easier on your eyes than arbitrary color choices.
      </p>
      <p>
        ChatGPT responses are essentially long-form text — the same reading conditions that made
        developer themes popular in editors apply equally here. The consistency also helps: your
        brain stays in the same visual context whether you're writing code, reviewing documentation,
        or asking ChatGPT to explain a concept.
      </p>

      <h2>Dracula Theme for ChatGPT</h2>
      <p>
        Dracula was created by Zeno Rocha in 2013 and has since become one of the most ported
        themes in software history, with official versions for over 300 applications. The palette
        is distinctive: deep purple-gray backgrounds, soft foreground text in warm white, and
        accent colors in purple, pink, and green.
      </p>
      <p>
        ThemeGPT's Dracula implementation uses the authentic palette:
      </p>
      <ul>
        <li><strong>Background:</strong> <code>#282A36</code> — the original Dracula dark</li>
        <li><strong>Surface:</strong> <code>#343746</code> — for sidebars and panels</li>
        <li><strong>Text:</strong> <code>#F8F8F2</code> — soft white, not harsh</li>
        <li><strong>Muted text:</strong> <code>#6272A4</code> — comment color from the original</li>
        <li><strong>Accent:</strong> <code>#BD93F9</code> — the signature Dracula purple</li>
      </ul>
      <p>
        A subtle <code>glowOverlay</code> adds ambient depth behind conversations without
        distracting from the content. If you're a VS Code user on the Dracula Official extension,
        this is the closest you'll get to a seamless visual environment.
      </p>

      <h2>Monokai Pro for ChatGPT</h2>
      <p>
        Monokai was created by Wimer Hazenberg in 2006 and has remained one of the most influential
        color schemes in programming. The Pro variant, released for Sublime Text, refined the
        original with warmer tones and better support for modern syntax.
      </p>
      <p>
        ThemeGPT's Monokai Pro implementation:
      </p>
      <ul>
        <li><strong>Background:</strong> <code>#2D2A2E</code> — warm dark, not cold gray</li>
        <li><strong>Surface:</strong> <code>#403E41</code> — slightly lifted panels</li>
        <li><strong>Text:</strong> <code>#FCFCFA</code> — clean off-white foreground</li>
        <li><strong>Muted text:</strong> <code>#939293</code> — precisely balanced mid-gray</li>
        <li><strong>Accent:</strong> <code>#FFD866</code> — the signature Monokai yellow-gold</li>
      </ul>
      <p>
        The warm-toned background is the key differentiator from most dark themes. Where other dark
        palettes use cool blue-gray bases, Monokai Pro sits slightly warm, which many developers
        find easier to read under warm lighting conditions. A subtle noise overlay adds texture.
      </p>

      <h2>Solarized Dark for ChatGPT</h2>
      <p>
        Solarized by Ethan Schoonover was published in 2011 with something unusual: a detailed
        mathematical justification for every color choice based on CIELAB color space, contrast
        ratios, and human visual perception research. It's less a style choice and more an
        ergonomic decision.
      </p>
      <p>
        The Solarized Dark palette in ThemeGPT:
      </p>
      <ul>
        <li><strong>Background:</strong> <code>#002B36</code> — the distinctive teal-tinged dark</li>
        <li><strong>Surface:</strong> <code>#073642</code> — secondary panel color</li>
        <li><strong>Text:</strong> <code>#839496</code> — intentionally lower contrast than most themes</li>
        <li><strong>Muted text:</strong> <code>#657B83</code> — for secondary content</li>
        <li><strong>Accent:</strong> <code>#2AA198</code> — Solarized's teal</li>
      </ul>
      <p>
        The lower-contrast text (<code>#839496</code> on <code>#002B36</code>) is a deliberate
        design choice in the original Solarized palette. Schoonover's research suggested that some
        high-contrast themes create visual fatigue through excessive brightness difference. Whether
        you agree with the theory, Solarized has lasted 15 years as a developer staple — something
        is working.
      </p>
      <p>
        If you're new to Solarized and find the text contrast too low at first, give it a week. Many
        developers report that they don't notice the lower contrast after adjustment, and their eyes
        are noticeably less fatigued at the end of the day.
      </p>

      <h2>One Dark for ChatGPT</h2>
      <p>
        One Dark was Atom's default dark theme and later inspired VS Code's default dark appearance.
        It's now one of the most-used themes on the VS Code marketplace through the "One Dark Pro"
        extension by binaryify.
      </p>
      <p>
        ThemeGPT's One Dark implementation:
      </p>
      <ul>
        <li><strong>Background:</strong> <code>#282C34</code> — the classic slate-blue dark</li>
        <li><strong>Surface:</strong> <code>#21252B</code> — slightly darker surface</li>
        <li><strong>Text:</strong> <code>#ABB2BF</code> — the characteristic One Dark gray-blue foreground</li>
        <li><strong>Muted text:</strong> <code>#5C6370</code> — muted comment tone</li>
        <li><strong>Accent:</strong> <code>#61AFEF</code> — One Dark's soft blue</li>
      </ul>
      <p>
        The slate-blue base and characteristic blue accent give One Dark a distinctly modern look.
        A glow overlay adds subtle depth. If your editor is on VS Code's default theme or One Dark
        Pro, this theme makes ChatGPT feel immediately familiar.
      </p>

      <h2>More Premium Developer Themes</h2>
      <p>
        Beyond the four free developer themes, ThemeGPT's premium tier includes several more
        developer-centric options:
      </p>
      <ul>
        <li>
          <strong>Synth Wave</strong> — deep purple with a neon grid overlay and pink accents.
          For developers with a retro-futurist aesthetic.
        </li>
        <li>
          <strong>Apple II Phosphor</strong> — black background with green phosphor text.
          Monochrome, distraction-free, extremely readable.
        </li>
        <li>
          <strong>Tomorrow Night Blue</strong> — deep navy background with soft blue accents and
          sparse twinkling stars. Clean and focused.
        </li>
        <li>
          <strong>Shades of Purple</strong> — a VS Code-inspired purple palette with high contrast.
        </li>
      </ul>

      <h2>How to Install Developer Themes</h2>
      <ol>
        <li>
          Go to the{" "}
          <a
            href="https://chromewebstore.google.com/detail/themegpt-chatgpt-themes/dlphknialdlpmcgoknkcmapmclgckhba"
            target="_blank"
            rel="noopener noreferrer"
          >
            ThemeGPT Chrome Web Store page
          </a>{" "}
          and click <strong>Add to Chrome</strong>.
        </li>
        <li>Open or refresh chatgpt.com.</li>
        <li>Click the ThemeGPT icon in your toolbar.</li>
        <li>
          Select Dracula, Monokai Pro, Solarized Dark, or One Dark. The theme applies instantly.
        </li>
      </ol>
      <p>
        All four developer themes listed in this guide — Dracula, Monokai Pro, Solarized Dark, and
        One Dark — are free with no account required.
      </p>

      <h2>Privacy: No Conversation Data Leaves Your Browser</h2>
      <p>
        ThemeGPT operates entirely in your browser as a CSS injection layer. The extension cannot
        read your ChatGPT conversations, does not intercept API requests, and does not communicate
        with any external server to apply themes.
      </p>
      <p>
        Theme preferences are stored locally in your browser's extension storage using Chrome's
        <code>chrome.storage.local</code> API. This is the same storage mechanism used by
        your browser's bookmark manager — offline, private, and entirely yours.
      </p>
      <p>
        For developers who are mindful about what they share with third-party tools, ThemeGPT is
        designed to require the minimum necessary permissions. It requests access to chatgpt.com
        to apply styles, and nothing else.
      </p>
    </div>
  );
}
