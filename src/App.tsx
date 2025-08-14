import { useState } from 'react'
import { Theme, Container, Heading, Text, Box, Flex, Button, TextField } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { Label } from '@radix-ui/react-label'
import * as Select from '@radix-ui/react-select'
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, MagicWandIcon, ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons'
import { generateSuggestions } from './lib/suggester'
import { ApiError } from './lib/api'
import { z } from 'zod'
import { FadeInContainer, SlideUpContainer } from './components/AnimatedContainer'
import { LoadingSpinner } from './components/LoadingSpinner'

const formSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  condition: z.enum(['Like New', 'Good', 'Fair']),
  notes: z.string().optional().default('')
})

type FormData = z.infer<typeof formSchema>

// Detect test environment
const isTestEnv = process.env.NODE_ENV === 'test' || import.meta.env.MODE === 'test'

function App() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    condition: 'Like New',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [marketingText, setMarketingText] = useState('')
  const [category, setCategory] = useState('')
  const [hasResults, setHasResults] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(false)
  }

  const onSuggest = async () => {
    setError(null)
    setSuccess(false)
    
    const parse = formSchema.safeParse(formData)
    if (!parse.success) {
      setError(parse.error.issues[0]?.message || 'Please fill in all required fields.')
      return
    }
    
    setLoading(true)
    try {
      const res = await generateSuggestions(formData)
      setMarketingText(res.marketingText)
      setCategory(res.category)
      setHasResults(true)
      setSuccess(true)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message)
      } else {
        setError(e instanceof Error ? e.message : 'Failed to generate suggestions')
      }
      setHasResults(false)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', condition: 'Like New', notes: '' })
    setError(null)
    setSuccess(false)
    setHasResults(false)
    setMarketingText('')
    setCategory('')
  }

  return (
    <Theme>
      <Container size="2">
        <FadeInContainer isVisible={true} delay={100} testMode={isTestEnv}>
          <Box py="5">
            <Heading as="h1" size="8" style={{ 
              background: 'linear-gradient(135deg, var(--accent-9), var(--accent-11))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              AI-Powered Recommerce Product Suggester
            </Heading>
            <Text as="p" size="3" color="gray" mt="2">
              Enter basic details to generate a marketing blurb and a suggested category.
            </Text>
          </Box>
        </FadeInContainer>

        <SlideUpContainer isVisible={true} delay={200} testMode={isTestEnv}>
          <Flex direction="column" gap="4" asChild>
            <form onSubmit={(e) => { e.preventDefault(); onSuggest() }} aria-label="Product form">
              <Box>
                <Label htmlFor="name">
                  Product Name *
                </Label>
                <TextField.Root 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)} 
                  placeholder="e.g., iPhone 12 Pro" 
                  required 
                  aria-required
                  size="3"
                  style={{ marginTop: 8 }}
                />
              </Box>
              
              <Box>
                <Label htmlFor="condition">
                  Condition *
                </Label>
                <Select.Root 
                  value={formData.condition} 
                  onValueChange={(v) => handleInputChange('condition', v as FormData['condition'])}
                >
                  <Select.Trigger id="condition" aria-label="Condition" style={{ marginTop: 8 }}>
                    <Select.Value placeholder="Select condition" />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content 
                      position="popper" 
                      sideOffset={5}
                      style={{
                        zIndex: 1000,
                        minWidth: 'var(--radix-select-trigger-width)',
                        backgroundColor: 'var(--gray-1)',
                        border: '1px solid var(--gray-6)',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden'
                      }}
                    >
                      <Select.ScrollUpButton>
                        <ChevronUpIcon />
                      </Select.ScrollUpButton>
                      <Select.Viewport>
                        {['Like New', 'Good', 'Fair'].map((c) => (
                          <Select.Item 
                            key={c} 
                            value={c}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              outline: 'none'
                            }}
                          >
                            <Select.ItemText>{c}</Select.ItemText>
                            <Select.ItemIndicator>
                              <CheckIcon />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                      <Select.ScrollDownButton>
                        <ChevronDownIcon />
                      </Select.ScrollDownButton>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </Box>
              
              <Box>
                <Label htmlFor="notes">
                  Notes (Optional)
                </Label>
                <TextField.Root 
                  id="notes" 
                  value={formData.notes} 
                  onChange={(e) => handleInputChange('notes', e.target.value)} 
                  placeholder="Slight scratch on corner, battery health 85%" 
                  size="3"
                  style={{ marginTop: 8 }}
                />
              </Box>

              <Flex gap="3" align="center" wrap="wrap">
                <Button 
                  type="submit" 
                  disabled={loading}
                  size="3"
                  style={{ 
                    background: 'var(--accent-9)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent-10)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--accent-9)'
                  }}
                >
                  {loading ? (
                    <LoadingSpinner size="small" text="Generating..." />
                  ) : (
                    <>
                      <MagicWandIcon />
                      Generate Suggestions
                    </>
                  )}
                </Button>
                
                {hasResults && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    size="3"
                  >
                    Reset Form
                  </Button>
                )}
              </Flex>

              {error && (
                <FadeInContainer isVisible={!!error} testMode={isTestEnv}>
                  <Box 
                    p="3" 
                    style={{ 
                      background: 'var(--red-2)', 
                      border: '1px solid var(--red-6)', 
                      borderRadius: 6,
                      color: 'var(--red-11)'
                    }}
                  >
                    <Flex gap="2" align="center">
                      <ExclamationTriangleIcon />
                      <Text>{error}</Text>
                    </Flex>
                  </Box>
                </FadeInContainer>
              )}

              {success && (
                <FadeInContainer isVisible={success} testMode={isTestEnv}>
                  <Box 
                    p="3" 
                    style={{ 
                      background: 'var(--green-2)', 
                      border: '1px solid var(--green-6)', 
                      borderRadius: 6,
                      color: 'var(--green-11)'
                    }}
                  >
                    <Flex gap="2" align="center">
                      <CheckCircledIcon />
                      <Text>Suggestions generated successfully!</Text>
                    </Flex>
                  </Box>
                </FadeInContainer>
              )}
            </form>
          </Flex>
        </SlideUpContainer>

        <FadeInContainer isVisible={hasResults} delay={100} testMode={isTestEnv}>
          <Box py="6">
            <Heading as="h2" size="6" mb="4">Results</Heading>
            
            <Flex direction="column" gap="4">
              <Box>
                <Text weight="bold" size="3" color="gray">Suggested Category:</Text>
                <Box 
                  mt="2" 
                  p="3" 
                  style={{ 
                    border: '1px solid var(--gray-6)', 
                    borderRadius: 8,
                    background: 'var(--gray-2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Text size="3">{category}</Text>
                </Box>
              </Box>
              
              <Box>
                <Text weight="bold" size="3" color="gray">Marketing Text:</Text>
                <Box 
                  mt="2" 
                  p="4" 
                  style={{ 
                    border: '1px solid var(--gray-6)', 
                    borderRadius: 8,
                    background: 'var(--gray-1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Text as="p" size="3" style={{ lineHeight: 1.6 }}>{marketingText}</Text>
                </Box>
              </Box>
            </Flex>
          </Box>
        </FadeInContainer>
      </Container>
      
      <style>
        {`
          [data-radix-select-content] {
            z-index: 1000 !important;
            position: relative !important;
          }
          
          [data-radix-select-item] {
            transition: background-color 0.2s ease;
          }
          
          [data-radix-select-item]:hover {
            background-color: var(--gray-3) !important;
          }
          
          [data-radix-select-item][data-highlighted] {
            background-color: var(--accent-3) !important;
            color: var(--accent-11) !important;
          }
          
          [data-radix-select-viewport] {
            padding: 4px 0;
          }
        `}
      </style>
    </Theme>
  )
}

export default App
