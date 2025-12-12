import '@testing-library/jest-dom/vitest'
import React from 'react'
import { vi } from 'vitest'

// Make React available globally for JSX
globalThis.React = React

// Mock @plasmohq/storage with class syntax
class MockStorage {
  get = vi.fn().mockResolvedValue(undefined)
  set = vi.fn().mockResolvedValue(undefined)
}
vi.mock('@plasmohq/storage', () => ({ Storage: MockStorage }))

// Mock url: imports for Plasmo assets
vi.mock('url:../assets/mascot-32.png', () => ({ default: '' }))
vi.mock('../style.css', () => ({}))

// Mock chrome APIs
Object.assign(globalThis, {
  chrome: {
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn(),
    },
    runtime: {
      lastError: null,
    },
  },
})
