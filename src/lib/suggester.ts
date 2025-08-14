import { GoogleGenerativeAI } from '@google/generative-ai'
import { CATEGORIES } from './categories'
import { apiClient, ApiError } from './api'
import type { FormInput, SuggestionResult } from './types'

export const buildPrompt = (input: FormInput): string => {
  const { name, condition, notes } = input
  return [
    'You are a marketplace listing assistant for second-hand electronics.',
    'Tasks:',
    '1) Write a concise, compelling marketing description (max 80 words).',
    '2) Pick the best category from the provided list. Return JSON with keys marketingText and category.',
    `Allowed categories: ${CATEGORIES.join(' | ')}`,
    `Item: ${name}`,
    `Condition: ${condition}`,
    `Notes: ${notes ?? ''}`,
    'Return JSON only.'
  ].join('\n')
}

const MODEL = 'gemini-1.5-flash'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        break
      }
      
      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.code?.startsWith('HTTP_4')) {
        break
      }
      
      // Exponential backoff with jitter
      const delayMs = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await delay(delayMs)
    }
  }
  
  throw lastError!
}

export async function generateSuggestions(input: FormInput): Promise<SuggestionResult> {
  try {
    // Try backend API first if available
    if (import.meta.env.VITE_BACKEND_URL) {
      try {
        return await retryWithBackoff(() => 
          apiClient.generateSuggestions(input)
        )
      } catch (error) {
        console.warn('Backend API failed, falling back to client-side:', error)
        // Fall through to client-side implementation
      }
    }
    
    // Client-side fallback
    return await retryWithBackoff(async () => {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (!apiKey) {
        throw new ApiError(
          'Missing Gemini API key. Please set VITE_GEMINI_API_KEY in your environment.',
          'MISSING_API_KEY'
        )
      }
      
      const client = new GoogleGenerativeAI(apiKey)
      const model = client.getGenerativeModel({ model: MODEL })
      const prompt = buildPrompt(input)
      
      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      
      if (!text) {
        throw new ApiError(
          'AI model returned empty response',
          'EMPTY_RESPONSE'
        )
      }
      
      const parsed = safeParseJson(text)
      if (!parsed) {
        throw new ApiError(
          'Failed to parse AI response. Please try again.',
          'PARSE_ERROR',
          { rawResponse: text }
        )
      }
      
      const marketingText = parsed.marketingText
      const category = parsed.category
      
      if (typeof marketingText !== 'string' || typeof category !== 'string') {
        throw new ApiError(
          'AI response missing required fields',
          'INVALID_RESPONSE_FORMAT',
          { parsed }
        )
      }
      
      if (!marketingText.trim() || !category.trim()) {
        throw new ApiError(
          'AI response contains empty required fields',
          'INVALID_RESPONSE_FORMAT',
          { parsed }
        )
      }
      
      const normalizedCategory = chooseCategory(category)
      return { 
        marketingText, 
        category: normalizedCategory 
      }
    })
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Handle specific Gemini API errors
    if (errorMessage.includes('API_KEY_INVALID')) {
      throw new ApiError(
        'Invalid API key. Please check your Gemini API key.',
        'INVALID_API_KEY'
      )
    }
    
    if (errorMessage.includes('QUOTA_EXCEEDED')) {
      throw new ApiError(
        'API quota exceeded. Please try again later.',
        'QUOTA_EXCEEDED'
      )
    }
    
    if (errorMessage.includes('MODEL_NOT_FOUND')) {
      throw new ApiError(
        'AI model not available. Please try again later.',
        'MODEL_UNAVAILABLE'
      )
    }
    
    // Generic error handling
    throw new ApiError(
      errorMessage || 'Failed to generate suggestions. Please try again.',
      'UNKNOWN_ERROR',
      error
    )
  }
}

export function chooseCategory(candidate: string): string {
  if (!candidate) return CATEGORIES[0]
  const lower = candidate.toLowerCase()
  
  // Find the most specific (longest) matching category
  const matches = CATEGORIES.filter(c => lower.includes(c.toLowerCase()))
  if (matches.length > 0) {
    return matches.reduce((longest, current) => 
      current.length > longest.length ? current : longest
    )
  }
  
  // Fallback to Jaccard similarity
  const best = CATEGORIES
    .map(c => ({ c, score: jaccard(lower, c.toLowerCase()) }))
    .sort((a, b) => b.score - a.score)[0]
  return best?.c ?? CATEGORIES[0]
}

function safeParseJson(text: string): Record<string, unknown> | null {
  try {
    const trimmed = text
      .replace(/^```json\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/```$/i, '')
      .trim()
    
    if (!trimmed) return null
    
    return JSON.parse(trimmed)
  } catch {
    return null
  }
}

function jaccard(a: string, b: string): number {
  const sa = new Set(a.split(/[^a-z0-9]+/i).filter(Boolean))
  const sb = new Set(b.split(/[^a-z0-9]+/i).filter(Boolean))
  const intersection = new Set([...sa].filter(x => sb.has(x)))
  const union = new Set([...sa, ...sb])
  return union.size === 0 ? 0 : intersection.size / union.size
}

// In production, route via a backend proxy to keep API keys server-side and add request auth & rate limiting.

