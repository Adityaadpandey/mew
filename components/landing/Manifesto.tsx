'use client'

import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

export function Manifesto() {
  return (
    <section className="py-32 bg-black text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-600/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-600/20 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-12"
                >
                    <h2 className="text-2xl md:text-3xl font-mono text-orange-500 mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
                        <span>// THE MANIFESTO</span>
                        <ArrowDown className="w-6 h-6 animate-bounce" />
                    </h2>

                    <div className="space-y-12">
                        <p className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter">
                            CHAOS IS A <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 hover:text-white transition-colors duration-300 cursor-default">FEATURE</span>,
                            NOT A BUG.
                        </p>

                        <p className="text-xl md:text-3xl leading-relaxed font-medium text-gray-400 max-w-2xl ml-auto">
                            Most tools force you into boxes. They warn you about "clutter." They want you to be tidy.
                            <br/><br/>
                            <span className="text-white">We say: Break things.</span> Throw ideas on the wall. Connect tasks to drawings. Make a mess. That's where the best work happens.
                        </p>

                        <div className="text-4xl md:text-6xl font-bold font-serif italic text-white/20">
                            "Order is for librarians. <br/>
                            <span className="text-white/40">Mew is for builders."</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
  )
}
