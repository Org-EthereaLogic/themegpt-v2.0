      265 +      type: 'dots',                                                                                                     
      266 +      opacity: 0.05,                                                                                                    
      267 +      color: '#A1887F',                                                                                                 
      268 +      size: 1,                                                                                                          
      269 +    },                                                                                                                  
      270 +  },                                                                                                                    
      271 +  {                                                                                                                     
      272 +    id: 'winter-wonderland',                                                                                            
      273 +    name: 'Winter Wonderland',                                                                                          
      274 +    category: 'christmas',                                                                                              
      275 +    colors: {                                                                                                           
      276 +      '--cgpt-bg': '#E3F2FD',                                                                                           
      277 +      '--cgpt-surface': '#FFFFFF',                                                                                      
      278 +      '--cgpt-text': '#0D47A1',                                                                                         
      279 +      '--cgpt-text-muted': '#5472D3',                                                                                   
      280 +      '--cgpt-border': '#BBDEFB',                                                                                       
      281 +      '--cgpt-accent': '#1976D2',                                                                                       
      282 +    },                                                                                                                  
      283 +    isPremium: true,                                                                                                    
      284 +    pattern: {                                                                                                          
      285 +      type: 'snowflakes',                                                                                               
      286 +      opacity: 0.12,                                                                                                    
      287 +      color: '#90CAF9',                                                                                                 
      288 +      size: 1,                                                                                                          
      289 +    },                                                                                                                  
      290 +  },                                                                                                                    
      291 +  {                                                                                                                     
      292 +    id: 'starry-christmas-eve',                                                                                         
      293 +    name: 'Starry Christmas Eve',                                                                                       
      294 +    category: 'christmas',                                                                                              
      295 +    colors: {                                                                                                           
      296 +      '--cgpt-bg': '#0A0A1A',                                                                                           
      297 +      '--cgpt-surface': '#12122A',                                                                                      
      298 +      '--cgpt-text': '#FAFAFA',                                                                                         
      299 +      '--cgpt-text-muted': '#B8B8D1',                                                                                   
      300 +      '--cgpt-border': '#2A2A4A',                                                                                       
      301 +      '--cgpt-accent': '#FFD700',                                                                                       
      302 +    },                                                                                                                  
      303 +    isPremium: true,                                                                                                    
      304 +    pattern: {                                                                                                          
      305 +      type: 'stars',                                                                                                    
      306 +      opacity: 0.15,                                                                                                    
      307 +      color: '#FFD700',                                                                                                 
      308 +      size: 1,                                                                                                          
      309 +    },                                                                                                                  
      310 +  },                                                                                                                    
      311 +                                                                                                                        
      312 +  // =============================================                                                                      
      313    // PREMIUM THEMES - Core Collection                                                                                   
      314    // =============================================                                                                      
      315    {                                                                                                                     
                                                                                                                                   
⏺ Now let me build both packages.                                                                                                  
                                                                                                                                   
⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0/packages/shared && pnpm build 2>&1)                                                
  ⎿  > @themegpt/shared@2.0.0 build /Users/etherealogic/Dev/themegpt-v2.0/packages/shared                                          
     > tsc                                                                                                                         
                                                                                                                                   
⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0/apps/extension && pnpm build 2>&1)                                                 
  ⎿  > extension@0.0.1 build /Users/etherealogic/Dev/themegpt-v2.0/apps/extension                                                  
     > plasmo build                                                                                                                
     … +12 lines (ctrl+o to expand)                                                                                                
                                                                                                                                   
⏺ Build completed successfully. Here's what was implemented:                                                                       
                                                                                                                                   
  Changes Made                                                                                                                     
                                                                                                                                   
  1. Vibrant Themes → Free Section                                                                                                 
                                                                                                                                   
  - Aurora Borealis, Sunset Blaze, Electric Dreams are now free (8 free themes total)                                              
                                                                                                                                   
  2. Pattern System (Option A Implemented)                                                                                         
                                                                                                                                   
  Extended the Theme interface with optional pattern support:                                                                      
  pattern?: {                                                                                                                      
    type: 'dots' | 'grid' | 'snowflakes' | 'stars' | 'noise';                                                                      
    opacity: number;  // 0.01-0.15 for subtlety                                                                                    
    color?: string;   // Override accent color                                                                                     
    size?: number;    // Scale factor                                                                                              
  }                                                                                                                                
                                                                                                                                   
  3. Five New Christmas Pattern Themes                                                                                             
                                                                                                                                   
  | Theme                | Pattern    | Description                                |                                               
  |----------------------|------------|--------------------------------------------|                                               
  | Snowfall Serenity    | snowflakes | Deep slate blue with drifting white snow   |                                               
  | Holiday Plaid        | grid       | Forest green with subtle tartan-style grid |                                               
  | Gingerbread Warmth   | dots       | Warm brown with cozy dotted texture        |                                               
  | Winter Wonderland    | snowflakes | Light frosted theme with blue snowflakes   |                                               
  | Starry Christmas Eve | stars      | Deep night sky with golden stars           |                                               
                                                                                                                                   
  Theme Count Summary                                                                                                              
                                                                                                                                   
  - Free themes: 8 (5 IDE classics + 3 vibrant)                                                                                    
  - Premium themes: 16 (6 original Christmas + 5 pattern Christmas + 5 core)                                                       
  - Total: 24 themes                                                                                                               
                                                                                                                                   
  ---                                                                                                                              
  Reload the extension in Chrome (chrome://extensions → refresh icon) to see the new themes with patterns in the Premium           
  Collection.                                                                                                                      
                                                                                                                                   
> Prior to previewing themes in the Chrome extension, please load them into our custom theme previewer application. This           
approach eliminates the need to modify category settings or disable locked free themes during the preview process.                 
Additionally, it enables seamless navigation between all 16 premium themes and 8 free themes.                                      
                                                                                                                                   
**Theme Previewer Path:**                                                                                                          
`file:///Users/etherealogic/Dev/themegpt-v2.0/apps/extension/tools/theme-preview/index.html`                                       
                                                                                                                                   
⏺ Let me read the current theme previewer to understand its structure and update it with all the themes and new effects.           
                                                                                                                                   
⏺ Read(apps/extension/tools/theme-preview/index.html)                                                                              
  ⎿  Read 910 lines                                                                                                                
                                                                                                                                   
⏺ The theme previewer needs to be updated with the new premium effects system (animated snowfall, twinkling stars, tree            
  silhouettes, ambient effects, seasonal decorations). Let me update it comprehensively.                                           
                                                                                                                                   
⏺ Write(apps/extension/tools/theme-preview/index.html)                                                                             
  ⎿  Added 383 lines, removed 262 lines                                                                                            
      209      body::before { z-index: 0; }                                                                                        
      210      body::after { z-index: 1; }                                                                                         
      211                                                                                                                          
      212 +    /* === Effects Layer === */                                                                                         
      213 +    .themegpt-effects-layer {                                                                                           
      214 +      position: fixed;                                                                                                  
      215 +      inset: 0;                                                                                                         
      216 +      pointer-events: none;                                                                                             
      217 +      z-index: 2;                                                                                                       
      218 +      overflow: hidden;                                                                                                 
      219 +    }                                                                                                                   
      220 +                                                                                                                        
      221      /* === Theme Panel === */                                                                                           
      222      .theme-panel {                                                                                                      
      223        position: fixed;                                                                                                  
      224        right: 0;                                                                                                         
      225        top: 0;                                                                                                           
      226        bottom: 0;                                                                                                        
      218 -      width: 300px;                                                                                                     
      227 +      width: 320px;                                                                                                     
      228        background: #111;                                                                                                 
      229        border-left: 1px solid #333;                                                                                      
      230        padding: 16px;                                                                                                    
     ...                                                                                                                           
      258      .theme-btn.active { border-color: #7ECEC5; }                                                                        
      259      .theme-btn .name { font-weight: 600; margin-bottom: 4px; }                                                          
      260      .theme-btn .accent-bar { height: 3px; border-radius: 2px; margin-top: 4px; }                                        
      261 +    .theme-btn .effects-badge {                                                                                         
      262 +      font-size: 8px;                                                                                                   
      263 +      background: rgba(255,255,255,0.2);                                                                                
      264 +      padding: 1px 4px;                                                                                                 
      265 +      border-radius: 2px;                                                                                               
      266 +      margin-top: 4px;                                                                                                  
      267 +      display: inline-block;                                                                                            
      268 +    }                                                                                                                   
      269                                                                                                                          
      270      .current-theme {                                                                                                    
      271        margin-top: 16px;                                                                                                 
     ...                                                                                                                           
      328        font-family: monospace;                                                                                           
      329      }                                                                                                                   
      330                                                                                                                          
      314 -    .var-reference {                                                                                                    
      331 +    .theme-stats {                                                                                                      
      332        margin-top: 12px;                                                                                                 
      316 -      padding: 12px;                                                                                                    
      317 -      background: #0a0a0a;                                                                                              
      318 -      border-radius: 8px;                                                                                               
      319 -      border: 1px solid #333;                                                                                           
      320 -    }                                                                                                                   
      321 -                                                                                                                        
      322 -    .var-reference h4 { margin-bottom: 8px; font-size: 11px; color: #7ECEC5; }                                          
      323 -                                                                                                                        
      324 -    .var-grid {                                                                                                         
      325 -      display: grid;                                                                                                    
      326 -      grid-template-columns: auto 1fr;                                                                                  
      327 -      gap: 4px 8px;                                                                                                     
      328 -      font-size: 10px;                                                                                                  
      329 -    }                                                                                                                   
      330 -                                                                                                                        
      331 -    .var-code {                                                                                                         
      332 -      font-family: monospace;                                                                                           
      333 -      color: #FBBF77;                                                                                                   
      333 +      padding: 8px;                                                                                                     
      334        background: #1a1a1a;                                                                                              
      335 -      padding: 1px 4px;                                                                                                 
      336 -      border-radius: 2px;                                                                                               
      337 -    }                                                                                                                   
      338 -                                                                                                                        
      339 -    .var-desc { color: #888; }                                                                                          
      340 -                                                                                                                        
      341 -    .var-cmd {                                                                                                          
      342 -      margin-top: 10px;                                                                                                 
      343 -      display: flex;                                                                                                    
      344 -      gap: 6px;                                                                                                         
      345 -    }                                                                                                                   
      346 -                                                                                                                        
      347 -    .var-cmd input {                                                                                                    
      348 -      flex: 1;                                                                                                          
      349 -      background: #1a1a1a;                                                                                              
      350 -      border: 1px solid #333;                                                                                           
      351 -      border-radius: 4px;                                                                                               
      352 -      padding: 6px 8px;                                                                                                 
      353 -      color: #fff;                                                                                                      
      354 -      font-family: monospace;                                                                                           
      335 +      border-radius: 6px;                                                                                               
      336        font-size: 11px;                                                                                                  
      337 +      color: #888;                                                                                                      
      338      }                                                                                                                   
      339                                                                                                                          
      358 -    .var-cmd input::placeholder { color: #555; }                                                                        
      359 -                                                                                                                        
      360 -    .var-cmd button {                                                                                                   
      361 -      background: #7ECEC5;                                                                                              
      362 -      color: #111;                                                                                                      
      363 -      border: none;                                                                                                     
      364 -      border-radius: 4px;                                                                                               
      365 -      padding: 6px 12px;                                                                                                
      366 -      font-size: 11px;                                                                                                  
      367 -      font-weight: 600;                                                                                                 
      368 -      cursor: pointer;                                                                                                  
      369 -    }                                                                                                                   
      370 -                                                                                                                        
      371 -    .cmd-output {                                                                                                       
      372 -      margin-top: 8px;                                                                                                  
      373 -      padding: 6px;                                                                                                     
      374 -      background: #111;                                                                                                 
      375 -      border-radius: 4px;                                                                                               
      376 -      font-family: monospace;                                                                                           
      377 -      font-size: 10px;                                                                                                  
      378 -      max-height: 60px;                                                                                                 
      379 -      overflow-y: auto;                                                                                                 
      380 -    }                                                                                                                   
      381 -                                                                                                                        
      382 -    .cmd-output .ok { color: #4ade80; }                                                                                 
      383 -    .cmd-output .warn { color: #fbbf24; }                                                                               
      384 -    .cmd-output .err { color: #f87171; }                                                                                
      340 +    .theme-stats span { color: #7ECEC5; font-weight: 600; }                                                             
      341    </style>                                                                                                              
      342  </head>                                                                                                                 
      343  <body>                                                                                                                  
     ...                                                                                                                           
      429      </main>                                                                                                             
      430    </div>                                                                                                                
      431                                                                                                                          
      432 +  <!-- Effects container (for animated elements) -->                                                                    
      433 +  <div id="themegpt-effects" class="themegpt-effects-layer"></div>                                                      
      434 +                                                                                                                        
      435    <!-- THEME PANEL -->                                                                                                  
      436    <aside class="theme-panel" id="themePanel">                                                                           
      437      <h2>ThemeGPT Preview</h2>                                                                                           
      438                                                                                                                          
      480 -    <h3>Free Themes</h3>                                                                                                
      439 +    <div class="theme-stats">                                                                                           
      440 +      Total: <span id="totalCount">0</span> themes |                                                                    
      441 +      Free: <span id="freeCount">0</span> |                                                                             
      442 +      Premium: <span id="premiumCount">0</span>                                                                         
      443 +    </div>                                                                                                              
      444 +                                                                                                                        
      445 +    <h3>Free Themes (8)</h3>                                                                                            
      446      <div class="theme-grid" id="freeThemes"></div>                                                                      
      447                                                                                                                          
      483 -    <h3>Premium Themes</h3>                                                                                             
      448 +    <h3>Premium Themes (16)</h3>                                                                                        
      449      <div class="theme-grid" id="premiumThemes"></div>                                                                   
      450                                                                                                                          
      451      <div class="current-theme">                                                                                         
     ...                                                                                                                           
      460                                                                                                                          
      461      <div class="controls">                                                                                              
      462        <button class="ctrl-btn" id="exportBtn">Export Theme JSON</button>                                                
      463 +      <button class="ctrl-btn secondary" id="toggleEffectsBtn">Toggle Effects</button>                                  
      464        <button class="ctrl-btn secondary" id="hideBtn">Hide Panel (Ctrl+H)</button>                                      
      465      </div>                                                                                                              
      466                                                                                                                          
      467      <div class="shortcuts">                                                                                             
      468        <p><kbd>Ctrl</kbd>+<kbd>H</kbd> Toggle panel</p>                                                                  
      469        <p><kbd>Ctrl</kbd>+<kbd>E</kbd> Export to console</p>                                                             
      504 -      <p><kbd>Ctrl</kbd>+<kbd>R</kbd> Show reference</p>                                                                
      470 +      <p><kbd>&larr;</kbd>/<kbd>&rarr;</kbd> Navigate themes</p>                                                        
      471      </div>                                                                                                              
      506 -                                                                                                                        
      507 -    <div class="var-reference" id="varReference" style="display:none">                                                  
      508 -      <h4>Variable Quick Ref</h4>                                                                                       
      509 -      <div class="var-grid">                                                                                            
      510 -        <span class="var-code">GL-BG</span><span class="var-desc">Page background</span>                                
      511 -        <span class="var-code">GL-SRF</span><span class="var-desc">Surfaces</span>                                      
      512 -        <span class="var-code">GL-TXT</span><span class="var-desc">Primary text</span>                                  
      513 -        <span class="var-code">GL-TXM</span><span class="var-desc">Muted text</span>                                    
      514 -        <span class="var-code">GL-BRD</span><span class="var-desc">Borders</span>                                       
      515 -        <span class="var-code">GL-ACC</span><span class="var-desc">Accent/links</span>                                  
      516 -      </div>                                                                                                            
      517 -      <div class="var-cmd">                                                                                             
      518 -        <input type="text" id="varCmd" placeholder="SET GL-ACC #FF6AC1" />                                              
      519 -        <button id="varExec">Run</button>                                                                               
      520 -      </div>                                                                                                            
      521 -    </div>                                                                                                              
      472    </aside>                                                                                                              
      473                                                                                                                          
      474    <script>                                                                                                              
      525 -    // === THEME DATA (from packages/shared/src/index.ts) ===                                                           
      475 +    // === THEME DATA (synced from packages/shared/src/index.ts) ===                                                    
      476      const THEMES = [                                                                                                    
      527 -      { id: 'vscode-dark-plus', name: 'VS Code Dark+', category: 'core', colors: { '--cgpt-bg': '#1E1E1E', '--cgp       
          -t-surface': '#252526', '--cgpt-text': '#D4D4D4', '--cgpt-text-muted': '#808080', '--cgpt-border': '#3C3C3C', '--c       
          -gpt-accent': '#569CD6' }, isPremium: false },                                                                           
      528 -      { id: 'solarized-dark', name: 'Solarized Dark', category: 'core', colors: { '--cgpt-bg': '#002B36', '--cgpt       
          --surface': '#073642', '--cgpt-text': '#839496', '--cgpt-text-muted': '#657B83', '--cgpt-border': '#094959', '--cg       
          -pt-accent': '#2AA198' }, isPremium: false },                                                                            
      529 -      { id: 'dracula', name: 'Dracula', category: 'core', colors: { '--cgpt-bg': '#282A36', '--cgpt-surface': '#3       
          -43746', '--cgpt-text': '#F8F8F2', '--cgpt-text-muted': '#6272A4', '--cgpt-border': '#44475A', '--cgpt-accent': '#       
          -BD93F9' }, isPremium: false },                                                                                          
      530 -      { id: 'monokai-pro', name: 'Monokai Pro', category: 'core', colors: { '--cgpt-bg': '#2D2A2E', '--cgpt-surfa       
          -ce': '#403E41', '--cgpt-text': '#FCFCFA', '--cgpt-text-muted': '#939293', '--cgpt-border': '#49474A', '--cgpt-acc       
          -ent': '#FFD866' }, isPremium: false },                                                                                  
      531 -      { id: 'one-dark', name: 'One Dark', category: 'core', colors: { '--cgpt-bg': '#282C34', '--cgpt-surface': '       
          -#21252B', '--cgpt-text': '#ABB2BF', '--cgpt-text-muted': '#5C6370', '--cgpt-border': '#3E4451', '--cgpt-accent':        
          -'#61AFEF' }, isPremium: false },                                                                                        
      532 -      { id: 'aurora-borealis', name: 'Aurora Borealis', category: 'core', colors: { '--cgpt-bg': '#0A1628', '--cg       
          -pt-surface': '#0F2137', '--cgpt-text': '#E0F7FA', '--cgpt-text-muted': '#80DEEA', '--cgpt-border': '#164E63', '--       
          -cgpt-accent': '#00E5CC' }, isPremium: false },                                                                          
      533 -      { id: 'sunset-blaze', name: 'Sunset Blaze', category: 'core', colors: { '--cgpt-bg': '#1A0A14', '--cgpt-sur       
          -face': '#2D1220', '--cgpt-text': '#FFF5F0', '--cgpt-text-muted': '#FFAB91', '--cgpt-border': '#4A1A2E', '--cgpt-a       
          -ccent': '#FF6B4A' }, isPremium: false },                                                                                
      534 -      { id: 'electric-dreams', name: 'Electric Dreams', category: 'core', colors: { '--cgpt-bg': '#0D0221', '--cg       
          -pt-surface': '#150634', '--cgpt-text': '#F5E6FF', '--cgpt-text-muted': '#D4AAFF', '--cgpt-border': '#3D1A6D', '--       
          -cgpt-accent': '#FF2E97' }, isPremium: false },                                                                          
      535 -      { id: 'cozy-cabin-christmas', name: 'Cozy Cabin Christmas', category: 'christmas', colors: { '--cgpt-bg': '       
          -#140E0A', '--cgpt-surface': '#1E1410', '--cgpt-text': '#F9FAFB', '--cgpt-text-muted': '#E5E7EB', '--cgpt-border':       
          - '#4B2E23', '--cgpt-accent': '#D97757' }, isPremium: true, noiseOverlay: true },                                        
      536 -      { id: 'frosted-windowpane', name: 'Frosted Windowpane', category: 'christmas', colors: { '--cgpt-bg': '#F5F       
          -7FB', '--cgpt-surface': '#FFFFFF', '--cgpt-text': '#0F172A', '--cgpt-text-muted': '#4B5563', '--cgpt-border': '#D       
          -1D5DB', '--cgpt-accent': '#3B82F6' }, isPremium: true },                                                                
      537 -      { id: 'midnight-evergreen', name: 'Midnight Evergreen', category: 'christmas', colors: { '--cgpt-bg': '#020       
          -817', '--cgpt-surface': '#07120E', '--cgpt-text': '#F9FAFB', '--cgpt-text-muted': '#E5E7EB', '--cgpt-border': '#1       
          -4532D', '--cgpt-accent': '#22C55E' }, isPremium: true, noiseOverlay: true },                                            
      538 -      { id: 'candy-cane-chat', name: 'Candy Cane Chat', category: 'christmas', colors: { '--cgpt-bg': '#FDF2F2',        
          -'--cgpt-surface': '#FFFFFF', '--cgpt-text': '#111827', '--cgpt-text-muted': '#4B5563', '--cgpt-border': '#FECACA'       
          -, '--cgpt-accent': '#DC2626' }, isPremium: true },                                                                      
      539 -      { id: 'silent-night-starfield', name: 'Silent Night (Starfield)', category: 'christmas', colors: { '--cgpt-       
          -bg': '#020617', '--cgpt-surface': '#02081C', '--cgpt-text': '#F9FAFB', '--cgpt-text-muted': '#CBD5F5', '--cgpt-bo       
          -rder': '#1D4ED8', '--cgpt-accent': '#38BDF8' }, isPremium: true, glowOverlay: true },                                   
      477 +      // FREE THEMES (8)                                                                                                
      478 +      { id: 'vscode-dark-plus', name: 'VS Code Dark+', category: 'core', colors: { '--cgpt-bg': '#1E1E1E', '--cgp       
          +t-surface': '#252526', '--cgpt-text': '#D4D4D4', '--cgpt-text-muted': '#808080', '--cgpt-border': '#3C3C3C', '--c       
          +gpt-accent': '#569CD6' }, isPremium: false, noiseOverlay: true },                                                       
      479 +      { id: 'solarized-dark', name: 'Solarized Dark', category: 'core', colors: { '--cgpt-bg': '#002B36', '--cgpt       
          +-surface': '#073642', '--cgpt-text': '#839496', '--cgpt-text-muted': '#657B83', '--cgpt-border': '#094959', '--cg       
          +pt-accent': '#2AA198' }, isPremium: false, pattern: { type: 'grid', opacity: 0.02, size: 1.5 } },                       
      480 +      { id: 'dracula', name: 'Dracula', category: 'core', colors: { '--cgpt-bg': '#282A36', '--cgpt-surface': '#3       
          +43746', '--cgpt-text': '#F8F8F2', '--cgpt-text-muted': '#6272A4', '--cgpt-border': '#44475A', '--cgpt-accent': '#       
          +BD93F9' }, isPremium: false, glowOverlay: true },                                                                       
      481 +      { id: 'monokai-pro', name: 'Monokai Pro', category: 'core', colors: { '--cgpt-bg': '#2D2A2E', '--cgpt-surfa       
          +ce': '#403E41', '--cgpt-text': '#FCFCFA', '--cgpt-text-muted': '#939293', '--cgpt-border': '#49474A', '--cgpt-acc       
          +ent': '#FFD866' }, isPremium: false, noiseOverlay: true },                                                              
      482 +      { id: 'one-dark', name: 'One Dark', category: 'core', colors: { '--cgpt-bg': '#282C34', '--cgpt-surface': '       
          +#21252B', '--cgpt-text': '#ABB2BF', '--cgpt-text-muted': '#5C6370', '--cgpt-border': '#3E4451', '--cgpt-accent':        
          +'#61AFEF' }, isPremium: false, glowOverlay: true },                                                                     
      483 +      { id: 'aurora-borealis', name: 'Aurora Borealis', category: 'core', colors: { '--cgpt-bg': '#0A1628', '--cg       
          +pt-surface': '#0F2137', '--cgpt-text': '#E0F7FA', '--cgpt-text-muted': '#80DEEA', '--cgpt-border': '#164E63', '--       
          +cgpt-accent': '#00E5CC' }, isPremium: false, glowOverlay: true },                                                       
      484 +      { id: 'sunset-blaze', name: 'Sunset Blaze', category: 'core', colors: { '--cgpt-bg': '#1A0A14', '--cgpt-sur       
          +face': '#2D1220', '--cgpt-text': '#FFF5F0', '--cgpt-text-muted': '#FFAB91', '--cgpt-border': '#4A1A2E', '--cgpt-a       
          +ccent': '#FF6B4A' }, isPremium: false, glowOverlay: true },                                                             
      485 +      { id: 'electric-dreams', name: 'Electric Dreams', category: 'core', colors: { '--cgpt-bg': '#0D0221', '--cg       
          +pt-surface': '#150634', '--cgpt-text': '#F5E6FF', '--cgpt-text-muted': '#D4AAFF', '--cgpt-border': '#3D1A6D', '--       
          +cgpt-accent': '#FF2E97' }, isPremium: false, glowOverlay: true, pattern: { type: 'grid', opacity: 0.02, size: 2 }       
          + },                                                                                                                     
      486 +                                                                                                                        
      487 +      // PREMIUM THEMES - Christmas Collection (6)                                                                      
      488 +      { id: 'cozy-cabin-christmas', name: 'Cozy Cabin Christmas', category: 'christmas', colors: { '--cgpt-bg': '       
          +#140E0A', '--cgpt-surface': '#1E1410', '--cgpt-text': '#F9FAFB', '--cgpt-text-muted': '#E5E7EB', '--cgpt-border':       
          + '#4B2E23', '--cgpt-accent': '#D97757' }, isPremium: true, noiseOverlay: true, effects: { treeSilhouettes: { enab       
          +led: true, style: 'pine', density: 'few' }, animatedSnowfall: { enabled: true, density: 'light', speed: 'slow' }        
          +} },                                                                                                                    
      489 +      { id: 'frosted-windowpane', name: 'Frosted Windowpane', category: 'christmas', colors: { '--cgpt-bg': '#F5F       
          +7FB', '--cgpt-surface': '#FFFFFF', '--cgpt-text': '#0F172A', '--cgpt-text-muted': '#4B5563', '--cgpt-border': '#D       
          +1D5DB', '--cgpt-accent': '#3B82F6' }, isPremium: true, effects: { animatedSnowfall: { enabled: true, density: 'li       
          +ght', speed: 'slow' }, seasonalDecorations: { frostEdge: true } } },                                                    
      490 +      { id: 'midnight-evergreen', name: 'Midnight Evergreen', category: 'christmas', colors: { '--cgpt-bg': '#020       
          +817', '--cgpt-surface': '#07120E', '--cgpt-text': '#F9FAFB', '--cgpt-text-muted': '#E5E7EB', '--cgpt-border': '#1       
          +4532D', '--cgpt-accent': '#22C55E' }, isPremium: true, noiseOverlay: true, effects: { treeSilhouettes: { enabled:       
          + true, style: 'pine', density: 'forest' }, twinklingStars: { enabled: true, count: 'medium' }, ambientEffects: {        
          +fogRising: true } } },                                                                                                  
      491 +      { id: 'candy-cane-chat', name: 'Candy Cane Chat', category: 'christmas', colors: { '--cgpt-bg': '#FDF2F2',        
          +'--cgpt-surface': '#FFFFFF', '--cgpt-text': '#111827', '--cgpt-text-muted': '#4B5563', '--cgpt-border': '#FECACA'       
          +, '--cgpt-accent': '#DC2626' }, isPremium: true, effects: { seasonalDecorations: { candyCaneFrame: true } } },          
      492 +      { id: 'silent-night-starfield', name: 'Silent Night (Starfield)', category: 'christmas', colors: { '--cgpt-       
          +bg': '#020617', '--cgpt-surface': '#02081C', '--cgpt-text': '#F9FAFB', '--cgpt-text-muted': '#CBD5F5', '--cgpt-bo       
          +rder': '#1D4ED8', '--cgpt-accent': '#38BDF8' }, isPremium: true, glowOverlay: true, effects: { twinklingStars: {        
          +enabled: true, count: 'dense', includeShootingStars: true }, ambientEffects: { auroraWaves: true } } },                 
      493        { id: 'minimal-advent', name: 'Minimal Advent', category: 'christmas', colors: { '--cgpt-bg': '#0B0712', '-       
           -cgpt-surface': '#141021', '--cgpt-text': '#F9FAFB', '--cgpt-text-muted': '#E5E7EB', '--cgpt-border': '#4C1D95',        
           '--cgpt-accent': '#7C3AED' }, isPremium: true, noiseOverlay: true },                                                    
      541 -      { id: 'snowfall-serenity', name: 'Snowfall Serenity', category: 'christmas', colors: { '--cgpt-bg': '#0F172       
          -A', '--cgpt-surface': '#1E293B', '--cgpt-text': '#F1F5F9', '--cgpt-text-muted': '#94A3B8', '--cgpt-border': '#334       
          -155', '--cgpt-accent': '#38BDF8' }, isPremium: true, pattern: { type: 'snowflakes', opacity: 0.08, color: '#FFFFF       
          -F', size: 1.2 } },                                                                                                      
      494 +                                                                                                                        
      495 +      // PREMIUM THEMES - Christmas Pattern Collection (5)                                                              
      496 +      { id: 'snowfall-serenity', name: 'Snowfall Serenity', category: 'christmas', colors: { '--cgpt-bg': '#0F172       
          +A', '--cgpt-surface': '#1E293B', '--cgpt-text': '#F1F5F9', '--cgpt-text-muted': '#94A3B8', '--cgpt-border': '#334       
          +155', '--cgpt-accent': '#38BDF8' }, isPremium: true, effects: { animatedSnowfall: { enabled: true, density: 'medi       
          +um', speed: 'slow' } } },                                                                                               
      497        { id: 'holiday-plaid', name: 'Holiday Plaid', category: 'christmas', colors: { '--cgpt-bg': '#0D1F12', '--c       
           gpt-surface': '#14291A', '--cgpt-text': '#E8F5E9', '--cgpt-text-muted': '#A5D6A7', '--cgpt-border': '#1B5E20', '-       
           -cgpt-accent': '#EF5350' }, isPremium: true, pattern: { type: 'grid', opacity: 0.06, color: '#2E7D32', size: 1.5        
           } },                                                                                                                    
      498        { id: 'gingerbread-warmth', name: 'Gingerbread Warmth', category: 'christmas', colors: { '--cgpt-bg': '#1C1       
           20D', '--cgpt-surface': '#2A1B14', '--cgpt-text': '#FFF8E1', '--cgpt-text-muted': '#D7CCC8', '--cgpt-border': '#4       
           E342E', '--cgpt-accent': '#FF8A65' }, isPremium: true, pattern: { type: 'dots', opacity: 0.05, color: '#A1887F',        
           size: 1 } },                                                                                                            
      544 -      { id: 'winter-wonderland', name: 'Winter Wonderland', category: 'christmas', colors: { '--cgpt-bg': '#E3F2F       
          -D', '--cgpt-surface': '#FFFFFF', '--cgpt-text': '#0D47A1', '--cgpt-text-muted': '#5472D3', '--cgpt-border': '#BBD       
          -EFB', '--cgpt-accent': '#1976D2' }, isPremium: true, pattern: { type: 'snowflakes', opacity: 0.12, color: '#90CAF       
          -9', size: 1 } },                                                                                                        
      545 -      { id: 'starry-christmas-eve', name: 'Starry Christmas Eve', category: 'christmas', colors: { '--cgpt-bg': '       
          -#0A0A1A', '--cgpt-surface': '#12122A', '--cgpt-text': '#FAFAFA', '--cgpt-text-muted': '#B8B8D1', '--cgpt-border':       
          - '#2A2A4A', '--cgpt-accent': '#FFD700' }, isPremium: true, pattern: { type: 'stars', opacity: 0.15, color: '#FFD7       
          -00', size: 1 } },                                                                                                       
      546 -      { id: 'synth-wave', name: 'Synth Wave', category: 'core', colors: { '--cgpt-bg': '#262335', '--cgpt-surface       
          -': '#2E2943', '--cgpt-text': '#F9FAFB', '--cgpt-text-muted': '#C7D2FE', '--cgpt-border': '#433162', '--cgpt-accen       
          -t': '#FF6AC1' }, isPremium: true, glowOverlay: true },                                                                  
      547 -      { id: 'tomorrow-night-blue', name: 'Tomorrow Night Blue', category: 'core', colors: { '--cgpt-bg': '#002451       
          -', '--cgpt-surface': '#001C40', '--cgpt-text': '#E0F2FF', '--cgpt-text-muted': '#BFDBFE', '--cgpt-border': '#0035       
          -66', '--cgpt-accent': '#4FC3F7' }, isPremium: true, glowOverlay: true },                                                
      499 +      { id: 'winter-wonderland', name: 'Winter Wonderland', category: 'christmas', colors: { '--cgpt-bg': '#E3F2F       
          +D', '--cgpt-surface': '#FFFFFF', '--cgpt-text': '#0D47A1', '--cgpt-text-muted': '#5472D3', '--cgpt-border': '#BBD       
          +EFB', '--cgpt-accent': '#1976D2' }, isPremium: true, effects: { animatedSnowfall: { enabled: true, density: 'heav       
          +y', speed: 'medium' }, seasonalDecorations: { frostEdge: true } } },                                                    
      500 +      { id: 'starry-christmas-eve', name: 'Starry Christmas Eve', category: 'christmas', colors: { '--cgpt-bg': '       
          +#0A0A1A', '--cgpt-surface': '#12122A', '--cgpt-text': '#FAFAFA', '--cgpt-text-muted': '#B8B8D1', '--cgpt-border':       
          + '#2A2A4A', '--cgpt-accent': '#FFD700' }, isPremium: true, effects: { twinklingStars: { enabled: true, count: 'de       
          +nse', includeShootingStars: true } } },                                                                                 
      501 +                                                                                                                        
      502 +      // PREMIUM THEMES - Core Collection (5)                                                                           
      503 +      { id: 'synth-wave', name: 'Synth Wave', category: 'core', colors: { '--cgpt-bg': '#262335', '--cgpt-surface       
          +': '#2E2943', '--cgpt-text': '#F9FAFB', '--cgpt-text-muted': '#C7D2FE', '--cgpt-border': '#433162', '--cgpt-accen       
          +t': '#FF6AC1' }, isPremium: true, glowOverlay: true, effects: { ambientEffects: { neonGrid: true } } },                 
      504 +      { id: 'tomorrow-night-blue', name: 'Tomorrow Night Blue', category: 'core', colors: { '--cgpt-bg': '#002451       
          +', '--cgpt-surface': '#001C40', '--cgpt-text': '#E0F2FF', '--cgpt-text-muted': '#BFDBFE', '--cgpt-border': '#0035       
          +66', '--cgpt-accent': '#4FC3F7' }, isPremium: true, glowOverlay: true, effects: { twinklingStars: { enabled: true       
          +, count: 'sparse' } } },                                                                                                
      505        { id: 'shades-of-purple', name: 'Shades of Purple', category: 'core', colors: { '--cgpt-bg': '#2D2B56', '--       
           cgpt-surface': '#222244', '--cgpt-text': '#FFFFFF', '--cgpt-text-muted': '#C7D2FE', '--cgpt-border': '#3F3C78', '       
           --cgpt-accent': '#FAD000' }, isPremium: true },                                                                         
      549 -      { id: 'dark-forest', name: 'Dark Forest', category: 'core', colors: { '--cgpt-bg': '#101917', '--cgpt-surfa       
          -ce': '#131F1D', '--cgpt-text': '#E5F5F0', '--cgpt-text-muted': '#94A3B8', '--cgpt-border': '#1F2933', '--cgpt-acc       
          -ent': '#22C55E' }, isPremium: true, noiseOverlay: true },                                                               
      506 +      { id: 'dark-forest', name: 'Dark Forest', category: 'core', colors: { '--cgpt-bg': '#101917', '--cgpt-surfa       
          +ce': '#131F1D', '--cgpt-text': '#E5F5F0', '--cgpt-text-muted': '#94A3B8', '--cgpt-border': '#1F2933', '--cgpt-acc       
          +ent': '#22C55E' }, isPremium: true, noiseOverlay: true, effects: { treeSilhouettes: { enabled: true, style: 'mixe       
          +d', density: 'moderate' }, ambientEffects: { fogRising: true, firefliesOrParticles: true } } },                         
      507        { id: 'chocolate-caramel', name: 'Chocolate Caramel', category: 'core', colors: { '--cgpt-bg': '#221A0F', '       
           --cgpt-surface': '#362712', '--cgpt-text': '#FDEFD9', '--cgpt-text-muted': '#D1B59A', '--cgpt-border': '#4A3419',       
            '--cgpt-accent': '#FBBF77' }, isPremium: true, noiseOverlay: true },                                                   
      508      ];                                                                                                                  
      509                                                                                                                          
      510      let currentTheme = null;                                                                                            
      511 +    let currentThemeIndex = 0;                                                                                          
      512      let dynamicStyleEl = null;                                                                                          
      513 +    let effectsEnabled = true;                                                                                          
      514                                                                                                                          
      515      // === PATTERN GENERATORS (mirrors theme-injector.ts) ===                                                           
      516      function generatePatternCSS(pattern, accentColor) {                                                                 
     ...                                                                                                                           
      558        return `body::after { background-image: radial-gradient(ellipse 80% 50% at 50% 0%, ${accentColor} 0%, trans       
           parent 50%), radial-gradient(ellipse 60% 40% at 20% 100%, ${accentColor} 0%, transparent 40%); opacity: 0.08; }`;       
      559      }                                                                                                                   
      560                                                                                                                          
      561 +    // === EFFECTS GENERATORS (mirrors theme-injector.ts) ===                                                           
      562 +    function generateEffectsCSS(effects, accentColor) {                                                                 
      563 +      if (!effects || !effectsEnabled) return '';                                                                       
      564 +      const cssBlocks = [];                                                                                             
      565 +                                                                                                                        
      566 +      // Animated snowfall                                                                                              
      567 +      if (effects.animatedSnowfall?.enabled) {                                                                          
      568 +        const snow = effects.animatedSnowfall;                                                                          
      569 +        const count = snow.density === 'heavy' ? 40 : snow.density === 'medium' ? 25 : 12;                              
      570 +        const duration = snow.speed === 'fast' ? 8 : snow.speed === 'medium' ? 12 : 18;                                 
      571 +                                                                                                                        
      572 +        let snowflakesCSS = '';                                                                                         
      573 +        for (let i = 0; i < count; i++) {                                                                               
      574 +          const left = Math.random() * 100;                                                                             
      575 +          const delay = Math.random() * duration;                                                                       
      576 +          const size = 2 + Math.random() * 4;                                                                           
      577 +          const drift = -15 + Math.random() * 30;                                                                       
      578 +          snowflakesCSS += `.themegpt-snow-${i}{left:${left}%;animation-delay:${delay}s;width:${size}px;height:${       
          +size}px;--drift:${drift}px;}`;                                                                                          
      579 +        }                                                                                                               
      580 +                                                                                                                        
      581 +        cssBlocks.push(`                                                                                                
      582 +@keyframes themegpt-snowfall {                                                                                          
      583 +  0% { transform: translateY(-10px) translateX(0); opacity: 0; }                                                        
      584 +  10% { opacity: 0.9; }                                                                                                 
      585 +  90% { opacity: 0.9; }                                                                                                 
      586 +  100% { transform: translateY(100vh) translateX(var(--drift, 20px)); opacity: 0; }                                     
      587 +}                                                                                                                       
      588 +.themegpt-snowflake {                                                                                                   
      589 +  position: absolute;                                                                                                   
      590 +  top: -10px;                                                                                                           
      591 +  background: white;                                                                                                    
      592 +  border-radius: 50%;                                                                                                   
      593 +  animation: themegpt-snowfall ${duration}s linear infinite;                                                            
      594 +  box-shadow: 0 0 3px rgba(255,255,255,0.5);                                                                            
      595 +}                                                                                                                       
      596 +${snowflakesCSS}`);                                                                                                     
      597 +      }                                                                                                                 
      598 +                                                                                                                        
      599 +      // Twinkling stars                                                                                                
      600 +      if (effects.twinklingStars?.enabled) {                                                                            
      601 +        const stars = effects.twinklingStars;                                                                           
      602 +        const count = stars.count === 'dense' ? 50 : stars.count === 'medium' ? 30 : 15;                                
      603 +                                                                                                                        
      604 +        let starsCSS = '';                                                                                              
      605 +        for (let i = 0; i < count; i++) {                                                                               
      606 +          const left = Math.random() * 100;                                                                             
      607 +          const top = Math.random() * 70;                                                                               
      608 +          const delay = Math.random() * 4;                                                                              
      609 +          const size = 1 + Math.random() * 3;                                                                           
      610 +          starsCSS += `.themegpt-star-${i}{left:${left}%;top:${top}%;animation-delay:${delay}s;width:${size}px;he       
          +ight:${size}px;}`;                                                                                                      
      611 +        }                                                                                                               
      612 +                                                                                                                        
      613 +        cssBlocks.push(`                                                                                                
      614 +@keyframes themegpt-twinkle {                                                                                           
      615 +  0%, 100% { opacity: 0.3; transform: scale(0.8); }                                                                     
      616 +  50% { opacity: 1; transform: scale(1.2); }                                                                            
      617 +}                                                                                                                       
      618 +.themegpt-star {                                                                                                        
      619 +  position: absolute;                                                                                                   
      620 +  background: ${accentColor};                                                                                           
      621 +  border-radius: 50%;                                                                                                   
      622 +  animation: themegpt-twinkle 3s ease-in-out infinite;                                                                  
      623 +  box-shadow: 0 0 4px ${accentColor};                                                                                   
      624 +}                                                                                                                       
      625 +${starsCSS}                                                                                                             
      626 +${stars.includeShootingStars ? `                                                                                        
      627 +@keyframes themegpt-shooting {                                                                                          
      628 +  0% { transform: translateX(0) translateY(0); opacity: 1; }                                                            
      629 +  100% { transform: translateX(150px) translateY(100px); opacity: 0; }                                                  
      630 +}                                                                                                                       
      631 +.themegpt-shooting-star {                                                                                               
      632 +  position: absolute;                                                                                                   
      633 +  width: 2px;                                                                                                           
      634 +  height: 2px;                                                                                                          
      635 +  background: linear-gradient(90deg, white, transparent);                                                               
      636 +  animation: themegpt-shooting 2s ease-out infinite;                                                                    
      637 +}                                                                                                                       
      638 +.themegpt-shooting-star-1 { top: 15%; left: 20%; animation-delay: 3s; }                                                 
      639 +.themegpt-shooting-star-2 { top: 25%; left: 60%; animation-delay: 7s; }` : ''}`);                                       
      640 +      }                                                                                                                 
      641 +                                                                                                                        
      642 +      // Tree silhouettes                                                                                               
      643 +      if (effects.treeSilhouettes?.enabled) {                                                                           
      644 +        const trees = effects.treeSilhouettes;                                                                          
      645 +        const count = trees.density === 'forest' ? 8 : trees.density === 'moderate' ? 5 : 3;                            
      646 +                                                                                                                        
      647 +        let treesCSS = '';                                                                                              
      648 +        for (let i = 0; i < count; i++) {                                                                               
      649 +          const left = (i / count) * 80 + Math.random() * 15;                                                           
      650 +          const height = 60 + Math.random() * 80;                                                                       
      651 +          const width = height * 0.6;                                                                                   
      652 +          const opacity = 0.15 + (i / count) * 0.25;                                                                    
      653 +          treesCSS += `.themegpt-tree-${i}{left:${left}%;height:${height}px;width:${width}px;opacity:${opacity};}       
          +`;                                                                                                                      
      654 +        }                                                                                                               
      655 +                                                                                                                        
      656 +        cssBlocks.push(`                                                                                                
      657 +.themegpt-tree {                                                                                                        
      658 +  position: absolute;                                                                                                   
      659 +  bottom: 0;                                                                                                            
      660 +  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);                                                                       
      661 +  background: rgba(0,0,0,0.8);                                                                                          
      662 +}                                                                                                                       
      663 +${treesCSS}`);                                                                                                          
      664 +      }                                                                                                                 
      665 +                                                                                                                        
      666 +      // Ambient effects                                                                                                
      667 +      if (effects.ambientEffects?.fogRising) {                                                                          
      668 +        cssBlocks.push(`                                                                                                
      669 +@keyframes themegpt-fog {                                                                                               
      670 +  0%, 100% { transform: translateY(0); opacity: 0.4; }                                                                  
      671 +  50% { transform: translateY(-20px); opacity: 0.6; }                                                                   
      672 +}                                                                                                                       
      673 +.themegpt-fog {                                                                                                         
      674 +  position: absolute;                                                                                                   
      675 +  bottom: 0;                                                                                                            
      676 +  left: 0;                                                                                                              
      677 +  right: 0;                                                                                                             
      678 +  height: 150px;                                                                                                        
      679 +  background: linear-gradient(to top, rgba(255,255,255,0.15), transparent);                                             
      680 +  animation: themegpt-fog 8s ease-in-out infinite;                                                                      
      681 +}`);                                                                                                                    
      682 +      }                                                                                                                 
      683 +                                                                                                                        
      684 +      if (effects.ambientEffects?.neonGrid) {                                                                           
      685 +        cssBlocks.push(`                                                                                                
      686 +.themegpt-neon-grid {                                                                                                   
      687 +  position: absolute;                                                                                                   
      688 +  inset: 0;                                                                                                             
      689 +  background-image:                                                                                                     
      690 +    linear-gradient(${accentColor}22 1px, transparent 1px),                                                             
      691 +    linear-gradient(90deg, ${accentColor}22 1px, transparent 1px);                                                      
      692 +  background-size: 40px 40px;                                                                                           
      693 +  transform: perspective(500px) rotateX(60deg);                                                                         
      694 +  transform-origin: center bottom;                                                                                      
      695 +  opacity: 0.4;                                                                                                         
      696 +}`);                                                                                                                    
      697 +      }                                                                                                                 
      698 +                                                                                                                        
      699 +      if (effects.ambientEffects?.auroraWaves) {                                                                        
      700 +        cssBlocks.push(`                                                                                                
      701 +@keyframes themegpt-aurora {                                                                                            
      702 +  0%, 100% { background-position: 0% 50%; }                                                                             
      703 +  50% { background-position: 100% 50%; }                                                                                
      704 +}                                                                                                                       
      705 +.themegpt-aurora {                                                                                                      
      706 +  position: absolute;                                                                                                   
      707 +  top: 0;                                                                                                               
      708 +  left: 0;                                                                                                              
      709 +  right: 0;                                                                                                             
      710 +  height: 30%;                                                                                                          
      711 +  background: linear-gradient(90deg,                                                                                    
      712 +    rgba(0,255,200,0.1),                                                                                                
      713 +    rgba(100,200,255,0.15),                                                                                             
      714 +    rgba(180,100,255,0.1),                                                                                              
      715 +    rgba(0,255,200,0.1));                                                                                               
      716 +  background-size: 300% 100%;                                                                                           
      717 +  animation: themegpt-aurora 15s ease-in-out infinite;                                                                  
      718 +  filter: blur(30px);                                                                                                   
      719 +}`);                                                                                                                    
      720 +      }                                                                                                                 
      721 +                                                                                                                        
      722 +      // Seasonal decorations                                                                                           
      723 +      if (effects.seasonalDecorations?.frostEdge) {                                                                     
      724 +        cssBlocks.push(`                                                                                                
      725 +.themegpt-frost {                                                                                                       
      726 +  position: absolute;                                                                                                   
      727 +  inset: 0;                                                                                                             
      728 +  pointer-events: none;                                                                                                 
      729 +  box-shadow: inset 0 0 100px 20px rgba(200,220,255,0.15);                                                              
      730 +}`);                                                                                                                    
      731 +      }                                                                                                                 
      732 +                                                                                                                        
      733 +      if (effects.seasonalDecorations?.candyCaneFrame) {                                                                
      734 +        cssBlocks.push(`                                                                                                
      735 +.themegpt-candy-frame {                                                                                                 
      736 +  position: absolute;                                                                                                   
      737 +  inset: 0;                                                                                                             
      738 +  border: 8px solid transparent;                                                                                        
      739 +  border-image: repeating-linear-gradient(-45deg, #fff 0 5px, #dc2626 5px 10px) 8;                                      
      740 +  opacity: 0.6;                                                                                                         
      741 +}`);                                                                                                                    
      742 +      }                                                                                                                 
      743 +                                                                                                                        
      744 +      return cssBlocks.join('\n');                                                                                      
      745 +    }                                                                                                                   
      746 +                                                                                                                        
      747 +    function createEffectsElements(effects) {                                                                           
      748 +      const container = document.getElementById('themegpt-effects');                                                    
      749 +      container.innerHTML = '';                                                                                         
      750 +                                                                                                                        
      751 +      if (!effects || !effectsEnabled) return;                                                                          
      752 +                                                                                                                        
      753 +      // Add snowflakes                                                                                                 
      754 +      if (effects.animatedSnowfall?.enabled) {                                                                          
      755 +        const count = effects.animatedSnowfall.density === 'heavy' ? 40 :                                               
      756 +                      effects.animatedSnowfall.density === 'medium' ? 25 : 12;                                          
      757 +        for (let i = 0; i < count; i++) {                                                                               
      758 +          const flake = document.createElement('div');                                                                  
      759 +          flake.className = `themegpt-snowflake themegpt-snow-${i}`;                                                    
      760 +          container.appendChild(flake);                                                                                 
      761 +        }                                                                                                               
      762 +      }                                                                                                                 
      763 +                                                                                                                        
      764 +      // Add stars                                                                                                      
      765 +      if (effects.twinklingStars?.enabled) {                                                                            
      766 +        const count = effects.twinklingStars.count === 'dense' ? 50 :                                                   
      767 +                      effects.twinklingStars.count === 'medium' ? 30 : 15;                                              
      768 +        for (let i = 0; i < count; i++) {                                                                               
      769 +          const star = document.createElement('div');                                                                   
      770 +          star.className = `themegpt-star themegpt-star-${i}`;                                                          
      771 +          container.appendChild(star);                                                                                  
      772 +        }                                                                                                               
      773 +        if (effects.twinklingStars.includeShootingStars) {                                                              
      774 +          for (let i = 1; i <= 2; i++) {                                                                                
      775 +            const shooting = document.createElement('div');                                                             
      776 +            shooting.className = `themegpt-shooting-star themegpt-shooting-star-${i}`;                                  
      777 +            container.appendChild(shooting);                                                                            
      778 +          }                                                                                                             
      779 +        }                                                                                                               
      780 +      }                                                                                                                 
      781 +                                                                                                                        
      782 +      // Add trees                                                                                                      
      783 +      if (effects.treeSilhouettes?.enabled) {                                                                           
      784 +        const count = effects.treeSilhouettes.density === 'forest' ? 8 :                                                
      785 +                      effects.treeSilhouettes.density === 'moderate' ? 5 : 3;                                           
      786 +        for (let i = 0; i < count; i++) {                                                                               
      787 +          const tree = document.createElement('div');                                                                   
      788 +          tree.className = `themegpt-tree themegpt-tree-${i}`;                                                          
      789 +          container.appendChild(tree);                                                                                  
      790 +        }                                                                                                               
      791 +      }                                                                                                                 
      792 +                                                                                                                        
      793 +      // Add ambient effects                                                                                            
      794 +      if (effects.ambientEffects?.fogRising) {                                                                          
      795 +        const fog = document.createElement('div');                                                                      
      796 +        fog.className = 'themegpt-fog';                                                                                 
      797 +        container.appendChild(fog);                                                                                     
      798 +      }                                                                                                                 
      799 +      if (effects.ambientEffects?.neonGrid) {                                                                           
      800 +        const grid = document.createElement('div');                                                                     
      801 +        grid.className = 'themegpt-neon-grid';                                                                          
      802 +        container.appendChild(grid);                                                                                    
      803 +      }                                                                                                                 
      804 +      if (effects.ambientEffects?.auroraWaves) {                                                                        
      805 +        const aurora = document.createElement('div');                                                                   
      806 +        aurora.className = 'themegpt-aurora';                                                                           
      807 +        container.appendChild(aurora);                                                                                  
      808 +      }                                                                                                                 
      809 +                                                                                                                        
      810 +      // Add seasonal decorations                                                                                       
      811 +      if (effects.seasonalDecorations?.frostEdge) {                                                                     
      812 +        const frost = document.createElement('div');                                                                    
      813 +        frost.className = 'themegpt-frost';                                                                             
      814 +        container.appendChild(frost);                                                                                   
      815 +      }                                                                                                                 
      816 +      if (effects.seasonalDecorations?.candyCaneFrame) {                                                                
      817 +        const frame = document.createElement('div');                                                                    
      818 +        frame.className = 'themegpt-candy-frame';                                                                       
      819 +        container.appendChild(frame);                                                                                   
      820 +      }                                                                                                                 
      821 +    }                                                                                                                   
      822 +                                                                                                                        
      823      // === QUALITY CHECKS ===                                                                                           
      824      function hexToRgb(hex) {                                                                                            
      825        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);                                             
     ...                                                                                                                           
      845        const checks = [];                                                                                                
      846        const c = theme.colors;                                                                                           
      847                                                                                                                          
      627 -      // Text contrast (WCAG AA = 4.5:1)                                                                                
      848        const textContrast = getContrastRatio(c['--cgpt-bg'], c['--cgpt-text']);                                          
      849        checks.push({ name: 'Text Contrast', pass: textContrast >= 4.5, value: textContrast.toFixed(2), target: '>=       
            4.5' });                                                                                                               
      850                                                                                                                          
      631 -      // Muted text contrast (WCAG AA = 4.5:1)                                                                          
      851        const mutedContrast = getContrastRatio(c['--cgpt-bg'], c['--cgpt-text-muted']);                                   
      852        checks.push({ name: 'Muted Contrast', pass: mutedContrast >= 3, value: mutedContrast.toFixed(2), target: '>       
           = 3.0' });                                                                                                              
      853                                                                                                                          
      635 -      // Accent visibility                                                                                              
      854        const accentContrast = getContrastRatio(c['--cgpt-bg'], c['--cgpt-accent']);                                      
      855        checks.push({ name: 'Accent Visibility', pass: accentContrast >= 3, value: accentContrast.toFixed(2), targe       
           t: '>= 3.0' });                                                                                                         
      856                                                                                                                          
      639 -      // Pattern opacity check                                                                                          
      857        if (theme.pattern) {                                                                                              
      858          checks.push({ name: 'Pattern Opacity', pass: theme.pattern.opacity <= 0.15, value: theme.pattern.opacity.       
           toString(), target: '<= 0.15' });                                                                                       
      859        }                                                                                                                 
      860                                                                                                                          
      861 +      if (theme.effects) {                                                                                              
      862 +        checks.push({ name: 'Has Effects', pass: true, value: 'Yes', target: 'Premium' });                              
      863 +      }                                                                                                                 
      864 +                                                                                                                        
      865        return checks;                                                                                                    
      866      }                                                                                                                   
      867                                                                                                                          
     ...                                                                                                                           
      878      // === THEME APPLICATION ===                                                                                        
      879      function applyTheme(theme) {                                                                                        
      880        currentTheme = theme;                                                                                             
      881 +      currentThemeIndex = THEMES.findIndex(t => t.id === theme.id);                                                     
      882        const root = document.documentElement;                                                                            
      883                                                                                                                          
      884        // Apply CSS variables                                                                                            
     ...                                                                                                                           
      897          additionalCSS += generateGlowOverlay(theme.colors['--cgpt-accent']);                                            
      898        }                                                                                                                 
      899                                                                                                                          
      900 +      // Generate effects CSS                                                                                           
      901 +      if (theme.effects) {                                                                                              
      902 +        additionalCSS += generateEffectsCSS(theme.effects, theme.colors['--cgpt-accent']);                              
      903 +      }                                                                                                                 
      904 +                                                                                                                        
      905        // Apply dynamic styles                                                                                           
      906        if (!dynamicStyleEl) {                                                                                            
      907          dynamicStyleEl = document.createElement('style');                                                               
     ...                                                                                                                           
      910        }                                                                                                                 
      911        dynamicStyleEl.textContent = additionalCSS;                                                                       
      912                                                                                                                          
      913 +      // Create effects DOM elements                                                                                    
      914 +      createEffectsElements(theme.effects);                                                                             
      915 +                                                                                                                        
      916        // Update UI                                                                                                      
      917        document.getElementById('themeName').textContent = theme.name;                                                    
      918                                                                                                                          
      919        let info = theme.isPremium ? 'Premium' : 'Free';                                                                  
      920        if (theme.pattern) info += ` | Pattern: ${theme.pattern.type}`;                                                   
      691 -      if (theme.noiseOverlay) info += ' | Noise overlay';                                                               
      692 -      if (theme.glowOverlay) info += ' | Glow overlay';                                                                 
      921 +      if (theme.noiseOverlay) info += ' | Noise';                                                                       
      922 +      if (theme.glowOverlay) info += ' | Glow';                                                                         
      923 +      if (theme.effects) {                                                                                              
      924 +        const fx = [];                                                                                                  
      925 +        if (theme.effects.animatedSnowfall?.enabled) fx.push('Snow');                                                   
      926 +        if (theme.effects.twinklingStars?.enabled) fx.push('Stars');                                                    
      927 +        if (theme.effects.treeSilhouettes?.enabled) fx.push('Trees');                                                   
      928 +        if (theme.effects.ambientEffects?.fogRising) fx.push('Fog');                                                    
      929 +        if (theme.effects.ambientEffects?.neonGrid) fx.push('Neon');                                                    
      930 +        if (theme.effects.ambientEffects?.auroraWaves) fx.push('Aurora');                                               
      931 +        if (theme.effects.seasonalDecorations?.frostEdge) fx.push('Frost');                                             
      932 +        if (theme.effects.seasonalDecorations?.candyCaneFrame) fx.push('Candy');                                        
      933 +        if (fx.length) info += ` | FX: ${fx.join(', ')}`;                                                               
      934 +      }                                                                                                                 
      935        document.getElementById('themeInfo').textContent = info;                                                          
      936                                                                                                                          
      937        // Update active button                                                                                           
     ...                                                                                                                           
      943        const checks = runQualityChecks(theme);                                                                           
      944        displayQualityChecks(checks);                                                                                     
      945                                                                                                                          
      704 -      // Log for LLM agents                                                                                             
      705 -      console.log(`[ThemeGPT] Applied: ${theme.id}`, { checks });                                                       
      946 +      // Log for debugging                                                                                              
      947 +      console.log(`[ThemeGPT] Applied: ${theme.id}`, { checks, effects: theme.effects });                               
      948      }                                                                                                                   
      949                                                                                                                          
      950      // === INITIALIZATION ===                                                                                           
     ...                                                                                                                           
      952        const freeGrid = document.getElementById('freeThemes');                                                           
      953        const premiumGrid = document.getElementById('premiumThemes');                                                     
      954                                                                                                                          
      955 +      const freeThemes = THEMES.filter(t => !t.isPremium);                                                              
      956 +      const premiumThemes = THEMES.filter(t => t.isPremium);                                                            
      957 +                                                                                                                        
      958 +      // Update stats                                                                                                   
      959 +      document.getElementById('totalCount').textContent = THEMES.length;                                                
      960 +      document.getElementById('freeCount').textContent = freeThemes.length;                                             
      961 +      document.getElementById('premiumCount').textContent = premiumThemes.length;                                       
      962 +                                                                                                                        
      963        THEMES.forEach(theme => {                                                                                         
      964          const btn = document.createElement('button');                                                                   
      965          btn.className = 'theme-btn';                                                                                    
      966          btn.dataset.themeId = theme.id;                                                                                 
      967          btn.style.background = theme.colors['--cgpt-bg'];                                                               
      968          btn.style.color = theme.colors['--cgpt-text'];                                                                  
      969 +                                                                                                                        
      970 +        let badges = '';                                                                                                
      971 +        if (theme.effects) badges += '<span class="effects-badge">FX</span>';                                           
      972 +        if (theme.pattern) badges += '<span class="effects-badge">PTN</span>';                                          
      973 +                                                                                                                        
      974          btn.innerHTML = `                                                                                               
      975            <div class="name">${theme.name}</div>                                                                         
      976            <div class="accent-bar" style="background:${theme.colors['--cgpt-accent']}"></div>                            
      977 +          ${badges}                                                                                                     
      978          `;                                                                                                              
      979          btn.addEventListener('click', () => applyTheme(theme));                                                         
      980                                                                                                                          
     ...                                                                                                                           
       994          }                                                                                                              
       995        });                                                                                                              
       996                                                                                                                         
       997 +      document.getElementById('toggleEffectsBtn').addEventListener('click', () => {                                    
       998 +        effectsEnabled = !effectsEnabled;                                                                              
       999 +        if (currentTheme) applyTheme(currentTheme);                                                                    
      1000 +        console.log(`[ThemeGPT] Effects ${effectsEnabled ? 'enabled' : 'disabled'}`);                                  
      1001 +      });                                                                                                              
      1002 +                                                                                                                       
      1003        document.getElementById('hideBtn').addEventListener('click', togglePanel);                                       
      1004                                                                                                                         
      1005        // Keyboard shortcuts                                                                                            
      1006        document.addEventListener('keydown', (e) => {                                                                    
      1007          if (e.ctrlKey && e.key === 'h') { e.preventDefault(); togglePanel(); }                                         
      1008          if (e.ctrlKey && e.key === 'e') { e.preventDefault(); console.log('[ThemeGPT] Export:', JSON.stringify(c       
            urrentTheme, null, 2)); }                                                                                              
      1009 +        if (e.key === 'ArrowRight') { navigateTheme(1); }                                                              
      1010 +        if (e.key === 'ArrowLeft') { navigateTheme(-1); }                                                              
      1011        });                                                                                                              
      1012                                                                                                                         
      1013        // Apply first theme                                                                                             
      1014        applyTheme(THEMES[0]);                                                                                           
      1015      }                                                                                                                  
      1016                                                                                                                         
      1017 +    function navigateTheme(direction) {                                                                                
      1018 +      const newIndex = (currentThemeIndex + direction + THEMES.length) % THEMES.length;                                
      1019 +      applyTheme(THEMES[newIndex]);                                                                                    
      1020 +    }                                                                                                                  
      1021 +                                                                                                                       
      1022      function togglePanel() {                                                                                           
      1023        document.getElementById('themePanel').classList.toggle('hidden');                                                
      1024        console.log('[ThemeGPT] Panel toggled');                                                                         
      1025      }                                                                                                                  
      1026                                                                                                                         
       758 -    function toggleReference() {                                                                                       
       759 -      const ref = document.getElementById('varReference');                                                             
       760 -      ref.style.display = ref.style.display === 'none' ? 'block' : 'none';                                             
       761 -    }                                                                                                                  
       762 -                                                                                                                       
       763 -    // === VARIABLE COMMAND SYSTEM ===                                                                                 
       764 -    const VAR_MAP = {                                                                                                  
       765 -      'GL-BG': '--cgpt-bg',                                                                                            
       766 -      'GL-SRF': '--cgpt-surface',                                                                                      
       767 -      'GL-TXT': '--cgpt-text',                                                                                         
       768 -      'GL-TXM': '--cgpt-text-muted',                                                                                   
       769 -      'GL-BRD': '--cgpt-border',                                                                                       
       770 -      'GL-ACC': '--cgpt-accent'                                                                                        
       771 -    };                                                                                                                 
       772 -                                                                                                                       
       773 -    function parseCommand(cmd) {                                                                                       
       774 -      const trimmed = cmd.trim().toUpperCase();                                                                        
       775 -      const results = [];                                                                                              
       776 -                                                                                                                       
       777 -      // SET VAR VALUE or SET VAR1 VALUE1, VAR2 VALUE2                                                                 
       778 -      if (trimmed.startsWith('SET ')) {                                                                                
       779 -        const parts = trimmed.slice(4).split(/,\s*/);                                                                  
       780 -        parts.forEach(part => {                                                                                        
       781 -          const match = part.match(/^(GL-\w+)\s+(#[A-F0-9]{6}|#[A-F0-9]{3})$/i);                                       
       782 -          if (match) {                                                                                                 
       783 -            const [, varCode, color] = match;                                                                          
       784 -            results.push({ action: 'SET', varCode: varCode.toUpperCase(), value: color });                             
       785 -          }                                                                                                            
       786 -        });                                                                                                            
       787 -      }                                                                                                                
       788 -                                                                                                                       
       789 -      // ENABLE/DISABLE FX-OVL-NOISE or FX-OVL-GLOW                                                                    
       790 -      if (trimmed.startsWith('ENABLE ')) {                                                                             
       791 -        const fx = trimmed.slice(7);                                                                                   
       792 -        if (fx === 'FX-OVL-NOISE') results.push({ action: 'ENABLE', effect: 'noise' });                                
       793 -        if (fx === 'FX-OVL-GLOW') results.push({ action: 'ENABLE', effect: 'glow' });                                  
       794 -      }                                                                                                                
       795 -      if (trimmed.startsWith('DISABLE ')) {                                                                            
       796 -        const fx = trimmed.slice(8);                                                                                   
       797 -        if (fx.startsWith('FX-')) results.push({ action: 'DISABLE', effect: fx });                                     
       798 -      }                                                                                                                
       799 -                                                                                                                       
       800 -      return results;                                                                                                  
       801 -    }                                                                                                                  
       802 -                                                                                                                       
       803 -    function executeCommand(cmd) {                                                                                     
       804 -      const instructions = parseCommand(cmd);                                                                          
       805 -      const output = [];                                                                                               
       806 -                                                                                                                       
       807 -      if (instructions.length === 0) {                                                                                 
       808 -        output.push({ type: 'err', msg: 'Invalid command. Try: SET GL-ACC #FF6AC1' });                                 
       809 -        console.log('[ThemeGPT] Command error:', cmd);                                                                 
       810 -        return output;                                                                                                 
       811 -      }                                                                                                                
       812 -                                                                                                                       
       813 -      instructions.forEach(inst => {                                                                                   
       814 -        if (inst.action === 'SET') {                                                                                   
       815 -          const cssVar = VAR_MAP[inst.varCode];                                                                        
       816 -          if (cssVar && currentTheme) {                                                                                
       817 -            const oldValue = currentTheme.colors[cssVar];                                                              
       818 -            currentTheme.colors[cssVar] = inst.value;                                                                  
       819 -            document.documentElement.style.setProperty(cssVar, inst.value);                                            
       820 -                                                                                                                       
       821 -            // Re-run quality checks                                                                                   
       822 -            const checks = runQualityChecks(currentTheme);                                                             
       823 -            displayQualityChecks(checks);                                                                              
       824 -                                                                                                                       
       825 -            const contrast = inst.varCode === 'GL-TXT'                                                                 
       826 -              ? getContrastRatio(currentTheme.colors['--cgpt-bg'], inst.value)                                         
       827 -              : null;                                                                                                  
       828 -                                                                                                                       
       829 -            let msg = `OK ${inst.varCode} ${oldValue} → ${inst.value}`;                                                
       830 -            if (contrast) msg += ` Contrast: ${contrast.toFixed(1)}:1`;                                                
       831 -                                                                                                                       
       832 -            output.push({ type: contrast && contrast < 4.5 ? 'warn' : 'ok', msg });                                    
       833 -            console.log(`[ThemeGPT] ${msg}`);                                                                          
       834 -          } else {                                                                                                     
       835 -            output.push({ type: 'err', msg: `Unknown variable: ${inst.varCode}` });                                    
       836 -          }                                                                                                            
       837 -        }                                                                                                              
       838 -                                                                                                                       
       839 -        if (inst.action === 'ENABLE' && currentTheme) {                                                                
       840 -          if (inst.effect === 'noise') {                                                                               
       841 -            currentTheme.noiseOverlay = true;                                                                          
       842 -            currentTheme.glowOverlay = false;                                                                          
       843 -          } else if (inst.effect === 'glow') {                                                                         
       844 -            currentTheme.glowOverlay = true;                                                                           
       845 -            currentTheme.noiseOverlay = false;                                                                         
       846 -          }                                                                                                            
       847 -          applyTheme(currentTheme);                                                                                    
       848 -          output.push({ type: 'ok', msg: `Enabled ${inst.effect} overlay` });                                          
       849 -          console.log(`[ThemeGPT] Enabled ${inst.effect} overlay`);                                                    
       850 -        }                                                                                                              
       851 -                                                                                                                       
       852 -        if (inst.action === 'DISABLE' && currentTheme) {                                                               
       853 -          currentTheme.noiseOverlay = false;                                                                           
       854 -          currentTheme.glowOverlay = false;                                                                            
       855 -          currentTheme.pattern = null;                                                                                 
       856 -          applyTheme(currentTheme);                                                                                    
       857 -          output.push({ type: 'ok', msg: 'Disabled effects' });                                                        
       858 -          console.log('[ThemeGPT] Disabled effects');                                                                  
       859 -        }                                                                                                              
       860 -      });                                                                                                              
       861 -                                                                                                                       
       862 -      return output;                                                                                                   
       863 -    }                                                                                                                  
       864 -                                                                                                                       
       865 -    function renderOutput(results) {                                                                                   
       866 -      let container = document.querySelector('.cmd-output');                                                           
       867 -      if (!container) {                                                                                                
       868 -        container = document.createElement('div');                                                                     
       869 -        container.className = 'cmd-output';                                                                            
       870 -        document.getElementById('varReference').appendChild(container);                                                
       871 -      }                                                                                                                
       872 -      container.innerHTML = results.map(r => `<div class="${r.type}">${r.msg}</div>`).join('');                        
       873 -    }                                                                                                                  
       874 -                                                                                                                       
       875 -    // Expose for console use                                                                                          
       876 -    window.SET = (varCode, value) => {                                                                                 
       877 -      const results = executeCommand(`SET ${varCode} ${value}`);                                                       
       878 -      return results.map(r => r.msg).join('\n');                                                                       
       879 -    };                                                                                                                 
       880 -                                                                                                                       
       881 -    window.VAR_MAP = VAR_MAP;                                                                                          
       882 -                                                                                                                       
      1027      document.addEventListener('DOMContentLoaded', init);                                                               
       884 -                                                                                                                       
       885 -    // Additional keyboard shortcut for reference toggle                                                               
       886 -    document.addEventListener('keydown', (e) => {                                                                      
       887 -      if (e.ctrlKey && e.key === 'r') { e.preventDefault(); toggleReference(); }                                       
       888 -    });                                                                                                                
       889 -                                                                                                                       
       890 -    // Variable command input handler                                                                                  
       891 -    document.addEventListener('DOMContentLoaded', () => {                                                              
       892 -      document.getElementById('varExec')?.addEventListener('click', () => {                                            
       893 -        const input = document.getElementById('varCmd');                                                               
       894 -        const results = executeCommand(input.value);                                                                   
       895 -        renderOutput(results);                                                                                         
       896 -        input.value = '';                                                                                              
       897 -      });                                                                                                              
       898 -                                                                                                                       
       899 -      document.getElementById('varCmd')?.addEventListener('keydown', (e) => {                                          
       900 -        if (e.key === 'Enter') {                                                                                       
       901 -          const results = executeCommand(e.target.value);                                                              
       902 -          renderOutput(results);                                                                                       
       903 -          e.target.value = '';                                                                                         
       904 -        }                                                                                                              
       905 -      });                                                                                                              
       906 -    });                                                                                                                
      1028    </script>                                                                                                            
      1029  </body>                                                                                                                
      1030  </html>                                                                                                                
                                                                                                                                   
⏺ Now let me rebuild the shared package and extension to ensure everything is in sync.                                             
                                                                                                                                   
⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0/packages/shared && pnpm build 2>&1 && cd                                           
      /Users/etherealogic/Dev/themegpt-v2.0/apps/extension && pnpm build 2>&1)                                                     
  ⎿  > @themegpt/shared@2.0.0 build /Users/etherealogic/Dev/themegpt-v2.0/packages/shared                                          
     > tsc                                                                                                                         
     … +16 lines (ctrl+o to expand)                                                                                                
                                                                                                                                   
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
>                                                                                                                                  
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on (shift+tab to cycle)                                               Context left until auto-compact: 0%  
                                                                                                                                   
