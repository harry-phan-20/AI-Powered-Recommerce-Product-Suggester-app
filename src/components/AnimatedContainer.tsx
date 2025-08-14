import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { Box } from '@radix-ui/themes'

interface AnimatedContainerProps {
  children: ReactNode
  isVisible: boolean
  delay?: number
  className?: string
  testMode?: boolean
}

export function AnimatedContainer({ 
  children, 
  isVisible, 
  delay = 0, 
  className,
  testMode = false
}: AnimatedContainerProps) {
  const [shouldRender, setShouldRender] = useState(testMode ? true : false)
  const [isAnimating, setIsAnimating] = useState(testMode ? true : false)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShouldRender(true)
        setIsAnimating(true)
      }, delay)
      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible, delay])

  if (!shouldRender) return null

  return (
    <Box
      className={className}
      style={{
        opacity: isAnimating ? 1 : 0,
        transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
        transition: testMode ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </Box>
  )
}

export function FadeInContainer({ 
  children, 
  isVisible, 
  delay = 0,
  testMode = false
}: AnimatedContainerProps) {
  return (
    <AnimatedContainer isVisible={isVisible} delay={delay} testMode={testMode}>
      {children}
    </AnimatedContainer>
  )
}

export function SlideUpContainer({ 
  children, 
  isVisible, 
  delay = 0,
  testMode = false
}: AnimatedContainerProps) {
  return (
    <AnimatedContainer isVisible={isVisible} delay={delay} testMode={testMode}>
      {children}
    </AnimatedContainer>
  )
}
