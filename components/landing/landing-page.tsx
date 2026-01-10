'use client'

import { ArrowRight, Github, Laptop, Moon, Sun, Menu, X, CheckCircle2, Play, Users, Zap, FileText, Database, Code2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Navbar */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
          scrolled ? 'bg-white/80 backdrop-blur-md border-slate-200 py-3' : 'bg-transparent border-transparent py-5'
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#3B82F6] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              E
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Erasor</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
            <Link href="#use-cases" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Use Cases</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="https://github.com/aditya/erasor-clone" target="_blank" className="text-slate-600 hover:text-slate-900 transition-colors">
              <Github className="h-5 w-5" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" className="font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100">Log in</Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg px-5 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                Sign up free
              </Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
            <Link href="#features" className="text-base font-medium text-slate-600">Features</Link>
            <Link href="#use-cases" className="text-base font-medium text-slate-600">Use Cases</Link>
            <Link href="#pricing" className="text-base font-medium text-slate-600">Pricing</Link>
            <div className="h-px bg-slate-100 my-2" />
            <Link href="/auth/signin" className="w-full">
              <Button variant="outline" className="w-full justify-center">Log in</Button>
            </Link>
            <Link href="/auth/signin" className="w-full">
              <Button className="w-full justify-center bg-[#3B82F6]">Sign up free</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#3B82F6] text-sm font-medium mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              v2.0 is now live
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]"
            >
              Docs and diagrams <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]">
                 for engineering teams
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed"
            >
              The most natural way to ideate, document, and share technical designs.
              Write markdown, draw diagrams, and visualize infrastructure code in one tool.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link href="/auth/signin">
                <Button size="lg" className="h-12 px-8 text-base bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95">
                  Try Erasor for free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-xl hover:bg-slate-50">
                <Play className="mr-2 h-4 w-4 fill-current" /> Watch demo
              </Button>
            </motion.div>
          </div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="ml-4 h-6 px-3 bg-white border border-slate-200 rounded-md flex items-center text-xs text-slate-500 w-64">
                erasor.io/design/system-architecture
              </div>
            </div>

            <div className="mt-10 p-1 bg-slate-50">
              {/* Mock UI resembling the app interface */}
              <div className="grid grid-cols-[240px_1fr_280px] h-[600px] bg-white rounded-lg border border-slate-200 overflow-hidden">
                {/* Sidebar */}
                <div className="border-r border-slate-100 p-4 bg-slate-50/50">
                  <div className="space-y-4">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-slate-100 rounded" />
                      <div className="h-3 w-3/4 bg-slate-100 rounded" />
                      <div className="h-3 w-5/6 bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>

                {/* Main Canvas Area */}
                <div className="relative bg-[#FAFBFC] p-8 overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.4]"
                    style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                  />

                  {/* Diagram Elements */}
                  <div className="relative w-full h-full">
                    {/* Central Node */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-white border-2 border-blue-500 rounded-xl shadow-lg flex items-center justify-center gap-3 z-10">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Database className="h-6 w-6" /></div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">Main Database</span>
                        <span className="text-xs text-slate-500">PostgreSQL Cluster</span>
                      </div>
                    </div>

                    {/* Left Node */}
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-40 h-20 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center gap-2">
                      <div className="p-1.5 bg-purple-100 rounded-md text-purple-600"><Users className="h-5 w-5" /></div>
                      <span className="font-medium text-slate-700">Client App</span>
                    </div>

                    {/* Top Right Node */}
                    <div className="absolute top-1/4 right-1/4 w-40 h-20 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center gap-2">
                      <div className="p-1.5 bg-green-100 rounded-md text-green-600"><Zap className="h-5 w-5" /></div>
                      <span className="font-medium text-slate-700">API Gateway</span>
                    </div>

                     {/* Bottom Right Node */}
                     <div className="absolute bottom-1/4 right-1/4 w-40 h-20 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center gap-2">
                      <div className="p-1.5 bg-amber-100 rounded-md text-amber-600"><FileText className="h-5 w-5" /></div>
                      <span className="font-medium text-slate-700">Logs Service</span>
                    </div>

                    {/* Connecting Lines (Mocked with SVGs) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <path d="M 350 300 C 450 300, 450 250, 550 200" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M 680 200 C 680 250, 680 250, 680 280" fill="none" stroke="#3B82F6" strokeWidth="2" />
                      <path d="M 680 340 C 680 380, 680 400, 750 450" fill="none" stroke="#94A3B8" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="border-l border-slate-100 p-4 bg-white">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">AI</div>
                    <div className="text-sm font-medium">AI Copilot</div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                      Generate a diagram for a high-traffic ecommerce system...
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                      Here's a proposed architecture for your request...
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white via-transparent to-transparent h-40 bottom-0 top-auto" />
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to ship faster</h2>
            <p className="text-lg text-slate-600">
              Erasor combines a powerful diagrams-as-code editor with a flexible whiteboard, powered by AI to help you move at the speed of thought.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-amber-500" />}
              title="Lightning Fast"
              description="A highly optimized engine that renders complex diagrams in milliseconds. No lag, just flow."
            />
            <FeatureCard
              icon={<Code2 className="h-6 w-6 text-blue-500" />}
              title="Diagrams as Code"
              description="Write diagrams using a simple, intuitive syntax. Version control your architecture decisions."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-green-500" />}
              title="Real-time Collaboration"
              description="Work together with your team in real-time. See cursors, leave comments, and pair program visually."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
               <div className="h-8 w-8 bg-[#3B82F6] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <span className="text-xl font-bold text-white">Erasor</span>
            </div>
            <div className="flex gap-8 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Erasor Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
