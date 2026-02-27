# {{ cookiecutter.project_name }} Bridge Dockerfile
# Multi-stage build for security and minimal image size

# Build stage
FROM python:{{ cookiecutter.python_version }}-slim AS builder

WORKDIR /build

# Install UV for dependency management
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY pyproject.toml ./
COPY infrastructure/bridge/requirements.txt ./

# Install dependencies
RUN uv pip install --system -r requirements.txt

# Runtime stage
FROM python:{{ cookiecutter.python_version }}-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python{{ cookiecutter.python_version }}/site-packages /usr/local/lib/python{{ cookiecutter.python_version }}/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Install git and curl (required for worktree operations and health checks)
RUN apt-get update && \
    apt-get install -y --no-install-recommends git curl && \
    rm -rf /var/lib/apt/lists/*

# Copy application code
COPY infrastructure/bridge/app.py ./app.py
COPY adws/ ./adws/

# Create non-root user for security
RUN useradd -m -u 1000 bridge && \
    mkdir -p /opt/adws/projects /opt/adws/logs && \
    chown -R bridge:bridge /opt/adws /app

USER bridge

# Expose port
EXPOSE {{ cookiecutter.bridge_port }}

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:{{ cookiecutter.bridge_port }}/health || exit 1

# Run with uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "{{ cookiecutter.bridge_port }}"]
