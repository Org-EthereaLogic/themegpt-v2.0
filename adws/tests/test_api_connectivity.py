"""
API Connectivity Verification Script

This script verifies that all Trinity protocol APIs are accessible
with the configured credentials. It makes minimal API calls to
validate authentication without incurring significant costs.

IMPORTANT: This makes REAL API calls - not simulations.
Per user configuration: Uses exactly specified models, fails if unavailable.
"""

import asyncio
import os
import sys
from pathlib import Path
from typing import TypedDict

from dotenv import load_dotenv


class ConnectivityResult(TypedDict):
    """Result of an API connectivity check."""
    provider: str
    model: str
    status: str
    message: str


def load_environment() -> None:
    """Load environment variables from .env file."""
    env_path = Path(__file__).parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path, override=True)
    else:
        load_dotenv(override=True)


async def verify_anthropic() -> ConnectivityResult:
    """Verify Anthropic API connectivity with Claude Opus 4.5."""
    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY")
    model = os.getenv("TRINITY_ARCHITECT_MODEL", "claude-opus-4-5-20251101")

    if not api_key:
        return {
            "provider": "anthropic",
            "model": model,
            "status": "error",
            "message": "ANTHROPIC_API_KEY not set in environment",
        }

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model=model,
            max_tokens=10,
            messages=[{"role": "user", "content": "Reply with only: OK"}],
        )
        response_text = response.content[0].text if response.content else "No response"
        return {
            "provider": "anthropic",
            "model": model,
            "status": "success",
            "message": f"Connected. Response: {response_text}",
        }
    except anthropic.AuthenticationError as e:
        return {
            "provider": "anthropic",
            "model": model,
            "status": "auth_error",
            "message": f"Authentication failed: {e}",
        }
    except anthropic.NotFoundError as e:
        return {
            "provider": "anthropic",
            "model": model,
            "status": "model_error",
            "message": f"Model not found: {model}. Error: {e}",
        }
    except Exception as e:
        return {
            "provider": "anthropic",
            "model": model,
            "status": "error",
            "message": str(e),
        }


async def verify_openai() -> ConnectivityResult:
    """Verify OpenAI API connectivity with specified model (no fallback)."""
    import openai

    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("TRINITY_CRITIC_MODEL", "gpt-5.2-codex")

    if not api_key:
        return {
            "provider": "openai",
            "model": model,
            "status": "error",
            "message": "OPENAI_API_KEY not set in environment",
        }

    try:
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            max_completion_tokens=10,
            messages=[{"role": "user", "content": "Reply with only: OK"}],
        )
        response_text = response.choices[0].message.content if response.choices else "No response"
        return {
            "provider": "openai",
            "model": model,
            "status": "success",
            "message": f"Connected. Response: {response_text}",
        }
    except openai.AuthenticationError as e:
        return {
            "provider": "openai",
            "model": model,
            "status": "auth_error",
            "message": f"Authentication failed: {e}",
        }
    except openai.NotFoundError as e:
        return {
            "provider": "openai",
            "model": model,
            "status": "model_error",
            "message": f"Model not found: {model}. Error: {e}",
        }
    except Exception as e:
        return {
            "provider": "openai",
            "model": model,
            "status": "error",
            "message": str(e),
        }


async def verify_gemini() -> ConnectivityResult:
    """Verify Google Gemini API connectivity with specified model."""
    import google.genai as genai

    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("TRINITY_ADVOCATE_MODEL", "gemini-3-pro-preview")

    if not api_key:
        return {
            "provider": "gemini",
            "model": model_name,
            "status": "error",
            "message": "GEMINI_API_KEY not set in environment",
        }

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model_name,
            contents="What is 2 + 2? Reply with just the number.",
            config=genai.types.GenerateContentConfig(max_output_tokens=10),
        )
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                response_text = candidate.content.parts[0].text
            else:
                finish_reason = getattr(candidate, "finish_reason", "unknown")
                return {
                    "provider": "gemini",
                    "model": model_name,
                    "status": "success",
                    "message": f"Connected (finish_reason: {finish_reason})",
                }
        else:
            response_text = "No candidates returned"
        return {
            "provider": "gemini",
            "model": model_name,
            "status": "success",
            "message": f"Connected. Response: {response_text}",
        }
    except Exception as e:
        error_str = str(e)
        if "API_KEY_INVALID" in error_str or "401" in error_str:
            return {
                "provider": "gemini",
                "model": model_name,
                "status": "auth_error",
                "message": f"Authentication failed: {error_str}",
            }
        if "not found" in error_str.lower() or "404" in error_str:
            return {
                "provider": "gemini",
                "model": model_name,
                "status": "model_error",
                "message": f"Model not found: {model_name}. Error: {error_str}",
            }
        return {
            "provider": "gemini",
            "model": model_name,
            "status": "error",
            "message": error_str,
        }


def print_result(result: ConnectivityResult) -> None:
    """Print a formatted result for a provider check."""
    provider = result["provider"].upper()
    model = result["model"]
    status = result["status"]
    message = result["message"]

    if status == "success":
        print(f"  {provider} ({model}): {message}")
    elif status == "auth_error":
        print(f"  {provider} ({model}): Authentication failed")
        print(f"    -> {message}")
    elif status == "model_error":
        print(f"  {provider} ({model}): Model not available")
        print(f"    -> {message}")
    else:
        print(f"  {provider} ({model}): Error")
        print(f"    -> {message}")


async def main() -> int:
    """Run all connectivity checks and report results."""
    load_environment()

    print("=" * 70)
    print("ADWS Trinity Protocol - API Connectivity Verification")
    print("=" * 70)
    print()
    print("Configuration: Use exact specified models (no fallback)")
    print()

    results = await asyncio.gather(
        verify_anthropic(),
        verify_openai(),
        verify_gemini(),
    )

    success_count = 0
    failure_count = 0

    for result in results:
        if result["status"] == "success":
            success_count += 1
        else:
            failure_count += 1
        print_result(result)
        print()

    print("=" * 70)
    print(f"Results: {success_count} succeeded, {failure_count} failed")
    print("=" * 70)

    if failure_count == 0:
        print("All API connections verified successfully.")
        return 0
    else:
        print("Some API connections failed. Check credentials and model availability.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
