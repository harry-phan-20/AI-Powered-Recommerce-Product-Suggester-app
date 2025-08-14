import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { CATEGORIES } from './categories'

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))

// Validation schemas
const suggestionSchema = z.object({
  name: z.string().min(2).max(100),
  condition: z.enum(['Like New', 'Good', 'Fair']),
  notes: z.string().max(500).optional()
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Main suggestion endpoint
app.post('/api/suggest', async (req, res) => {
  try {
    // Validate input
    const validation = suggestionSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validation.error.issues
      })
    }

    const { name, condition, notes } = validation.data

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({
        error: 'AI service not configured',
        code: 'SERVICE_UNAVAILABLE'
      })
    }

    // Generate suggestions using Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = [
      'You are a marketplace listing assistant for second-hand electronics.',
      'Tasks:',
      '1) Write a concise, compelling marketing description (max 80 words).',
      '2) Pick the best category from the provided list. Return JSON with keys marketingText and category.',
      `Allowed categories: ${CATEGORIES.join(' | ')}`,
      `Item: ${name}`,
      `Condition: ${condition}`,
      `Notes: ${notes || ''}`,
      'Return JSON only.'
    ].join('\n')

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    if (!text) {
      throw new Error('AI model returned empty response')
    }

    // Parse AI response
    const parsed = safeParseJson(text)
    if (!parsed || typeof parsed.marketingText !== 'string' || typeof parsed.category !== 'string') {
      throw new Error('Failed to parse AI response')
    }

    // Normalize category
    const normalizedCategory = chooseCategory(parsed.category)

    res.json({
      marketingText: parsed.marketingText,
      category: normalizedCategory
    })

  } catch (error) {
    console.error('Suggestion generation error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID')) {
        return res.status(500).json({
          error: 'AI service configuration error',
          code: 'SERVICE_CONFIG_ERROR'
        })
      }
      
      if (error.message.includes('QUOTA_EXCEEDED')) {
        return res.status(429).json({
          error: 'AI service quota exceeded',
          code: 'QUOTA_EXCEEDED'
        })
      }
    }

    res.status(500).json({
      error: 'Failed to generate suggestions',
      code: 'INTERNAL_ERROR'
    })
  }
})

// Category selection logic
function chooseCategory(candidate: string): string {
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

function jaccard(a: string, b: string): number {
  const sa = new Set(a.split(/[^a-z0-9]+/i).filter(Boolean))
  const sb = new Set(b.split(/[^a-z0-9]+/i).filter(Boolean))
  const intersection = new Set([...sa].filter(x => sb.has(x)))
  const union = new Set([...sa, ...sb])
  return union.size === 0 ? 0 : intersection.size / union.size
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

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🎯 Suggestions: http://localhost:${PORT}/api/suggest`)
})

export default app
