'use client'

import { Button } from '@/components/ui/button'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { InfiniteMarquee } from './InfiniteMarquee'

export function MaximalistHero() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#FFFBF7] pt-20">

      {/* Background Noise/Grid - CSS handled globally or inline for now */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="flex flex-col items-center text-center">

          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2 text-lg font-bold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span className="uppercase tracking-wider">The All-in-One Workspace</span>
          </motion.div>

          {/* Main Headline - MAXIMALIST TYPOGRAPHY */}
          <div className="relative mb-8">
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="text-7xl md:text-9xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter text-black uppercase"
            >
              Ship <br />
              <span className="text-orange-500">Faster</span>
            </motion.h1>

            {/* Floating Elements attached to text */}
            <motion.div
              style={{ y: y2, rotate: -10 }}
              className="absolute -top-10 -right-4 md:-right-20 w-32 h-32 md:w-48 md:h-48 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl rotate-12 z-[-1]"
            >
              <div className="text-center leading-tight">
                Stop<br/>Juggling
              </div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-xl text-xl md:text-2xl font-medium text-gray-800 mb-10 leading-relaxed border-l-4 border-orange-500 pl-6 text-left"
          >
            Collaborate, design, and manage projects in one chaotic-good workspace.
            <span className="bg-orange-200 px-1 mx-1">Docs</span> +
            <span className="bg-orange-200 px-1 mx-1">Tasks</span> +
            <span className="bg-orange-200 px-1 mx-1">Whiteboards</span>.
          </motion.p>

          <div className="flex flex-col md:flex-row gap-6 items-center">
             <Link href="/auth/signin">
               <Button className="h-16 px-10 text-xl font-black uppercase tracking-wider bg-orange-600 text-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000000] transition-all rounded-none">
                 Get Started Free <ArrowRight className="ml-2 w-6 h-6" />
               </Button>
             </Link>
             <Link href="#demo">
               <Button variant="outline" className="h-16 px-10 text-xl font-bold uppercase tracking-wider bg-white text-black border-2 border-black shadow-[6px_6px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000000] transition-all rounded-none">
                 Watch Demo
               </Button>
             </Link>
          </div>

        </div>
      </div>



      {/* Marquee at bottom of Hero */}
      <div className="mt-20 border-y-4 border-black bg-white rotate-1 scale-105">
        <InfiniteMarquee items={['DESIGN', 'BUILD', 'SHIP', 'REPEAT', 'COLLABORATE']} speed="slow" />
      </div>

    </section>
  )
}
