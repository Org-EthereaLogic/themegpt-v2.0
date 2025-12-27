#!/usr/bin/env python3
"""
Trinity Protocol Verification Script

Tests that all three providers are configured correctly and can make API calls.
Run this before using the Trinity Protocol to ensure your environment is set up.

Usage:
    uv run verify_trinity.py
"""

import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Add the adws directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables before checking them
env_paths = [
    Path(__file__).parent.parent / ".env.local",
    Path(__file__).parent.parent / ".env",
    Path.cwd() / ".env.local",
    Path.cwd() / ".env",
]
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        break
else:
    load_dotenv()

from adw_modules.provider_clients import (
    ClaudeClient,
    GPTClient,
    GeminiClient,
    ProviderClientFactory,
)


async def test_provider(name: str, client) -> tuple[bool, str]:
    """Test a single provider with a simple prompt."""
    try:
        response = await client.complete(
            prompt="Say 'Hello, Trinity Protocol!' and nothing else.",
            max_tokens=50,
            timeout=30.0,
        )
        return True, f"{response.model} ({response.tokens_used} tokens, {response.latency_ms:.0f}ms)"
    except Exception as e:
        return False, str(e)


async def verify_all_providers():
    """Verify all three Trinity Protocol providers."""
    print("🔱 Trinity Protocol Verification")
    print("=" * 50)
    print()
    
    # Check environment variables
    print("📋 Checking environment variables...")
    env_vars = {
        "ANTHROPIC_API_KEY": os.getenv("ANTHROPIC_API_KEY"),
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
        "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"),
    }
    
    all_set = True
    for var, value in env_vars.items():
        status = "✅" if value else "❌"
        masked = f"{value[:8]}..." if value else "NOT SET"
        print(f"  {status} {var}: {masked}")
        if not value:
            all_set = False
    
    if not all_set:
        print()
        print("❌ Some API keys are missing. Please set them in .env.local")
        return False
    
    print()
    print("🔌 Testing provider connections...")
    print()
    
    # Test each provider
    providers = {
        "Claude (Architect)": ClaudeClient,
        "GPT (Critic)": GPTClient,
        "Gemini (Advocate)": GeminiClient,
    }
    
    results = {}
    for name, client_class in providers.items():
        try:
            client = client_class()
            success, message = await test_provider(name, client)
            results[name] = (success, message)
            status = "✅" if success else "❌"
            print(f"  {status} {name}: {message}")
        except Exception as e:
            results[name] = (False, str(e))
            print(f"  ❌ {name}: Failed to initialize - {e}")
    
    print()
    
    # Summary
    all_passed = all(r[0] for r in results.values())
    if all_passed:
        print("✅ All providers verified successfully!")
        print()
        print("You can now use the Trinity Protocol:")
        print("  uv run adw_plan_build.py --trinity 'Issue Title' 'Issue Description'")
    else:
        print("❌ Some providers failed verification.")
        print("Please check your API keys and try again.")
    
    return all_passed


if __name__ == "__main__":
    success = asyncio.run(verify_all_providers())
    sys.exit(0 if success else 1)
