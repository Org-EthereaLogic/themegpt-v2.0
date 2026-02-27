"""
ADWS Bridge Server

Provides a secure HTTP API for triggering allowlisted ADWS scripts from
remote orchestrators (n8n Cloud, self-hosted n8n, or direct webhook calls).

Security Features:
- Bearer token authentication
- Script allowlist validation
- Argument sanitization (path traversal prevention)
- Per-execution logging
- Structured error responses

Usage:
    uvicorn infrastructure.bridge.app:app --host 0.0.0.0 --port 8080
"""

from __future__ import annotations

import json
import logging
import os
import re
import subprocess
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, status
from pydantic import BaseModel, Field, field_validator

# =============================================================================
# Logging Configuration
# =============================================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("adws-bridge")


# =============================================================================
# Configuration
# =============================================================================

BRIDGE_AUTH_TOKEN = os.getenv("BRIDGE_AUTH_TOKEN")
WORKSPACE_PATH = Path(os.getenv("WORKSPACE_PATH", "/opt/adws/projects"))
LOG_PATH = Path(os.getenv("BRIDGE_LOG_PATH", "/opt/adws/logs"))

# Allowlisted scripts (relative to project root)
ALLOWLISTED_SCRIPTS = {
    "adw_plan_iso": "adws/scripts/adw_plan_iso.py",
    "adw_build_iso": "adws/scripts/adw_build_iso.py",
    "adw_test_iso": "adws/scripts/adw_test_iso.py",
    "adw_review_iso": "adws/scripts/adw_review_iso.py",
    "adw_document_iso": "adws/scripts/adw_document_iso.py",
    "adw_ship_iso": "adws/scripts/adw_ship_iso.py",
}

# Maximum execution time (seconds)
EXECUTION_TIMEOUT = 600  # 10 minutes


# =============================================================================
# Models
# =============================================================================


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    version: str = "1.0.0"


class ExecuteRequest(BaseModel):
    """Request to execute an ADWS script."""

    script: str = Field(
        ...,
        description="Script name (without path or extension)",
        examples=["adw_plan_iso", "adw_build_iso"],
    )
    project: str = Field(
        ...,
        description="Project directory name",
        examples=["my-project"],
    )
    args: list[str] = Field(
        default_factory=list,
        description="Arguments to pass to the script",
        examples=[["42"], ["42", "abc12345"]],
    )

    @field_validator("script")
    @classmethod
    def validate_script(cls, v: str) -> str:
        """Validate script is in allowlist."""
        if v not in ALLOWLISTED_SCRIPTS:
            raise ValueError(
                f"Script '{v}' not in allowlist. "
                f"Allowed: {list(ALLOWLISTED_SCRIPTS.keys())}"
            )
        return v

    @field_validator("project")
    @classmethod
    def validate_project(cls, v: str) -> str:
        """Validate project name contains no path traversal."""
        if ".." in v or "/" in v or "\\" in v:
            raise ValueError("Project name cannot contain path separators or '..'")
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError(
                "Project name must contain only alphanumeric characters, "
                "underscores, and hyphens"
            )
        return v

    @field_validator("args")
    @classmethod
    def validate_args(cls, v: list[str]) -> list[str]:
        """
        Validate arguments using a blocklist approach.

        Rejects dangerous patterns that could enable shell injection or
        path traversal while allowing legitimate values like issue titles,
        branch names, and quoted strings. More permissive than the previous
        allowlist regex (which blocked spaces and quotes), but still blocks
        shell metacharacters, control characters, and traversal sequences.
        """
        dangerous_patterns = [
            re.compile(r"\.\."),          # Path traversal
            re.compile(r"\|"),            # Pipe (shell chaining)
            re.compile(r"`"),             # Backtick (command substitution)
            re.compile(r"\$"),            # Dollar sign (variable/command expansion)
            re.compile(r"[><]"),          # Redirects
            re.compile(r"\x00"),          # Null bytes
            re.compile(r";"),             # Semicolon (command separator)
            re.compile(r"&"),             # Ampersand (background/chaining)
            re.compile(r"[\t\n\r]"),      # Tab, newline, carriage return
        ]

        for arg in v:
            if not arg.strip():
                raise ValueError("Empty arguments are not allowed")
            for pattern in dangerous_patterns:
                if pattern.search(arg):
                    raise ValueError(
                        f"Argument contains a blocked pattern: '{arg}'. "
                        "Path traversal, shell operators, control characters, "
                        "and command substitution are not permitted."
                    )
        return v


class ExecuteResponse(BaseModel):
    """Response from script execution."""

    success: bool
    script: str
    project: str
    exit_code: int
    stdout: str
    stderr: str
    duration_seconds: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))


class ErrorResponse(BaseModel):
    """Structured error response."""

    error: str
    code: str
    details: str | None = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))


# =============================================================================
# Authentication
# =============================================================================


async def verify_auth_token(
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    """
    Verify Bearer token authentication.

    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    if not BRIDGE_AUTH_TOKEN:
        logger.error("BRIDGE_AUTH_TOKEN environment variable not set")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server misconfiguration: authentication token not configured",
        )

    if not authorization:
        logger.warning("Request received without Authorization header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        logger.warning(f"Invalid Authorization format: {parts[0] if parts else 'empty'}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization format. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    if token != BRIDGE_AUTH_TOKEN:
        logger.warning("Invalid token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info("Authentication successful")
    return token


# =============================================================================
# Application
# =============================================================================

app = FastAPI(
    title="ADWS Bridge",
    description="Secure execution bridge for ADWS workflow scripts",
    version="1.0.0",
)


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    No authentication required. Used by load balancers and monitoring.
    """
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(UTC),
        version="1.0.0",
    )


@app.post(
    "/execute",
    response_model=ExecuteResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        500: {"model": ErrorResponse, "description": "Execution error"},
    },
)
async def execute_script(
    request: ExecuteRequest,
    token: str = Depends(verify_auth_token),
) -> ExecuteResponse:
    """
    Execute an allowlisted ADWS script.

    Security:
    - Requires Bearer token authentication
    - Script must be in allowlist
    - Project and arguments are validated by Pydantic field validators
    - Execution is logged
    """
    # At this point, FastAPI has already validated `request` using the
    # Pydantic validators defined on the ExecuteRequest model. We rely on
    # those validators as the single source of truth for project and args
    # validation, and simply use the validated values here.

    # Resolve project path
    project_path = WORKSPACE_PATH / request.project
    if not project_path.exists():
        logger.error(f"Project directory not found: {project_path}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Project directory '{request.project}' does not exist",
        )

    if not project_path.is_dir():
        logger.error(f"Project path is not a directory: {project_path}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Project path '{request.project}' is not a directory",
        )

    # Resolve script path from allowlist
    script_relative_path = ALLOWLISTED_SCRIPTS[request.script]
    script_path = project_path / script_relative_path

    if not script_path.exists():
        logger.error(f"Script not found: {script_path}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Script '{request.script}' not found in project",
        )

    # Build command with validated arguments
    command = ["uv", "run", "python", str(script_path), *request.args]
    logger.info(f"Executing: {' '.join(command)}")
    logger.info(f"Working directory: {project_path}")

    # Execute with timeout and capture output
    start_time = time.monotonic()

    try:
        result = subprocess.run(
            command,
            cwd=project_path,
            capture_output=True,
            text=True,
            timeout=EXECUTION_TIMEOUT,
        )
        duration = time.monotonic() - start_time
        success = result.returncode == 0

        logger.info(
            f"Execution completed: exit_code={result.returncode}, "
            f"duration={duration:.2f}s"
        )

        # Log execution details
        log_execution(
            script=request.script,
            project=request.project,
            args=request.args,
            exit_code=result.returncode,
            duration=duration,
            success=success,
        )

        return ExecuteResponse(
            success=success,
            script=request.script,
            project=request.project,
            exit_code=result.returncode,
            stdout=result.stdout,
            stderr=result.stderr,
            duration_seconds=duration,
            timestamp=datetime.now(UTC),
        )

    except subprocess.TimeoutExpired:
        duration = time.monotonic() - start_time
        logger.error(f"Execution timed out after {EXECUTION_TIMEOUT}s")

        log_execution(
            script=request.script,
            project=request.project,
            args=request.args,
            exit_code=-1,
            duration=duration,
            success=False,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Execution timed out after {EXECUTION_TIMEOUT} seconds",
        ) from None

    except subprocess.SubprocessError as e:
        duration = time.monotonic() - start_time
        logger.error(f"Execution failed: {e}")

        log_execution(
            script=request.script,
            project=request.project,
            args=request.args,
            exit_code=-1,
            duration=duration,
            success=False,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Execution failed: {e!s}",
        ) from e


# =============================================================================
# Logging Helper
# =============================================================================


def log_execution(
    script: str,
    project: str,
    args: list[str],
    exit_code: int,
    duration: float,
    success: bool,
) -> None:
    """
    Log execution details for audit.

    Logs are written to BRIDGE_LOG_PATH/executions.jsonl
    """
    log_entry = {
        "timestamp": datetime.now(UTC).isoformat(),
        "script": script,
        "project": project,
        "args": args,
        "exit_code": exit_code,
        "duration_seconds": round(duration, 3),
        "success": success,
    }

    # Ensure log directory exists
    LOG_PATH.mkdir(parents=True, exist_ok=True)

    log_file = LOG_PATH / "executions.jsonl"

    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
        logger.info(f"Execution logged to {log_file}")
    except OSError as e:
        logger.error(f"Failed to write execution log: {e}")
