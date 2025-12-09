# Bun Quickstart Guide

## Overview

Build a minimal HTTP server with `Bun.serve`, run it locally, then evolve it by installing a package.

**Prerequisites:** Bun must be installed and available on your PATH. See installation documentation for setup.

---

## Step 1: Initialize a New Project

Run the initialization command to scaffold a new project:

```bash
bun init my-app
```

You'll be prompted to select a template. Choose `Blank` for this guide.

The command creates a `my-app` directory with these files:
- `.gitignore`
- `index.ts`
- `tsconfig.json` (for editor autocomplete)
- `README.md`

---

## Step 2: Run a Script

Execute the TypeScript file using the Bun runtime:

```bash
cd my-app
bun run index.ts
```

Expected output:
```
Hello via Bun!
```

---

## Step 3: Create an HTTP Server

Replace the contents of `index.ts` with server code:

```typescript
const server = Bun.serve({
  port: 3000,
  routes: {
    "/": () => new Response('Bun!'),
  }
});

console.log(`Listening on ${server.url}`);
```

Run the file again:

```bash
bun run index.ts
```

Expected output:
```
Listening on http://localhost:3000
```

Visit `http://localhost:3000` in your browser to see the response.

---

## Step 4: Install and Use a Package

Install the `figlet` package for ASCII art conversion:

```bash
bun add figlet
bun add -d @types/figlet
```

Update `index.ts` to add a new route:

```typescript
import figlet from 'figlet';

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": () => new Response('Bun!'),
    "/figlet": () => {
      const body = figlet.textSync('Bun!');
      return new Response(body);
    }
  }
});

console.log(`Listening on ${server.url}`);
```

Run and visit `http://localhost:3000/figlet` to see ASCII art output.

---

## Step 5: Serve Static HTML

Create an `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bun</title>
  </head>
  <body>
    <h1>Bun!</h1>
  </body>
</html>
```

Update `index.ts` to serve the HTML file:

```typescript
import figlet from 'figlet';
import index from './index.html';

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
    "/figlet": () => {
      const body = figlet.textSync('Bun!');
      return new Response(body);
    }
  }
});

console.log(`Listening on ${server.url}`);
```

---

## Running Scripts from package.json

Add a script to your `package.json`:

```json
{
  "scripts": {
    "start": "bun run index.ts"
  }
}
```

Execute it with:

```bash
bun run start
```

**Performance note:** `bun run` has approximately 28x faster overhead than `npm run` (6ms vs 170ms).

---

## TypeScript Configuration

If seeing TypeScript errors on the `Bun` global, install type definitions:

```bash
bun add -d @types/bun
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleDetection": "force",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true
  }
}
```
