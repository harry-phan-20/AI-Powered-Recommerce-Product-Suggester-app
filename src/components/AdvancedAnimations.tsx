import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { Box } from '@radix-ui/themes'

interface ParallaxContainerProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function ParallaxContainer({ children, speed = 0.5, className }: ParallaxContainerProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset
      setOffset(scrolled * speed)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <Box
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {children}
    </Box>
  )
}

interface StaggeredChildrenProps {
  children: ReactNode[]
  delay?: number
  className?: string
}

export function StaggeredChildren({ children, delay = 100, className }: StaggeredChildrenProps) {
  return (
    <>
      {children.map((child, index) => (
        <Box
          key={index}
          className={className}
          style={{
            animationDelay: `${index * delay}ms`,
            animation: 'fadeInUp 0.6s ease-out forwards',
            opacity: 0,
            transform: 'translateY(20px)'
          }}
        >
          {child}
          <style>
            {`
              @keyframes fadeInUp {
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
        </Box>
      ))}
    </>
  )
}

interface FloatingElementProps {
  children: ReactNode
  amplitude?: number
  frequency?: number
  className?: string
}

export function FloatingElement({ 
  children, 
  amplitude = 10, 
  frequency = 2, 
  className 
}: FloatingElementProps) {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.05)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const y = Math.sin(time * frequency) * amplitude

  return (
    <Box
      className={className}
      style={{
        transform: `translateY(${y}px)`,
        transition: 'transform 0.05s ease-out'
      }}
    >
      {children}
    </Box>
  )
}

interface RippleButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function RippleButton({ children, onClick, className, disabled }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [nextId, setNextId] = useState(0)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = { id: nextId, x, y }
    setRipples(prev => [...prev, newRipple])
    setNextId(prev => prev + 1)

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)

    onClick?.()
  }

  return (
    <Box
      className={className}
      onClick={handleClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
    >
      {children}
      {ripples.map(ripple => (
        <Box
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x - 25,
            top: ripple.y - 25,
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            transform: 'scale(0)',
            animation: 'ripple 0.6s ease-out forwards'
          }}
        >
          <style>
            {`
              @keyframes ripple {
                to {
                  transform: scale(4);
                  opacity: 0;
                }
              }
            `}
          </style>
        </Box>
      ))}
    </Box>
  )
}

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
}

export function TypewriterText({ text, speed = 50, className }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, speed])

  return (
    <Box className={className}>
      {displayText}
      <Box
        style={{
          display: 'inline-block',
          width: 2,
          height: '1em',
          background: 'currentColor',
          marginLeft: 4,
          animation: 'blink 1s infinite'
        }}
      >
        <style>
          {`
            @keyframes blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0; }
            }
          `}
        </style>
      </Box>
    </Box>
  )
}
