import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Popup from './popup'

describe('Popup', () => {
  it('renders header with ThemeGPT branding', () => {
    render(<Popup />)
    expect(screen.getByText('ThemeGPT')).toBeInTheDocument()
  })

  it('renders Free Collection section', () => {
    render(<Popup />)
    expect(screen.getByText('Free Collection')).toBeInTheDocument()
  })

  it('renders Premium Collection section', () => {
    render(<Popup />)
    expect(screen.getByText('Premium Collection')).toBeInTheDocument()
  })

  it('renders subscription link in footer', () => {
    render(<Popup />)
    expect(screen.getByText(/manage subscription/i)).toBeInTheDocument()
  })

  it('renders activate button when no license', () => {
    render(<Popup />)
    expect(screen.getByText('Activate')).toBeInTheDocument()
  })
})
