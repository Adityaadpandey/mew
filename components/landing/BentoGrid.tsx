'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowUpRight, FileText, Layout, Sparkles, Users, Zap } from 'lucide-react'

const features = [
  {
    title: "Kanban Chaos",
    description: "Organize tasks with drag-and-drop fury.",
    icon: Layout,
    className: "md:col-span-2 bg-orange-500 text-white",
  },
  {
    title: "Instant Docs",
    description: "Write at the speed of thought.",
    icon: FileText,
    className: "bg-white text-black",
  },
  {
    title: "Multiplayer",
    description: "See everyone's cursor. Total mayhem.",
    icon: Users,
    className: "bg-white text-black",
  },
  {
    title: "AI Power",
    description: "Generate nonsense (and useful stuff) instantly.",
    icon: Sparkles,
    className: "md:col-span-2 bg-black text-white border-white",
  },
  {
    title: "Lightning Fast",
    description: "0ms latency (mostly).",
    icon: Zap,
    className: "bg-orange-100 text-orange-900 border-orange-500",
  },
]

export function BentoGrid() {
  return (
    <section className="py-24 bg-[#FFFBF7] px-4">
      <div className="container mx-auto">

        <div className="mb-16 border-b-4 border-black pb-8">
            <h2 className="text-6xl md:text-8xl font-black uppercase text-black tracking-tighter mb-4">
                Power <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Tools</span>
            </h2>
            <p className="text-xl font-bold font-mono text-gray-500 uppercase tracking-widest">
                {`// Everything you need to ship`}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 auto-rows-[300px]">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 0.98, rotate: i % 2 === 0 ? 1 : -1 }}
              className={cn(
                "group relative p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden transition-all rounded-xl",
                feature.className
              )}
            >
              <div className="absolute top-4 right-4">
                <ArrowUpRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center mb-4">
                <feature.icon className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-3xl font-black uppercase mb-2 leading-none">{feature.title}</h3>
                <p className="font-medium text-lg opacity-80">{feature.description}</p>
              </div>

              <div className="absolute inset-0 border-4 border-transparent group-hover:border-white/20 pointer-events-none transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
