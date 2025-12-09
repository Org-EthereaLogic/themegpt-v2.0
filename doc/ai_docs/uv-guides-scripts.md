# Running Scripts with uv

## Overview

A Python script is designed for standalone execution (e.g., `python <script>.py`). Using uv ensures script dependencies are automatically managed without manual environment configuration.

## Running Scripts Without Dependencies

Execute simple scripts using `uv run`:

```bash
$ uv run example.py
```

Scripts using only the standard library work the same way. Arguments can be passed directly:

```bash
$ uv run example.py hello world!
hello world!
```

Scripts can also read from stdin:

```bash
$ echo 'print("hello world!")' | uv run -
```

**Note:** When working in a project directory with `pyproject.toml`, use `--no-project` to skip installing the current project.

## Running Scripts With Dependencies

For scripts requiring external packages, dependencies must be declared. Use the `--with` option:

```bash
$ uv run --with rich example.py
```

Version constraints are supported:

```bash
$ uv run --with 'rich>12,<13' example.py
```

## Declaring Script Dependencies

Python's inline script metadata standard allows declaring dependencies within the script itself. Initialize scripts with metadata:

```bash
$ uv init --script example.py --python 3.12
```

Add dependencies using:

```bash
$ uv add --script example.py 'requests<3' 'rich'
```

This creates a metadata block at the script's top:

```python
# /// script
# dependencies = [
#   "requests<3",
#   "rich",
# ]
# ///
```

**Important:** Scripts with inline metadata ignore project dependencies, even when run in a project directory.

## Executable Scripts with Shebangs

Make scripts executable by adding a shebang:

```bash
#!/usr/bin/env -S uv run --script
print("Hello, world!")
```

Then execute with `./greet` after running `chmod +x greet`.

## Alternative Package Indexes

Specify custom package indexes:

```bash
$ uv add --index "https://example.com/simple" --script example.py 'requests<3'
```

## Locking Dependencies

Lock script dependencies explicitly:

```bash
$ uv lock --script example.py
```

This creates an adjacent `.lock` file. Subsequent operations reuse locked versions.

## Reproducibility

Add an `exclude-newer` field to limit package resolution to specific dates:

```python
# /// script
# dependencies = ["requests"]
# [tool.uv]
# exclude-newer = "2023-10-16T00:00:00Z"
# ///
```

## Python Version Management

Request specific Python versions per invocation:

```bash
$ uv run --python 3.10 example.py
```

uv automatically downloads required versions if not installed.

## GUI Scripts

On Windows, `.pyw` files run with `pythonw` to prevent console windows. GUI frameworks like Tkinter and PyQt5 are supported:

```bash
PS> uv run --with PyQt5 example_pyqt.pyw
```

## Key Takeaways

- "uv automatically manages virtual environments for you" and prefers declarative dependency approaches
- Inline metadata provides a standardized way to declare dependencies within scripts
- Dependencies can be locked for reproducibility
- Python versions are automatically managed and downloaded as needed
