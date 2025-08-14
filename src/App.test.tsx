import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

describe('App Integration Tests', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeDefined()
  })

  it('contains the main heading', () => {
    const { container } = render(<App />)
    expect(container.textContent).toContain('AI-Powered Recommerce Product Suggester')
  })
})
