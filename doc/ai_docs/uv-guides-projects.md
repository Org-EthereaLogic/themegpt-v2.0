# UV Project Management Guide

## Overview

UV is a Python project manager that enables developers to define and manage projects through a `pyproject.toml` file. The tool streamlines dependency management, environment setup, and project execution.

## Project Initialization

Creating a new project uses the command `uv init hello-world`, which generates a structured directory containing:

- `.gitignore` - Version control exclusions
- `.python-version` - Specifies the Python version for the project
- `README.md` - Project documentation
- `main.py` - Sample "Hello world" application
- `pyproject.toml` - Project metadata and configuration

After initialization, running `uv run main.py` executes the sample program.

## Project Structure Components

**pyproject.toml**: Contains project metadata including name, version, description, and dependencies. This file can be edited directly or managed through CLI commands like `uv add` and `uv remove`.

**.python-version**: Defines the default Python interpreter version for the project environment.

**.venv**: An isolated virtual environment folder where project dependencies are installed, separate from system Python packages.

**uv.lock**: A human-readable, cross-platform lockfile containing exact resolved dependency versions. This file should be committed to version control for reproducible installations across machines.

## Dependency Management

The `uv add` command installs packages and updates both the configuration file and lockfile:
- `uv add requests` - Basic package installation
- `uv add 'requests==2.31.0'` - Version-constrained installation
- `uv add git+https://github.com/psf/requests` - Git-based dependencies
- `uv add -r requirements.txt` - Bulk import from existing files

Removal uses `uv remove package-name`, while upgrades employ `uv lock --upgrade-package package-name` to update specific packages while maintaining lockfile stability.

## Version Information

The `uv version` command retrieves package version information with formatting options:
- Basic output includes package name and version
- `--short` flag displays only the version number
- `--output-format json` returns structured JSON output

## Command Execution

`uv run` executes scripts and commands within the project environment, automatically synchronizing the lockfile and environment before execution. This guarantees consistent, reproducible runs.

Alternative workflow: `uv sync` manually updates the environment, followed by shell activation (`source .venv/bin/activate` on Unix systems) before executing commands.

## Distribution Building

`uv build` generates both source distributions (.tar.gz) and wheel files (.whl), placing artifacts in a `dist/` subdirectory by default.
