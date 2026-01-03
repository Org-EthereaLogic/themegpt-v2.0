import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import React from 'react'
import { vi } from 'vitest'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Make React available globally for JSX
globalThis.React = React

// Mock @plasmohq/storage with class syntax
class MockStorage {
  get = vi.fn().mockResolvedValue(undefined)
  set = vi.fn().mockResolvedValue(undefined)
}
vi.mock('@plasmohq/storage', () => ({ Storage: MockStorage }))

// Mock url: imports for Plasmo assets (1x1 transparent PNG to avoid empty src warning)
vi.mock('url:../assets/mascot-32.png', () => ({ default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }))
vi.mock('../style.css', () => ({}))

// Mock chrome APIs
Object.assign(globalThis, {
  chrome: {
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn(),
    },
    runtime: {
      id: 'test-extension-id', // Required for isContextValid() check
      lastError: null,
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      sendMessage: vi.fn().mockResolvedValue(undefined),
    },
  },
})
