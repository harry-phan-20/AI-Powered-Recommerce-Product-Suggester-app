import { Box } from '@radix-ui/themes'
import { MagicWandIcon } from '@radix-ui/react-icons'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
}

export function LoadingSpinner({ size = 'medium', text }: LoadingSpinnerProps) {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32
  }

  const iconSize = sizeMap[size]

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Box
        style={{
          animation: 'spin 1s linear infinite',
          transformOrigin: 'center'
        }}
      >
        <MagicWandIcon width={iconSize} height={iconSize} />
      </Box>
      {text && (
        <Box
          style={{
            fontSize: size === 'small' ? '14px' : size === 'medium' ? '16px' : '18px',
            color: 'var(--gray-11)'
          }}
        >
          {text}
        </Box>
      )}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  )
}

export function PulseDot() {
  return (
    <Box
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'var(--accent-9)',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
        `}
      </style>
    </Box>
  )
}
