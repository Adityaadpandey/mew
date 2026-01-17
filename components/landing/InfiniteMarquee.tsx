'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function InfiniteMarquee({
  items,
  direction = 'left',
  speed = 'normal',
  className
}: {
  items: string[] | React.ReactNode[]
  direction?: 'left' | 'right'
  speed?: 'slow' | 'normal' | 'fast'
  className?: string
}) {
  const duration = {
    slow: 40,
    normal: 20,
    fast: 10,
  }[speed]

  return (
    <div className={cn("relative flex overflow-hidden user-select-none", className)}>
      <motion.div
        initial={{ x: direction === 'left' ? 0 : '-100%' }}
        animate={{ x: direction === 'left' ? '-100%' : 0 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        className="flex min-w-full shrink-0 items-center justify-around gap-8 whitespace-nowrap py-8"
      >
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-8">
             <span className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 stroke-2 border-text opacity-50 uppercase tracking-tighter">
              {item}
             </span>
             <span className="text-4xl text-orange-500">★</span>
          </div>
        ))}
      </motion.div>
      <motion.div
        initial={{ x: direction === 'left' ? 0 : '-100%' }}
        animate={{ x: direction === 'left' ? '-100%' : 0 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        className="flex min-w-full shrink-0 items-center justify-around gap-8 whitespace-nowrap py-8"
      >
        {items.map((item, i) => (
          <div key={`clone-${i}`} className="flex items-center gap-8">
             <span className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 stroke-2 border-text opacity-50 uppercase tracking-tighter">
              {item}
             </span>
             <span className="text-4xl text-orange-500">★</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
