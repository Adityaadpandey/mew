/**
 * Mew Design System
 * Custom brand colors and design tokens
 */

export const colors = {
  // Brand Colors
  brand: {
    orange: '#E85002',        // Primary Orange
    black: '#000000',         // Pure Black
    offWhite: '#F9F9F9',      // Off White
    darkGray: '#333333',      // Dark Gray
    mediumGray: '#A7A7A7',    // Medium Gray
    gray: '#646464',          // Gray
    gradientFrom: '#C10801',  // Gradient Start (Dark Red)
    gradientTo: '#F16001',    // Gradient End (Orange)
    beige: '#D9C3AB',         // Accent Beige
  },
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Project Colors (using variations of brand colors)
  projects: [
    { name: 'orange', gradient: 'from-[#E85002] to-[#F16001]', bg: 'bg-[#E85002]/10', text: 'text-[#E85002]', border: 'border-[#E85002]/20' },
    { name: 'red', gradient: 'from-[#C10801] to-[#E85002]', bg: 'bg-[#C10801]/10', text: 'text-[#C10801]', border: 'border-[#C10801]/20' },
    { name: 'beige', gradient: 'from-[#D9C3AB] to-[#E85002]', bg: 'bg-[#D9C3AB]/10', text: 'text-[#D9C3AB]', border: 'border-[#D9C3AB]/20' },
    { name: 'gray', gradient: 'from-[#646464] to-[#333333]', bg: 'bg-[#646464]/10', text: 'text-[#646464]', border: 'border-[#646464]/20' },
    { name: 'darkOrange', gradient: 'from-[#C10801] to-[#F16001]', bg: 'bg-[#F16001]/10', text: 'text-[#F16001]', border: 'border-[#F16001]/20' },
    { name: 'lightGray', gradient: 'from-[#A7A7A7] to-[#646464]', bg: 'bg-[#A7A7A7]/10', text: 'text-[#A7A7A7]', border: 'border-[#A7A7A7]/20' },
  ],
  
  // Task Priority Colors
  priority: {
    low: { bg: 'bg-[#A7A7A7]/10', text: 'text-[#646464]', border: 'border-[#A7A7A7]/20' },
    medium: { bg: 'bg-[#E85002]/10', text: 'text-[#E85002]', border: 'border-[#E85002]/20' },
    high: { bg: 'bg-[#F16001]/10', text: 'text-[#F16001]', border: 'border-[#F16001]/20' },
    urgent: { bg: 'bg-[#C10801]/10', text: 'text-[#C10801]', border: 'border-[#C10801]/20' },
  },
  
  // Task Status Colors
  status: {
    TODO: { bg: 'bg-[#A7A7A7]/10', text: 'text-[#646464]', dot: 'bg-[#A7A7A7]' },
    IN_PROGRESS: { bg: 'bg-[#E85002]/10', text: 'text-[#E85002]', dot: 'bg-[#E85002]' },
    DONE: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', dot: 'bg-[#10B981]' },
    BLOCKED: { bg: 'bg-[#C10801]/10', text: 'text-[#C10801]', dot: 'bg-[#C10801]' },
  },
} as const

export const gradients = {
  primary: 'linear-gradient(135deg, #C10801 0%, #F16001 100%)',
  primaryHover: 'linear-gradient(135deg, #A00701 0%, #D15001 100%)',
  subtle: 'linear-gradient(135deg, rgba(193, 8, 1, 0.1) 0%, rgba(241, 96, 1, 0.1) 100%)',
  orangeGlow: 'linear-gradient(135deg, #E85002 0%, #F16001 100%)',
}

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const

export const borderRadius = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  orange: '0 10px 30px -5px rgba(232, 80, 2, 0.3)',
  glow: '0 0 20px rgba(232, 80, 2, 0.3)',
} as const

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '500ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const

export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
    mono: 'var(--font-mono), ui-monospace, monospace',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const

// Animation variants for Framer Motion
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  
  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
} as const

// Utility function to get project color by index
export function getProjectColor(index: number) {
  return colors.projects[index % colors.projects.length]
}

// Utility function to get priority color
export function getPriorityColor(priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') {
  const map = {
    LOW: colors.priority.low,
    MEDIUM: colors.priority.medium,
    HIGH: colors.priority.high,
    URGENT: colors.priority.urgent,
  }
  return map[priority]
}

// Utility function to get status color
export function getStatusColor(status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED') {
  return colors.status[status]
}

// Glass morphism utility
export const glassMorphism = {
  light: 'bg-white/70 backdrop-blur-xl border border-[#A7A7A7]/20',
  dark: 'bg-[#333333]/70 backdrop-blur-xl border border-[#646464]/50',
  card: 'bg-white/80 dark:bg-[#333333]/80 backdrop-blur-xl border border-[#A7A7A7]/20 dark:border-[#646464]/50',
} as const

// Card hover effects
export const cardHover = {
  base: 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
  premium: 'transition-all duration-300 hover:shadow-orange hover:-translate-y-2 hover:scale-[1.02]',
} as const
