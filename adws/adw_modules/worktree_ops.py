"""Worktree and port management for isolated ADW workflows.

Provides utilities for creating git worktrees under trees/<adw_id>/
and allocating unique ports for each isolated instance.

Adapted from TAC-7 proven patterns.
"""

import os
import subprocess
import socket
import logging
from typing import Tuple, Optional

from adw_modules.state import ADWState


def get_project_root() -> str:
    """Get the project root directory."""
    return os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )


def create_worktree(adw_id: str, branch_name: str, logger: logging.Logger) -> Tuple[Optional[str], Optional[str]]:
    """Create a git worktree for isolated ADW execution.
    
    Args:
        adw_id: The ADW ID for this worktree
        branch_name: The branch name to create
        logger: Logger instance
        
    Returns:
        Tuple of (worktree_path, error_message)
    """
    project_root = get_project_root()
    trees_dir = os.path.join(project_root, "trees")
    os.makedirs(trees_dir, exist_ok=True)
    
    worktree_path = os.path.join(trees_dir, adw_id)
    
    if os.path.exists(worktree_path):
        logger.warning(f"Worktree already exists at {worktree_path}")
        return worktree_path, None
    
    # Fetch latest
    subprocess.run(["git", "fetch", "origin"], capture_output=True, cwd=project_root)
    
    # Create worktree with new branch from origin/main
    cmd = ["git", "worktree", "add", "-b", branch_name, worktree_path, "origin/main"]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=project_root)
    
    if result.returncode != 0:
        if "already exists" in result.stderr:
            cmd = ["git", "worktree", "add", worktree_path, branch_name]
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=project_root)
        
        if result.returncode != 0:
            return None, f"Failed to create worktree: {result.stderr}"
    
    logger.info(f"Created worktree at {worktree_path}")
    return worktree_path, None


def get_worktree_path(adw_id: str) -> str:
    """Get absolute path to worktree."""
    return os.path.join(get_project_root(), "trees", adw_id)


def remove_worktree(adw_id: str, logger: logging.Logger) -> Tuple[bool, Optional[str]]:
    """Remove a worktree and clean up."""
    worktree_path = get_worktree_path(adw_id)
    
    cmd = ["git", "worktree", "remove", worktree_path, "--force"]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=get_project_root())
    
    if result.returncode != 0:
        return False, f"Failed to remove worktree: {result.stderr}"
    
    logger.info(f"Removed worktree at {worktree_path}")
    return True, None


# Port allocation - deterministic from ADW ID

def get_ports_for_adw(adw_id: str) -> Tuple[int, int]:
    """Deterministically assign ports based on ADW ID.
    
    Backend: 9100-9114 (15 ports)
    Frontend: 9200-9214 (15 ports)
    
    Args:
        adw_id: The ADW ID
        
    Returns:
        Tuple of (backend_port, frontend_port)
    """
    try:
        id_chars = ''.join(c for c in adw_id[:8] if c.isalnum())
        index = int(id_chars, 36) % 15
    except ValueError:
        index = hash(adw_id) % 15
    
    return 9100 + index, 9200 + index


def is_port_available(port: int) -> bool:
    """Check if a port is available for binding."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            s.bind(('localhost', port))
            return True
    except (socket.error, OSError):
        return False


def find_available_ports(adw_id: str, max_attempts: int = 15) -> Tuple[int, int]:
    """Find available ports starting from deterministic assignment.
    
    Args:
        adw_id: The ADW ID
        max_attempts: Maximum attempts (default 15)
        
    Returns:
        Tuple of (backend_port, frontend_port)
        
    Raises:
        RuntimeError: If no ports available
    """
    base_backend, base_frontend = get_ports_for_adw(adw_id)
    base_index = base_backend - 9100
    
    for offset in range(max_attempts):
        index = (base_index + offset) % 15
        backend = 9100 + index
        frontend = 9200 + index
        
        if is_port_available(backend) and is_port_available(frontend):
            return backend, frontend
    
    raise RuntimeError("No available ports in range 9100-9114")


def setup_worktree_environment(worktree_path: str, backend_port: int, frontend_port: int, logger: logging.Logger) -> None:
    """Create .ports.env file in worktree."""
    ports_env_path = os.path.join(worktree_path, ".ports.env")
    
    with open(ports_env_path, "w") as f:
        f.write(f"BACKEND_PORT={backend_port}\n")
        f.write(f"FRONTEND_PORT={frontend_port}\n")
        f.write(f"VITE_BACKEND_URL=http://localhost:{backend_port}\n")
    
    logger.info(f"Created .ports.env: Backend={backend_port}, Frontend={frontend_port}")
