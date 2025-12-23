# n8n ADWS GitHub Issue Generator - Setup Guide

**Date:** 2025-12-23  
**Version:** 1.0  
**Workflow URL:** `https://etherealogic.app.n8n.cloud/webhook/adws-issue-generator`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ADWS GitHub Issue Generator Pipeline                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────────────┐   │
│  │ Webhook  │───▶│ Classify │───▶│ Route by    │───▶│ Generate Issue   │   │
│  │ Trigger  │    │ Request  │    │ Complexity  │    │ (Claude Sonnet)  │   │
│  └──────────┘    └──────────┘    └─────────────┘    └──────────────────┘   │
│                                         │                     │             │
│                            ┌────────────┴────────────┐        │             │
│                            ▼                         ▼        ▼             │
│                   ┌────────────────┐      ┌─────────────┐  ┌───────────┐   │
│                   │ Multi-LLM      │      │ Single      │  │ GitHub    │   │
│                   │ Synthesis      │      │ Provider    │  │ Issue API │   │
│                   │ (External WF)  │      │ Analysis    │  │ (Optional)│   │
│                   └────────────────┘      └─────────────┘  └───────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Test the Endpoint

```bash
curl -X POST https://etherealogic.app.n8n.cloud/webhook/adws-issue-generator \
  -H "Content-Type: application/json" \
  -d '{
    "request": "Add animated snowfall to the Frozen theme",
    "project": "themegpt-v2.0",
    "useSynthesis": true,
    "createGitHubIssue": false
  }'
```

### Expected Response

```json
{
  "success": true,
  "classification": {
    "type": "Feature",
    "complexity": "Moderate",
    "usedSynthesis": true
  },
  "issue": {
    "title": "Feature: Implement Animated Snowfall for Frozen Theme",
    "markdown": "# Feature: Implement Animated Snowfall..."
  },
  "adwsCommand": "cd adws && uv run adw_plan_build.py --synthesis \"Feature: Implement Animated Snowfall for Frozen Theme\""
}
```

---

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | string | Yes | Natural language description of the task |
| `project` | string | No | Project identifier (default: `themegpt-v2.0`) |
| `useSynthesis` | boolean | No | Force multi-LLM synthesis (auto-detected if not set) |
| `createGitHubIssue` | boolean | No | Actually create issue in GitHub (default: `false`) |

---

## Integration with Existing Workflow

This workflow integrates with the existing **ADWS Multi-LLM Synthesis** workflow:

| Workflow | Endpoint | Purpose |
|----------|----------|---------|
| ADWS Multi-LLM Synthesis | `/webhook/adws-synthesis` | Three-perspective analysis (Claude + GPT + Gemini) |
| ADWS GitHub Issue Generator | `/webhook/adws-issue-generator` | Transform requests → GitHub issues |

When `useSynthesis: true`, the Issue Generator calls the Synthesis workflow internally.

---

## Workflow Nodes

### Node Configuration Summary

| Node | Type | Purpose |
|------|------|---------|
| Webhook Trigger | webhook | Receives POST requests |
| Classify Request | Anthropic | Determines type/complexity |
| Parse Classification | Code | Extracts JSON from response |
| Route by Complexity | IF | Routes to synthesis or simple analysis |
| Call Synthesis Workflow | HTTP Request | Invokes multi-LLM synthesis |
| Simple Analysis | Anthropic | Single-provider analysis for simple tasks |
| Merge Analysis | Merge | Combines analysis paths |
| Generate Issue | Anthropic | Creates formatted GitHub issue |
| Create GitHub Issue | GitHub (optional) | Posts to GitHub API |
| Format Response | Code | Structures final response |
| Webhook Response | Respond to Webhook | Returns JSON result |

---

## Setup Steps

1. **Create Workflow** in n8n UI
2. **Add Webhook Trigger** at `/adws-issue-generator`
3. **Add Claude Classification Node** with type detection system prompt
4. **Add Routing Logic** based on complexity
5. **Connect to Synthesis Workflow** for complex issues
6. **Add Issue Generator Node** with full template
7. **Add Optional GitHub Integration**
8. **Enable MCP Access** in workflow settings
9. **Activate Workflow**

See the full setup guide for detailed node configurations.

---

## Usage from Claude Code

Once MCP is enabled:

```
Execute n8n workflow "ADWS GitHub Issue Generator" with:
{
  "request": "Create the Snowfall Serenity theme",
  "project": "themegpt-v2.0",
  "useSynthesis": true
}
```

---

## Error Handling

| Error | Resolution |
|-------|------------|
| Classification parse failure | Falls back to Feature/Moderate defaults |
| Synthesis workflow timeout | Uses simple analysis instead |
| GitHub API failure | Returns issue markdown without creating |
| Invalid project | Defaults to themegpt-v2.0 |

---

## Environment Variables

Required in n8n credentials:

- `ANTHROPIC_API_KEY` - Claude for classification and generation
- `OPENAI_API_KEY` - GPT-4o in synthesis
- `GEMINI_API_KEY` - Gemini in synthesis  
- `GITHUB_TOKEN` - (Optional) For issue creation
