import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TokenCounter } from './TokenCounter'

describe('TokenCounter', () => {
  it('renders session tokens header when enabled', () => {
    render(<TokenCounter />)
    expect(screen.getByText('Session Tokens')).toBeInTheDocument()
  })

  it('renders privacy notice text', () => {
    render(<TokenCounter />)
    expect(screen.getByText(/no data leaves your browser/i)).toBeInTheDocument()
  })

  it('renders hide button when enabled', () => {
    render(<TokenCounter />)
    expect(screen.getByText('Hide')).toBeInTheDocument()
  })

  it('renders stat labels', () => {
    render(<TokenCounter />)
    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.getByText('Output')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })
})
