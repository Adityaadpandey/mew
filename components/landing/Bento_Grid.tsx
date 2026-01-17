'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { FileText, GitBranch, Layout, Sparkles } from 'lucide-react'

// --- VISUALIZATIONS ---

const DualModeVisual = () => (
  <div className="w-full h-full p-4 flex gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
    {/* Docs Side */}
    <div className="w-1/2 h-full bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col gap-2 relative z-10">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <div className="w-12 h-2 bg-gray-200 rounded" />
        </div>
        <div className="w-full h-2 bg-gray-100 rounded" />
        <div className="w-3/4 h-2 bg-gray-100 rounded" />
        <div className="w-full h-2 bg-gray-100 rounded" />
    </div>

    {/* Diagram Side */}
    <div className="w-1/2 h-full bg-[#111] border border-gray-800 rounded-lg p-3 shadow-md flex items-center justify-center relative z-20 -ml-8 mt-6">
        <div className="absolute top-2 right-2">
             <GitBranch className="w-4 h-4 text-orange-500" />
        </div>
        <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded border-2 border-white/20 bg-white/5" />
            <div className="w-0.5 h-4 bg-white/20" />
            <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/5" />
                <div className="w-8 h-8 rotate-45 border-2 border-white/20 bg-white/5" />
            </div>
        </div>
    </div>
  </div>
)

const DocsVisual = () => (
    <div className="w-full h-full p-6 flex flex-col gap-2 opacity-60 group-hover:opacity-100 transition-opacity font-mono text-xs">
        <div className="flex items-center gap-2 text-gray-400">
            <span>#</span> <span className="text-black font-bold">Meeting Notes</span>
        </div>
        <div className="h-2" />
        <div className="flex items-center gap-2 text-gray-400">
            <span>-</span> <span className="text-gray-800">Discuss Q3 roadmap</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
            <span>-</span> <span className="text-gray-800">Review designs</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 bg-orange-100 w-fit px-1">
             <span>/</span> <span className="text-orange-600 font-bold">todo</span>
             <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-1.5 h-3 bg-orange-600 ml-1"
             />
        </div>
    </div>
)

const MultiplayerVisual = () => (
    <div className="relative w-full h-full opacity-60 group-hover:opacity-100 transition-opacity">
        {/* Cursor 1 */}
        <motion.div
            animate={{ x: [10, 80, 20], y: [10, 40, 80] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 z-10"
        >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19177L11.7841 12.3673H5.65376Z" fill="#F97316" stroke="white"/>
             </svg>
             <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] px-1 rounded">Ash</div>
        </motion.div>
         {/* Cursor 2 */}
         <motion.div
            animate={{ x: [100, 30, 90], y: [80, 20, 50] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-0 left-0 z-10"
        >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19177L11.7841 12.3673H5.65376Z" fill="#EF4444" stroke="white"/>
             </svg>
             <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] px-1 rounded">Alex</div>
        </motion.div>
    </div>
)

const AIVisual = () => (
    <div className="w-full h-full flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
        <div className="relative">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-400 to-red-600 blur-xl opacity-50 absolute -top-4 -left-4"
            />
             <Sparkles className="w-16 h-16 text-white relative z-10" />
             <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/20 text-[10px] text-white whitespace-nowrap">
                "Diagram a DB schema..."
             </div>
        </div>
    </div>
)

const CanvasVisual = () => (
    <div className="w-full h-full opacity-50 group-hover:opacity-100 transition-opacity relative overflow-hidden bg-[#fafafa]">
        {/* Dot Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        {/* Panning Element */}
        <motion.div
            animate={{ x: [-20, -150], y: [-20, -80] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
            className="absolute inset-0"
        >
             {/* Node 1 */}
             <div className="absolute top-10 left-10 w-24 h-20 border-2 border-black rounded-xl bg-white shadow-lg flex items-center justify-center relative z-10">
                <Layout className="w-8 h-8 text-gray-400" />
                <div className="absolute -bottom-6 text-[10px] font-mono bg-black/10 px-1 rounded">Start</div>
             </div>

             {/* Connection Line 1 */}
             <svg className="absolute top-20 left-32 w-40 h-20 overflow-visible z-0">
                 <path d="M0,0 C80,0 80,60 160,60" fill="none" stroke="black" strokeWidth="2" strokeDasharray="4 4" />
             </svg>

             {/* Node 2 */}
             <div className="absolute top-40 left-72 w-32 h-24 border-2 border-orange-500 rounded-xl bg-orange-50 flex flex-col items-center justify-center font-bold text-orange-600 shadow-xl z-10">
                <span className="text-sm">Process Data</span>
                <div className="w-full h-1 bg-orange-200 mt-2" />
                <div className="w-2/3 h-1 bg-orange-200 mt-1" />
             </div>

             {/* Connection Line 2 */}
             <svg className="absolute top-52 left-[400px] w-32 h-20 overflow-visible z-0">
                 <path d="M0,0 C60,0 60,-40 120,-40" fill="none" stroke="#F97316" strokeWidth="2" />
             </svg>

             {/* Node 3 */}
             <div className="absolute top-20 left-[530px] w-20 h-20 border-2 border-gray-300 rounded-full bg-white flex items-center justify-center z-10">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
             </div>
        </motion.div>
    </div>
)


const features = [
  {
    title: "Docs + Diagrams",
    description: "Switch distinct modes instantly. One source of truth.",
    visual: DualModeVisual,
    className: "md:col-span-2 bg-[#F5F5F4] text-black",
  },
  {
    title: "Markdown Native",
    description: "Type / to insert anything. Keyboard first.",
    visual: DocsVisual,
    className: "md:col-span-1 bg-white text-black border-2 border-gray-100",
  },
  {
    title: "AI Assistant",
    description: "Generate diagrams from text prompts.",
    visual: AIVisual,
    className: "md:col-span-1 bg-black text-white",
  },
  {
    title: "Infinite Canvas",
    description: "Map out systems without borders.",
    visual: CanvasVisual,
    className: "md:col-span-2 bg-orange-50 text-orange-900 border-2 border-orange-100",
  },
]

export function BentoGrid() {
  return (
    <section className="py-24 bg-[#FFFBF7] px-4">
      <div className="container mx-auto">
        {/* Glass overlay wrapper */}
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/40 p-12 shadow-xl">
          <div className="container mx-auto px-4 relative z-10 mb-16 text-center">
            <h2 className="text-6xl md:text-8xl font-black uppercase text-black tracking-tighter mb-4">
              Power <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Tools</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, y: -5 }}
                className={cn(
                  "group relative flex flex-col justify-between overflow-hidden transition-all rounded-3xl shadow-sm hover:shadow-2xl",
                  feature.className
                )}
              >
                {/* Visual Canvas Area */}
                 <div className="h-1/2 w-full bg-transparent overflow-hidden relative">
                    <feature.visual />
                 </div>

                {/* Content Area */}
                <div className="p-8 relative z-20 bg-gradient-to-t from-black/5 to-transparent h-1/2 flex flex-col justify-end">
                  <h3 className="text-3xl font-black uppercase mb-3 leading-none tracking-tight">{feature.title}</h3>
                  <p className="font-medium text-lg opacity-70 leading-relaxed">{feature.description}</p>
                </div>

                {/* Hover shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
