import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import React from 'react'
import { vi } from 'vitest'
import en from '../_locales/en/messages.json'

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

type MessageEntry = {
  message: string
  placeholders?: Record<string, { content: string }>
}

// Resolves chrome.i18n substitutions: "$PLACEHOLDER$" → substitution value
function resolveMessage(entry: MessageEntry, substitutions?: string | string[]): string {
  let msg = entry.message
  if (!substitutions || !entry.placeholders) return msg
  const subs = Array.isArray(substitutions) ? substitutions : [substitutions]
  for (const [name, ph] of Object.entries(entry.placeholders)) {
    const match = ph.content.match(/^\$(\d+)$/)
    if (match) {
      const idx = parseInt(match[1], 10) - 1
      if (subs[idx] !== undefined) {
        msg = msg.replace(`$${name.toUpperCase()}$`, subs[idx])
      }
    }
  }
  return msg
}

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
    i18n: {
      getMessage: vi.fn((key: string, substitutions?: string | string[]) => {
        const entry = (en as Record<string, MessageEntry>)[key]
        if (!entry) return ''
        return resolveMessage(entry, substitutions)
      }),
    },
  },
})
