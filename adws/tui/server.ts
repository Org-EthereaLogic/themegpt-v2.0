/**
 * ADW Workflow Dashboard - Bun-powered TUI Server
 * 
 * READ-ONLY monitoring dashboard for active ADW workflows.
 * Reads state from agents/{adw_id}/adw_state.json files.
 * 
 * NO control plane (start/stop/configure) - monitoring only.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const PORT = 9000;
const PROJECT_ROOT = dirname(dirname(dirname(import.meta.path)));
const AGENTS_DIR = join(PROJECT_ROOT, "agents");

interface WorkflowState {
  adw_id: string;
  issue_number?: string;
  branch_name?: string;
  plan_file?: string;
  issue_class?: string;
  worktree_path?: string;
  backend_port?: number;
  frontend_port?: number;
  model_set?: string;
  all_adws?: string[];
  provider?: string;
  synthesis_enabled?: boolean;
}

interface WorkflowSummary {
  adw_id: string;
  issue_number: string;
  current_phase: string;
  ports: { backend: number; frontend: number };
  provider: string;
  synthesis: boolean;
  phases_completed: number;
  last_updated: string;
}

function getActiveWorkflows(): WorkflowSummary[] {
  const workflows: WorkflowSummary[] = [];

  if (!existsSync(AGENTS_DIR)) {
    return workflows;
  }

  const adwDirs = readdirSync(AGENTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const adwId of adwDirs) {
    const statePath = join(AGENTS_DIR, adwId, "adw_state.json");
    if (!existsSync(statePath)) continue;

    try {
      const stateJson = readFileSync(statePath, "utf-8");
      const state: WorkflowState = JSON.parse(stateJson);
      const stat = Bun.file(statePath);

      workflows.push({
        adw_id: state.adw_id,
        issue_number: state.issue_number || "N/A",
        current_phase: getCurrentPhase(state.all_adws || []),
        ports: {
          backend: state.backend_port || 0,
          frontend: state.frontend_port || 0,
        },
        provider: state.provider || "anthropic",
        synthesis: state.synthesis_enabled || false,
        phases_completed: (state.all_adws || []).length,
        last_updated: new Date().toISOString(),
      });
    } catch (e) {
      console.error(`Failed to read state for ${adwId}: ${e}`);
    }
  }

  return workflows.sort((a, b) => b.adw_id.localeCompare(a.adw_id));
}

function getCurrentPhase(phases: string[]): string {
  if (phases.length === 0) return "init";
  const last = phases[phases.length - 1];
  return last.replace("adw_", "").replace("_iso", "");
}

function renderDashboard(): string {
  const workflows = getActiveWorkflows();
  const now = new Date().toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="5">
  <title>ADW Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0d1117; color: #c9d1d9; padding: 20px; }
    h1 { color: #58a6ff; margin-bottom: 10px; }
    .meta { color: #8b949e; margin-bottom: 20px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #21262d; }
    th { color: #8b949e; font-weight: 600; text-transform: uppercase; font-size: 12px; }
    tr:hover { background: #161b22; }
    .phase { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .phase-plan { background: #388bfd33; color: #58a6ff; }
    .phase-build { background: #a371f733; color: #bc8cff; }
    .phase-test { background: #f7803633; color: #ffa657; }
    .phase-review { background: #3fb95033; color: #56d364; }
    .phase-document { background: #f7803633; color: #ffa657; }
    .phase-ship { background: #3fb95033; color: #56d364; }
    .phase-init { background: #21262d; color: #8b949e; }
    .synthesis { color: #58a6ff; font-weight: 500; }
    .ports { font-family: monospace; font-size: 12px; color: #8b949e; }
    .empty { text-align: center; padding: 40px; color: #8b949e; }
  </style>
</head>
<body>
  <h1>🔄 ADW Workflow Dashboard</h1>
  <p class="meta">Last updated: ${now} • Auto-refreshes every 5s • Port ${PORT}</p>
  ${
    workflows.length === 0
      ? '<div class="empty">No active workflows. Start one with: <code>uv run adw_plan_build.py &lt;issue&gt;</code></div>'
      : `<table>
    <thead>
      <tr>
        <th>ADW ID</th>
        <th>Issue</th>
        <th>Phase</th>
        <th>Ports</th>
        <th>Provider</th>
        <th>Synthesis</th>
        <th>Steps</th>
      </tr>
    </thead>
    <tbody>
      ${workflows
        .map(
          (w) => `<tr>
        <td><code>${w.adw_id}</code></td>
        <td>#${w.issue_number}</td>
        <td><span class="phase phase-${w.current_phase}">${w.current_phase}</span></td>
        <td class="ports">${w.ports.backend}/${w.ports.frontend}</td>
        <td>${w.provider}</td>
        <td class="${w.synthesis ? "synthesis" : ""}">${w.synthesis ? "✓ Enabled" : "—"}</td>
        <td>${w.phases_completed}/6</td>
      </tr>`
        )
        .join("")}
    </tbody>
  </table>`
  }
</body>
</html>`;
}

const server = Bun.serve({
  port: PORT,
  routes: {
    "/": () => new Response(renderDashboard(), { headers: { "Content-Type": "text/html" } }),
    "/api/workflows": () => Response.json(getActiveWorkflows()),
    "/api/workflow/:id": (req) => {
      const id = req.params.id;
      const statePath = join(AGENTS_DIR, id, "adw_state.json");
      if (!existsSync(statePath)) {
        return Response.json({ error: "Workflow not found" }, { status: 404 });
      }
      const state = JSON.parse(readFileSync(statePath, "utf-8"));
      return Response.json(state);
    },
    "/health": () => Response.json({ status: "ok", port: PORT }),
  },
});

console.log(`🚀 ADW Dashboard running at http://localhost:${PORT}`);
console.log(`   API: /api/workflows, /api/workflow/:id, /health`);
console.log(`   Reading state from: ${AGENTS_DIR}`);
