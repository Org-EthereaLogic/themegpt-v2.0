# ADW Multi-Provider Revival Design Notes

## SYNTHAI Lessons Applied

### What Failed (DO NOT REPEAT)
1. **Premature Abstraction**: 5 adapter files (1,035 lines) for 3 function calls
2. **Config Explosion**: 507 lines of YAML for what should be 3 hardcoded values
3. **Enterprise Patterns**: Circuit breakers, registries, rollback managers - unnecessary
4. **Specification Inflation**: Specs became implementation blueprints (759 lines!)
5. **Test Suite Bloat**: 4,136 test lines for 3,800 impl lines (>1:1 ratio)

### What Should Have Been Built (~150 lines)
```python
async def synthesize_plan(issue: str) -> str:
    perspectives = await asyncio.gather(
        call_llm("anthropic", TECHNICAL_PROMPT.format(issue=issue)),
        call_llm("openai", USER_PROMPT.format(issue=issue)),
        call_llm("gemini", RISK_PROMPT.format(issue=issue)),
    )
    return await call_llm("anthropic", SYNTHESIS_PROMPT.format(*perspectives))
```

---

## TAC-7 Patterns to Preserve

| Pattern | Implementation | Preserve? |
|---------|----------------|-----------|
| Worktree isolation | `trees/{adw_id}/` | ✅ Yes |
| Deterministic ports | `9100 + (hash % 15)` | ✅ Yes |
| State persistence | `agents/{adw_id}/adw_state.json` | ✅ Yes |
| Phase chaining | plan → build → test → ... | ✅ Yes |
| ADW-ID threading | Commits, PRs, comments | ✅ Yes |
| Pydantic validation | ADWStateData model | ✅ Yes |

---

## Minimal Feature Set for Multi-Provider

### Required (This Implementation)
1. **Three provider functions** (~25 lines each)
   - `call_anthropic()` - Claude Sonnet
   - `call_openai()` - GPT-4o
   - `call_gemini()` - Gemini 2.0 Flash

2. **Synthesis function** (~40 lines)
   - Technical perspective (Anthropic)
   - User experience perspective (OpenAI)
   - Risk perspective (Gemini)
   - Synthesis (Anthropic)

3. **State extension** (~5 lines)
   - `provider: Optional[str] = "anthropic"`
   - `synthesis_enabled: Optional[bool] = False`

4. **Bun TUI dashboard** (~150 lines)
   - Read-only monitoring
   - Display active workflows
   - No control plane

### NOT Required (Do Not Build)
- Provider adapters/abstract classes
- Configuration files
- Circuit breakers
- Rollback managers
- Metrics tracking
- Audit logging
- Cost tracking
- Provenance system

---

## Complexity Budget

| Component | Budget | Purpose |
|-----------|--------|---------|
| providers.py | 100 lines | 3 provider functions + dispatcher |
| synthesis.py | 50 lines | Three-perspective synthesis |
| state extension | 10 lines | 2 new fields |
| tui/server.ts | 150 lines | Bun dashboard |
| tui/dashboard.html | 100 lines | Dashboard template |
| **TOTAL** | **410 lines** | **Under 500 budget** |

---

## Decision Log

1. **No abstract classes** - Direct functions only
2. **Hardcoded defaults** - No config files until 3+ use cases
3. **Read-only TUI** - Control plane deferred
4. **Python for LLM calls** - Existing async works fine
5. **Bun for TUI only** - Fast HTTP server, no build step
