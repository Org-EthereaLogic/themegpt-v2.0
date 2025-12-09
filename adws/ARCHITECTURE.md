# ADW Multi-Provider Architecture

## Overview

This document describes the minimal extension to ADW for multi-provider LLM support and three-perspective synthesis.

**Design Philosophy**: Extend, don't replace. Add thin layers, not frameworks.

---

## File Structure

```
adws/
├── DESIGN_NOTES.md          # Phase 1 output
├── ARCHITECTURE.md          # This file
├── adw_modules/
│   ├── agent.py             # Existing - Claude Code bridge
│   ├── data_types.py        # Existing + 2 new fields
│   ├── providers.py         # NEW: Simple provider functions
│   ├── synthesis.py         # NEW: Three-perspective synthesis
│   ├── state.py             # Existing - state persistence
│   └── worktree_ops.py      # Existing - worktree management
└── tui/
    ├── server.ts            # NEW: Bun HTTP server
    └── dashboard.html       # NEW: Dashboard template
```

---

## Component Design

### 1. Provider Module (providers.py)

**Pattern**: Direct functions, no abstractions.

```python
# NO: class LLMProvider(ABC): ...
# YES: async def call_anthropic(prompt: str) -> str: ...

PROVIDERS = {
    "anthropic": call_anthropic,
    "openai": call_openai,
    "gemini": call_gemini,
}

async def call_llm(provider: str, prompt: str) -> str:
    return await PROVIDERS[provider](prompt)
```

### 2. Synthesis Module (synthesis.py)

**Pattern**: Hardcoded prompts, single function.

```python
PERSPECTIVES = {
    "technical": "Analyze from architecture perspective...",
    "user": "Analyze from UX perspective...",
    "risk": "Analyze from risk perspective...",
}

async def synthesize_perspectives(issue: str) -> str:
    # Parallel calls to three providers
    # Synthesis via Anthropic
    return synthesized_plan
```

### 3. State Extension (data_types.py)

**Pattern**: Minimal field addition.

```python
class ADWStateData(BaseModel):
    # ... existing fields ...
    provider: Optional[str] = "anthropic"
    synthesis_enabled: Optional[bool] = False
```

### 4. Bun TUI (tui/server.ts)

**Pattern**: Read-only dashboard.

```typescript
Bun.serve({
  port: 9000,
  routes: {
    "/": () => renderDashboard(),
    "/api/workflows": () => getActiveWorkflows(),
  }
});
```

---

## Integration Points

### With Existing ADW Phases

```
adw_plan_iso.py
  └── If synthesis_enabled:
        └── Call synthesize_perspectives()
        └── Use synthesized plan as input
```

### With Existing State

```
State field: provider
Default: "anthropic"
Usage: Determines which provider for non-synthesis calls
```

---

## Port Allocation

Preserved from TAC-7:
- Backend: 9100-9114 (15 ports)
- Frontend: 9200-9214 (15 ports)
- TUI Dashboard: 9000 (single instance)

---

## Environment Variables

### Required
- `ANTHROPIC_API_KEY` - Existing
- `OPENAI_API_KEY` - New
- `GOOGLE_API_KEY` - New (for Gemini)

### Optional
- `SYNTHESIS_ENABLED=true` - Enable three-perspective synthesis

---

## Extension Points (Future)

1. **More providers** - Add function to PROVIDERS dict
2. **Custom prompts** - Modify PERSPECTIVES dict
3. **TUI control** - Add POST routes (deferred)
4. **Metrics** - Add after 3+ successful syntheses

---

## Anti-Patterns Avoided

| Anti-Pattern | How Avoided |
|--------------|-------------|
| Abstract adapters | Direct functions only |
| Config files | Hardcoded defaults |
| Registry pattern | Simple dict lookup |
| Circuit breakers | Standard try/except |
| Metrics system | Deferred |
| Audit logging | print() is sufficient |
