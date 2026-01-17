'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { BentoGrid } from './Bento_Grid'
import { InfiniteMarquee } from './InfiniteMarquee'
import { MaximalistHero } from './MaximalistHero'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7] selection:bg-orange-500 selection:text-white overflow-x-hidden font-sans">
      <main>
        <MaximalistHero />

        {/* Divider Marquee */}
        <div className="bg-black py-4 border-y-4 border-black rotate-[-1deg] scale-105 z-20 relative shadow-xl">
           <InfiniteMarquee items={['NO BLOAT', 'JUST SHIP', 'ROCKET FUEL', 'CHAOS MODE', 'BUILD NOW']} speed="fast" />
        </div>

        <BentoGrid />

        {/* Big Footer CTA */}
        <section className="py-32 bg-orange-600 relative overflow-hidden flex items-center justify-center text-center">
            {/* Background Pattern */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}></div>

            <div className="relative z-10 px-4">
                <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter mb-10 drop-shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
                    Ready to <br/> Ship?
                </h2>
                <Link href="/auth/signin">
                    <Button className="h-20 px-16 text-2xl font-black uppercase tracking-wider bg-white text-black border-4 border-black shadow-[10px_10px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition-all rounded-none">
                        Start For Free <ArrowRight className="ml-4 w-8 h-8" />
                    </Button>
                </Link>
            </div>
        </section>

        {/* Simple Footer */}
        <footer className="bg-black text-white py-12 border-t-4 border-black">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="text-2xl font-black mb-4 md:mb-0">MEW.</div>
            </div>
        </footer>
      </main>
    </div>
  )
}
