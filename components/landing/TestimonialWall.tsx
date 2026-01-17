'use client'

import { motion } from 'framer-motion'

const testimonials = [
  { text: "Mew changed my life. I actually finish tasks now.", author: "Sarah C.", role: "CTO, TechCorp" },
  { text: "It's so chaotic I love it. The energy is real.", author: "Mike Ross", role: "Designer" },
  { text: "Best orange-themed app I've ever used. 10/10.", author: "Jessica L.", role: "PM @ StartUp" },
  { text: "Why are the buttons so big? I love it.", author: "Tom H.", role: "Dev" },
  { text: "Finally a tool that doesn't put me to sleep.", author: "Alex Chen", role: "Founder" },
  { text: "I shipped 3 products in 1 week. Thanks Mew.", author: "David K.", role: "Indie Hacker" },
]

export function TestimonialWall() {
  return (
    <section className="py-24 bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-center mb-16 uppercase tracking-tight">
                Wall of <span className="text-orange-500">Love</span>
            </h2>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {testimonials.map((t, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="break-inside-avoid bg-[#111] border border-gray-800 p-8 rounded-xl shadow-[4px_4px_0px_0px_#333] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        <p className="text-xl md:text-2xl font-bold leading-tight mb-6">&quot;{t.text}&quot;</p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full" />
                            <div>
                                <div className="font-bold text-gray-200">{t.author}</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wider">{t.role}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  )
}
