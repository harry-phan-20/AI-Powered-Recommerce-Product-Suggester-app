import { describe, it, expect } from 'vitest'
import { buildPrompt, chooseCategory } from './suggester'
import { CATEGORIES } from './categories'

describe('prompt generation', () => {
  it('contains item fields and allowed categories', () => {
    const prompt = buildPrompt({ name: 'iPhone 12 Pro', condition: 'Good', notes: '85% battery' })
    expect(prompt).toContain('iPhone 12 Pro')
    expect(prompt).toContain('Good')
    expect(prompt).toContain('Allowed categories:')
    expect(CATEGORIES.every(c => prompt.includes(c))).toBe(true)
  })
})

describe('category choice', () => {
  it('matches by inclusion', () => {
    const cat = chooseCategory('Electronics > Audio > Headphones and Earbuds')
    expect(cat).toBe('Electronics > Audio > Headphones')
  })
  it('falls back to closest match', () => {
    const cat = chooseCategory('phones')
    expect(CATEGORIES).toContain(cat)
  })
})


