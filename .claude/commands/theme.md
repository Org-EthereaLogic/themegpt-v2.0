# Theme Design Command

Create or modify a ThemeGPT theme based on the user's description.

## Instructions

Use the Task tool with `subagent_type: theme-designer` to handle this request. The theme-designer agent has access to the ThemeGPT browser API and can:

1. Open the theme preview tool at http://localhost:8889/index.html (or 8890)
2. Create themes from natural language descriptions
3. Modify existing themes with granular color controls
4. Validate WCAG accessibility requirements
5. Export theme JSON for integration

Pass the user's complete request to the agent. If no specific request is provided, ask the user what kind of theme they'd like to create.

## Example Invocations

- `/theme cyberpunk with neon pink accents`
- `/theme cozy autumn forest vibes`
- `/theme modify the current theme to have a darker background`
- `/theme export the current theme`

$ARGUMENTS
