/**
 * Mew Design System
 * World-class design tokens and utilities for consistent UI
 */

export const colors = {
  // Brand Colors
  brand: {
    primary: 'hsl(243 75% 59%)',      // Vibrant purple
    secondary: 'hsl(262 83% 58%)',    // Deep purple
    accent: 'hsl(204 94% 94%)',       // Light blue
    success: 'hsl(142 76% 36%)',      // Green
    warning: 'hsl(38 92% 50%)',       // Orange
    error: 'hsl(0 84% 60%)',          // Red
    info: 'hsl(199 89% 48%)',         // Blue
  },
  
  // Project Colors (for cards and visual distinction)
  projects: [
    { name: 'violet', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20' },
    { name: 'blue', gradient: 'from-blue-500 to-cyan-600', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
    { name: 'emerald', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    { name: 'orange', gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
    { name: 'pink', gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' },
    { name: 'indigo', gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
    { name: 'cyan', gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
    { name: 'fuchsia', gradient: 'from-fuchsia-500 to-purple-600', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-500', border: 'border-fuchsia-500/20' },
  ],
  
  // Task Priority Colors
  priority: {
    low: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' },
    medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
    urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  },
  
  // Task Status Colors
  status: {
    TODO: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
    IN_PROGRESS: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    DONE: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
    BLOCKED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  },
} as const

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
  glow: '0 0 20px rgb(139 92 246 / 0.3)',
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
  light: 'bg-white/70 backdrop-blur-xl border border-slate-200/50',
  dark: 'bg-neutral-900/70 backdrop-blur-xl border border-neutral-800/50',
  card: 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-800/50',
} as const

// Card hover effects
export const cardHover = {
  base: 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
  premium: 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]',
} as const
