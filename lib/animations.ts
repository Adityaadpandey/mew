/**
 * Mew Animation Presets
 * Advanced motion variants for Framer Motion
 */

import type { Variants, Transition } from 'framer-motion'

// Easing curves
export const easings = {
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  spring: [0.16, 1, 0.3, 1] as const,
  snappy: [0.4, 0, 0.2, 1] as const,
  elastic: [0.175, 0.885, 0.32, 1.275] as const,
} as const

// Default transitions
export const transitions = {
  fast: { duration: 0.15, ease: easings.snappy } as Transition,
  base: { duration: 0.2, ease: easings.smooth } as Transition,
  slow: { duration: 0.4, ease: easings.smooth } as Transition,
  spring: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  bouncy: { type: 'spring', stiffness: 400, damping: 17 } as Transition,
} as const

// List animations with stagger
export const listContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
}

export const listItem: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.base,
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.98,
    transition: transitions.fast,
  },
}

// Card animations
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.spring,
    },
  },
  hover: {
    y: -4,
    scale: 1.01,
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
    transition: transitions.spring,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
}

// Modal/Dialog animations
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
}

// Dropdown/Menu animations
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: easings.snappy,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -5,
    transition: { duration: 0.1 },
  },
}

// Toast/Notification animations
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.bouncy,
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

// Slide animations
export const slideFromRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

export const slideFromLeft: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

export const slideFromBottom: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

// Button micro-interactions
export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.02, transition: transitions.fast },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
}

export const iconButtonVariants: Variants = {
  idle: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, transition: transitions.fast },
  tap: { scale: 0.9, transition: { duration: 0.1 } },
}

// Pulse animation for notifications
export const pulseVariants: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
}

// Skeleton loading shimmer
export const shimmerVariants: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'linear',
    },
  },
}

// Check/Success animation
export const checkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: 'spring', duration: 0.5, bounce: 0 },
      opacity: { duration: 0.05 },
    },
  },
}

// Circle draw animation
export const circleVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: 'easeInOut' },
      opacity: { duration: 0.05 },
    },
  },
}

// Tab/Segment indicator
export const tabIndicator: Variants = {
  initial: {},
  animate: {
    transition: { type: 'spring', stiffness: 500, damping: 35 },
  },
}

// Progress bar
export const progressVariants: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (custom: number) => ({
    scaleX: custom / 100,
    transition: { duration: 0.5, ease: easings.smooth },
  }),
}

// Floating animation (for icons, badges)
export const floatingVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    },
  },
}

// Rotate animations
export const spinVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'linear',
    },
  },
}

// Attention/Shake animation
export const shakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
}

// Glow pulse for CTAs
export const glowVariants: Variants = {
  initial: { boxShadow: '0 0 0 0 rgba(232, 80, 2, 0)' },
  glow: {
    boxShadow: [
      '0 0 0 0 rgba(232, 80, 2, 0.4)',
      '0 0 0 15px rgba(232, 80, 2, 0)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
}

// Scale pop (for new items)
export const popVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

// Collapse/Expand
export const collapseVariants: Variants = {
  collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
  expanded: {
    height: 'auto',
    opacity: 1,
    overflow: 'visible',
    transition: {
      height: { type: 'spring', stiffness: 500, damping: 35 },
      opacity: { duration: 0.2, delay: 0.1 },
    },
  },
}

// Flip animation
export const flipVariants: Variants = {
  initial: { rotateY: 0 },
  flip: {
    rotateY: 180,
    transition: { duration: 0.6, ease: easings.smooth },
  },
}

// Counter animation helper
export const counterVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

// Layout animations
export const layoutTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
} as const
