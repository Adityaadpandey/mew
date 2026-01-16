/**
 * Mew Design System
 * Custom brand colors and design tokens - Orange/Red SaaS Theme
 */

export const colors = {
  // Brand Colors - Orange/Red Theme
  brand: {
    primary: '#E85002',       // Primary Orange
    primaryLight: '#F16001',  // Light Orange
    primaryDark: '#C10801',   // Dark Red
    secondary: '#D9C3AB',     // Beige/Tan
    accent: '#F16001',        // Accent Orange
    black: '#000000',         // Pure Black
    offWhite: '#F9F9F9',      // Off White
    darkGray: '#333333',      // Dark Gray
    mediumGray: '#A7A7A7',    // Medium Gray
    gray: '#646464',          // Gray
    gradientFrom: '#C10801',  // Gradient Start (Dark Red)
    gradientMid: '#E85002',   // Gradient Mid (Primary Orange)
    gradientTo: '#F16001',    // Gradient End (Light Orange)
    gradientAlt: '#D9C3AB',   // Gradient Alt (Beige)
  },

  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Project Colors (using brand colors)
  projects: [
    { name: 'orange', gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
    { name: 'red', gradient: 'from-red-500 to-rose-500', bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
    { name: 'amber', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    { name: 'rose', gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
    { name: 'emerald', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    { name: 'blue', gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
    { name: 'cyan', gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
    { name: 'slate', gradient: 'from-slate-500 to-gray-500', bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' },
  ],

  // Task Priority Colors - Orange themed
  priority: {
    low: { bg: 'bg-zinc-500/10', text: 'text-zinc-500', border: 'border-zinc-500/20' },
    medium: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    high: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
    urgent: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  },

  // Task Status Colors
  status: {
    TODO: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', dot: 'bg-zinc-400' },
    IN_PROGRESS: { bg: 'bg-orange-500/10', text: 'text-orange-500', dot: 'bg-orange-500' },
    DONE: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
    BLOCKED: { bg: 'bg-rose-500/10', text: 'text-rose-500', dot: 'bg-rose-500' },
  },
} as const

export const gradients = {
  primary: 'linear-gradient(135deg, #C10801 0%, #F16001 100%)',
  primaryHover: 'linear-gradient(135deg, #A00601 0%, #E85002 100%)',
  subtle: 'linear-gradient(135deg, rgba(232, 80, 2, 0.1) 0%, rgba(241, 96, 1, 0.1) 100%)',
  brand: 'linear-gradient(135deg, #000000 0%, #C10801 50%, #F16001 100%)',
  warm: 'linear-gradient(135deg, #C10801 0%, #E85002 50%, #D9C3AB 100%)',
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
  red: '0 10px 30px -5px rgba(193, 8, 1, 0.3)',
  glow: '0 0 20px rgba(232, 80, 2, 0.3)',
  glowStrong: '0 0 40px rgba(232, 80, 2, 0.4)',
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
  light: 'bg-white/70 backdrop-blur-xl border border-gray-200/20',
  dark: 'bg-zinc-900/70 backdrop-blur-xl border border-zinc-700/20',
  card: 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200/20 dark:border-zinc-700/20',
  brand: 'bg-orange-500/5 backdrop-blur-xl border border-orange-500/20',
} as const

// Card hover effects
export const cardHover = {
  base: 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
  premium: 'transition-all duration-300 hover:shadow-orange hover:-translate-y-2 hover:scale-[1.02]',
  glow: 'transition-all duration-300 hover:shadow-glow hover:-translate-y-1',
} as const

// Button gradients
export const buttonGradients = {
  primary: 'bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002] text-white',
  secondary: 'bg-gradient-to-r from-[#E85002] to-[#D9C3AB] hover:from-[#C10801] hover:to-[#E85002] text-white',
  subtle: 'bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20',
  dark: 'bg-gradient-to-r from-[#000000] to-[#333333] hover:from-[#1a1a1a] hover:to-[#404040] text-white',
} as const
