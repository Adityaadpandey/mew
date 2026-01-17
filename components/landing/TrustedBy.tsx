'use client'

import { InfiniteMarquee } from './InfiniteMarquee'

const companies = [
  "ACME CORP",
  "RAYCAST",
  "VERCEL",
  "LINEAR",
  "NOTION",
  "FIGMA",
  "STRIPE",
  "OPENAI",
  "SUPABASE",
]

export function TrustedBy() {
  return (
    <section className="py-12 bg-white border-b-4 border-black border-dashed overflow-hidden">
      <div className="container mx-auto px-4 mb-8 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Trusted by teams who <span className="text-orange-600">ship</span>
        </p>
      </div>

      <div className="opacity-50 grayscale mix-blend-multiply">
         <InfiniteMarquee
            items={companies}
            speed="slow"
            className="text-4xl md:text-5xl font-black text-gray-400 stroke-black"
         />
      </div>
    </section>
  )
}
