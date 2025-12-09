# Bun Documentation

## Overview

"Bun is an all-in-one toolkit for developing modern JavaScript/TypeScript applications." It functions as a unified platform combining a runtime, package manager, test runner, and bundler into a single executable.

## What is Bun?

Bun serves as a comprehensive JavaScript development platform. The core component is a high-performance JavaScript runtime designed as "a drop-in replacement for Node.js." Built with Zig and powered by JavaScriptCore, it delivers faster startup times and reduced memory consumption compared to traditional Node.js environments.

### Core Components

The toolkit includes:

- **Runtime**: Execute JavaScript/TypeScript files and package scripts with minimal overhead
- **Package Manager**: Install dependencies significantly faster than npm with global caching and workspace support
- **Test Runner**: Jest-compatible testing with TypeScript support, snapshots, and watch mode
- **Bundler**: Native bundling for JS/TS/JSX with splitting, plugins, and HTML imports

## Key Features

### TypeScript & JSX Support
"You can directly execute `.jsx`, `.ts`, and `.tsx` files; Bun's transpiler converts these to vanilla JavaScript before execution."

### Module System Compatibility
"ESM & CommonJS compatibility" - The platform recommends ES modules but maintains full CommonJS support for existing npm packages.

### Web-Standard APIs
"Bun implements standard Web APIs like `fetch`, `WebSocket`, and `ReadableStream`."

### Node.js Compatibility
Bun aims for comprehensive compatibility with Node.js globals (`process`, `Buffer`) and built-in modules (`path`, `fs`, `http`). This effort remains ongoing.

## Design Goals

The platform prioritizes:

- **Speed**: Processes start approximately 4x faster than Node.js
- **TypeScript & JSX support**: Native handling without additional configuration
- **ESM & CommonJS compatibility**: Support for both module systems
- **Web-standard APIs**: Implementation of familiar browser APIs for server-side use
- **Node.js compatibility**: Extensive support for existing Node.js code

## What is a Runtime?

"JavaScript is just a specification for a programming language." A runtime provides the APIs and environment that allow JavaScript programs to interact with the operating system and perform practical tasks.

### Browsers vs. Node.js vs. Bun

**Browsers** implement JavaScript runtimes with web-specific APIs accessible through the `window` object, enabling interactive webpage behavior.

**Node.js** provides server-side runtime with Node-specific globals and built-in modules for OS-level tasks like file operations and networking.

**Bun** offers a faster, leaner alternative to Node.js with modern defaults while maintaining compatibility with existing Node.js projects.

## Command Examples

```bash
bun run index.tsx              # Execute TypeScript/JSX files
bun run start                  # Run package.json scripts
bun install <pkg>             # Install packages
bun build ./index.tsx         # Bundle for browsers
bun test                      # Run tests
bunx cowsay 'Hello, world!'   # Execute npm packages
```

## Getting Started

Bun ships as a single, dependency-free binary. To begin development:

1. Install Bun using npm, Homebrew, Docker, or the official installer
2. Create a new project with `bun init` or `bun create`
3. Execute files directly with TypeScript/JSX support enabled
4. Manage dependencies with the built-in package manager
5. Run tests using the integrated test runner

The platform is designed for immediate productivity with minimal configuration required for existing Node.js projects.
