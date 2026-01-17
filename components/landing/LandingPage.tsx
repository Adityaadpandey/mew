'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
    ArrowRight,
    Check,
    CheckCircle,
    ChevronRight,
    CircleCheck,
    ClipboardList,
    FileText,
    Github,
    Globe,
    Layers,
    LayoutDashboard,
    Menu,
    PenTool,
    Play,
    Puzzle,
    Share2,
    Sparkles,
    Star,
    Users,
    X
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

// SEO Metadata
export const landingPageMeta = {
  title: 'Mew - The Collaborative Workspace for Modern Teams',
  description: 'Mew combines task management, Notion-style docs, and Excalidraw diagramming in one beautiful workspace. Plan, document, and visualize your ideas together.',
  keywords: 'collaborative workspace, task management, notion alternative, excalidraw, team collaboration, project management, documentation, diagramming, whiteboard',
  ogImage: '/og-image.png',
}

export function LandingPage() {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      id: 'tasks',
      icon: ClipboardList,
      title: 'Task Management',
      description: 'Organize work with powerful task boards, timelines, and progress tracking.',
      color: 'from-[#C10801] to-[#F16001]',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      id: 'docs',
      icon: FileText,
      title: 'Rich Documents',
      description: 'Write beautiful docs with Notion-style blocks, embeds, and real-time collaboration.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'diagrams',
      icon: PenTool,
      title: 'Visual Diagrams',
      description: 'Sketch ideas with Excalidraw-powered whiteboard and diagram tools.',
      color: 'from-orange-500 to-rose-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ]

  return (
    <>
      <Head>
        <title>{landingPageMeta.title}</title>
        <meta name="description" content={landingPageMeta.description} />
        <meta name="keywords" content={landingPageMeta.keywords} />
        <meta property="og:title" content={landingPageMeta.title} />
        <meta property="og:description" content={landingPageMeta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={landingPageMeta.ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={landingPageMeta.title} />
        <meta name="twitter:description" content={landingPageMeta.description} />
        <link rel="canonical" href="https://mew.adpandey.com" />
      </Head>

      <div className="min-h-screen bg-white text-slate-900 selection:bg-orange-100 selection:text-orange-900 font-sans overflow-x-hidden">
        {/* Navbar */}
        <header>
          <nav
            className={cn(
              'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
              scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50 py-3 shadow-sm' : 'bg-transparent py-5'
            )}
            aria-label="Main navigation"
          >
            <div className="container mx-auto px-6 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5" aria-label="Mew Home">
                <div className="h-10 w-10 bg-gradient-to-br from-[#C10801] via-[#E85002] to-[#F16001] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/25 rotate-3 hover:rotate-0 transition-transform">
                  M
                </div>
                <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#C10801] to-[#F16001] bg-clip-text text-transparent">
                  Mew
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
                <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Testimonials</a>
                <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              </div>

              <div className="hidden md:flex items-center gap-3">
                {session ? (
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002] text-white font-semibold rounded-xl px-6 shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <Button variant="ghost" className="font-medium text-slate-600 hover:text-slate-900">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/auth/signin">
                      <Button className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002] text-white font-semibold rounded-xl px-6 shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-6 flex flex-col gap-4 shadow-xl"
              >
                <a href="#features" className="text-base font-medium text-slate-600">Features</a>
                <a href="#how-it-works" className="text-base font-medium text-slate-600">How It Works</a>
                <a href="#testimonials" className="text-base font-medium text-slate-600">Testimonials</a>
                <a href="#pricing" className="text-base font-medium text-slate-600">Pricing</a>
                <div className="h-px bg-slate-100 my-2" />
                {session ? (
                  <Link href="/dashboard" className="w-full">
                    <Button className="w-full justify-center bg-gradient-to-r from-[#C10801] to-[#F16001]">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin" className="w-full">
                      <Button variant="outline" className="w-full justify-center">Sign in</Button>
                    </Link>
                    <Link href="/auth/signin" className="w-full">
                      <Button className="w-full justify-center bg-gradient-to-r from-[#C10801] to-[#F16001]">
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero Section */}
          <section ref={heroRef} className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6 overflow-hidden" aria-labelledby="hero-heading">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full blur-3xl bg-gradient-to-br from-orange-200/50 via-amber-100/40 to-transparent" />
              <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full blur-3xl bg-gradient-to-br from-red-100/40 to-transparent" />
              <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl bg-gradient-to-br from-blue-100/30 to-transparent" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-t from-white to-transparent" />

              {/* Floating Elements */}
              <motion.div
                className="absolute top-40 right-[20%] w-16 h-16 bg-orange-100 rounded-2xl rotate-12 flex items-center justify-center"
                animate={{ y: [0, -20, 0], rotate: [12, -8, 12] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <ClipboardList className="h-8 w-8 text-orange-500" />
              </motion.div>
              <motion.div
                className="absolute top-60 left-[15%] w-14 h-14 bg-blue-100 rounded-2xl -rotate-6 flex items-center justify-center"
                animate={{ y: [0, 15, 0], rotate: [-6, 10, -6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <FileText className="h-7 w-7 text-blue-500" />
              </motion.div>
              <motion.div
                className="absolute bottom-40 right-[15%] w-12 h-12 bg-orange-100 rounded-xl rotate-6 flex items-center justify-center"
                animate={{ y: [0, -15, 0], rotate: [6, -12, 6] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <PenTool className="h-6 w-6 text-orange-500" />
              </motion.div>
            </div>

            <div className="container mx-auto relative z-10">
              <motion.div
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="flex flex-col items-center text-center max-w-5xl mx-auto mb-20"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/50 mb-8 shadow-sm"
                >
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-slate-700">Now in public beta — Try it free</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  id="hero-heading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.05]"
                >
                  One workspace for
                  <br />
                  <span className="bg-gradient-to-r from-[#C10801] via-[#E85002] to-[#F16001] bg-clip-text text-transparent">
                    everything
                  </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl md:text-2xl text-slate-600 mb-6 max-w-3xl leading-relaxed"
                >
                  <strong className="text-slate-900">Tasks. Docs. Diagrams.</strong> All in one place.
                  <br className="hidden md:block" />
                  The collaborative workspace that adapts to how your team works.
                </motion.p>

                {/* Feature Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="flex flex-wrap justify-center gap-3 mb-10"
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100">
                    <ClipboardList className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Task Management</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Notion-style Docs</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100">
                    <PenTool className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Excalidraw Diagrams</span>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center gap-4 mb-6"
                >
                  {session ? (
                    <Link href="/dashboard">
                      <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002] text-white font-semibold rounded-2xl shadow-xl shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 gap-2">
                        <LayoutDashboard className="h-5 w-5" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signin">
                      <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002] text-white font-semibold rounded-2xl shadow-xl shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 gap-2">
                        <Sparkles className="h-5 w-5" />
                        Start for Free
                      </Button>
                    </Link>
                  )}
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-2xl border-2 gap-2 group">
                    <Play className="h-5 w-5 text-[#E85002] group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </Button>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex items-center gap-6 text-sm text-slate-500"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Free forever plan
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    No credit card
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    5 min setup
                  </span>
                </motion.div>
              </motion.div>

              {/* Hero Visual - Product Preview */}
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative mx-auto max-w-6xl"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-500/20 rounded-3xl blur-2xl" aria-hidden="true" />

                <figure className="relative rounded-2xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden">
                  {/* Browser Chrome */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="ml-4 h-7 px-4 bg-white border border-slate-200 rounded-lg flex items-center text-xs text-slate-500 min-w-[300px]">
                        <Globe className="h-3 w-3 mr-2 text-slate-400" />
                        mew.adpandey.com/workspace/my-project
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        <Users className="h-3 w-3" />
                        3 online
                      </div>
                    </div>
                  </div>

                  {/* App Interface */}
                  <div className="grid grid-cols-[260px_1fr] h-[520px] md:h-[560px]">
                    {/* Sidebar */}
                    <div className="border-r border-slate-100 bg-slate-50/50 p-4 flex flex-col">
                      {/* Workspace Header */}
                      <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-white border border-slate-100">
                        <div className="h-9 w-9 bg-gradient-to-br from-[#C10801] to-[#F16001] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          M
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">My Workspace</div>
                          <div className="text-xs text-slate-500">Pro Plan</div>
                        </div>
                      </div>

                      {/* Nav Items */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-orange-100 to-amber-50 rounded-xl text-orange-700 font-medium text-sm">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm">
                          <ClipboardList className="h-4 w-4" />
                          Tasks
                          <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">12</span>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm">
                          <FileText className="h-4 w-4" />
                          Documents
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm">
                          <PenTool className="h-4 w-4" />
                          Diagrams
                        </div>
                      </div>

                      {/* Projects */}
                      <div className="mt-6">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Projects</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            Product Launch
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            Q4 Planning
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Design System
                          </div>
                        </div>
                      </div>

                      {/* Team */}
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <div className="flex -space-x-2">
                          {['A', 'B', 'C', 'D'].map((initial, i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white",
                                ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500'][i]
                              )}
                            >
                              {initial}
                            </div>
                          ))}
                          <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                            +5
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white p-6 overflow-hidden">
                      {/* Content Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">Product Launch</h2>
                          <p className="text-sm text-slate-500">3 tasks, 2 docs, 1 diagram</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="gap-2">
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                          <Button size="sm" className="bg-gradient-to-r from-[#C10801] to-[#F16001] text-white gap-2">
                            <Sparkles className="h-4 w-4" />
                            AI Assist
                          </Button>
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-3 gap-4 h-[calc(100%-80px)]">
                        {/* Tasks Column */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center gap-2 mb-4">
                            <ClipboardList className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold text-slate-700 text-sm">Tasks</span>
                          </div>
                          <div className="space-y-2">
                            {[
                              { title: 'Finalize landing page', done: true },
                              { title: 'Review copy with team', done: true },
                              { title: 'Set up analytics', done: false },
                              { title: 'Prepare launch email', done: false },
                            ].map((task, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "flex items-center gap-2 p-2.5 bg-white rounded-lg border text-sm",
                                  task.done ? "border-green-200" : "border-slate-200"
                                )}
                              >
                                <div className={cn(
                                  "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                  task.done ? "border-green-500 bg-green-500" : "border-slate-300"
                                )}>
                                  {task.done && <Check className="h-2.5 w-2.5 text-white" />}
                                </div>
                                <span className={task.done ? "text-slate-400 line-through" : "text-slate-700"}>
                                  {task.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Docs Column */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-slate-700 text-sm">Documents</span>
                          </div>
                          <div className="space-y-2">
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                              <div className="font-medium text-slate-800 text-sm mb-1">Launch Checklist</div>
                              <div className="text-xs text-slate-500 line-clamp-2">
                                Final steps before going live with the new product...
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                <span>Updated 2h ago</span>
                              </div>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                              <div className="font-medium text-slate-800 text-sm mb-1">Press Release</div>
                              <div className="text-xs text-slate-500 line-clamp-2">
                                Today, we're excited to announce the launch of...
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                <span>Updated 1d ago</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Diagram Column */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center gap-2 mb-4">
                            <PenTool className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold text-slate-700 text-sm">Diagrams</span>
                          </div>
                          <div className="bg-white rounded-lg border border-slate-200 p-3 h-[calc(100%-40px)] relative overflow-hidden">
                            {/* Mini diagram preview */}
                            <div className="absolute inset-0 opacity-50" style={{
                              backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                              backgroundSize: '12px 12px'
                            }} />
                            <div className="relative">
                              <div className="absolute top-4 left-4 w-20 h-10 bg-orange-100 border-2 border-orange-400 rounded-lg flex items-center justify-center text-xs font-medium text-orange-700">
                                User
                              </div>
                              <svg className="absolute top-9 left-24 w-8 h-8" viewBox="0 0 24 24">
                                <path d="M5 12h14m-4-4l4 4-4 4" stroke="#E85002" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <div className="absolute top-4 right-4 w-20 h-10 bg-blue-100 border-2 border-blue-400 rounded-lg flex items-center justify-center text-xs font-medium text-blue-700">
                                API
                              </div>
                              <svg className="absolute top-14 right-8 w-8 h-8 rotate-90" viewBox="0 0 24 24">
                                <path d="M5 12h14m-4-4l4 4-4 4" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <div className="absolute bottom-4 right-4 w-20 h-10 bg-green-100 border-2 border-green-400 rounded-lg flex items-center justify-center text-xs font-medium text-green-700">
                                DB
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 text-xs text-slate-400">Launch Architecture</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <figcaption className="sr-only">Mew workspace showing tasks, documents, and diagrams</figcaption>
                </figure>
              </motion.div>
            </div>
          </section>

          {/* Logos Section */}
          <section className="py-16 border-y border-slate-100 bg-slate-50/50" aria-label="Trusted by companies">
            <div className="container mx-auto px-6">
              <p className="text-center text-sm font-medium text-slate-500 mb-8">
                Trusted by teams at forward-thinking companies
              </p>
              <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60 grayscale" aria-hidden="true">
                {['Vercel', 'Linear', 'Notion', 'Figma', 'Stripe', 'Supabase'].map((company) => (
                  <div key={company} className="text-2xl font-bold text-slate-400">
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-24 md:py-32 relative overflow-hidden" aria-labelledby="features-heading">
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full blur-3xl bg-gradient-to-br from-orange-100/50 to-transparent" />
              <div className="absolute bottom-1/4 -left-40 w-[400px] h-[400px] rounded-full blur-3xl bg-gradient-to-br from-amber-100/50 to-transparent" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
              <header className="text-center max-w-3xl mx-auto mb-20">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-sm font-medium mb-6"
                >
                  <Layers className="h-4 w-4" />
                  Three tools, one workspace
                </motion.span>
                <motion.h2
                  id="features-heading"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
                >
                  Everything you need,
                  <br />
                  <span className="bg-gradient-to-r from-[#C10801] via-[#E85002] to-[#F16001] bg-clip-text text-transparent">
                    nothing you don't
                  </span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-slate-600 max-w-2xl mx-auto"
                >
                  Stop switching between apps. Mew brings task management, documentation, and visual collaboration into one seamless experience.
                </motion.p>
              </header>

              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {features.map((feature, i) => (
                  <motion.article
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={cn(
                      "relative p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer group",
                      activeFeature === i
                        ? "border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"
                    )}
                    onClick={() => setActiveFeature(i)}
                  >
                    <div className={cn(
                      "h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-all",
                      feature.bgColor
                    )}>
                      <feature.icon className={cn("h-8 w-8", feature.iconColor)} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                    <div className={cn(
                      "absolute bottom-4 right-4 h-8 w-8 rounded-full flex items-center justify-center transition-all",
                      activeFeature === i ? "bg-[#E85002] text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                    )}>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Additional Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Users, title: 'Real-time Collaboration', desc: 'Work together with live cursors and presence' },
                  { icon: Sparkles, title: 'AI-Powered', desc: 'Smart suggestions and auto-complete' },
                  { icon: Share2, title: 'Easy Sharing', desc: 'Share with anyone via link or export' },
                  { icon: Puzzle, title: 'Integrations', desc: 'Connect with your favorite tools' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all"
                  >
                    <item.icon className="h-6 w-6 text-[#E85002] mb-3" />
                    <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="py-24 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden" aria-labelledby="how-it-works-heading">
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl bg-orange-500/10" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl bg-amber-500/10" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
              <header className="text-center max-w-3xl mx-auto mb-20">
                <motion.h2
                  id="how-it-works-heading"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-bold text-white mb-6"
                >
                  Get started in minutes
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-slate-400"
                >
                  Set up your workspace and start collaborating right away
                </motion.p>
              </header>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  { step: '1', title: 'Create Your Workspace', desc: 'Sign up in seconds and create your first workspace. Invite your team with a simple link.' },
                  { step: '2', title: 'Organize Your Work', desc: 'Create projects, add tasks, write docs, and sketch diagrams. Everything stays connected.' },
                  { step: '3', title: 'Collaborate & Ship', desc: 'Work together in real-time. See who\'s online, leave comments, and move faster.' },
                ].map((item, i) => (
                  <motion.article
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#C10801] to-[#F16001] flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg shadow-orange-500/30">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                    {i < 2 && (
                      <div className="hidden md:block absolute top-8 left-[calc(100%+1rem)] w-[calc(100%-2rem)]">
                        <div className="h-0.5 bg-gradient-to-r from-[#C10801] to-[#F16001] opacity-30" />
                      </div>
                    )}
                  </motion.article>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                {session ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="h-14 px-8 text-base bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 gap-2">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/signin">
                    <Button size="lg" className="h-14 px-8 text-base bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 gap-2">
                      Get Started Now
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="py-24 md:py-32" aria-labelledby="testimonials-heading">
            <div className="container mx-auto px-6">
              <header className="text-center max-w-3xl mx-auto mb-16">
                <motion.h2
                  id="testimonials-heading"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
                >
                  Teams love Mew
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-slate-600"
                >
                  See what others are saying about their experience
                </motion.p>
              </header>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  { quote: "Finally, a tool that combines everything we need. No more switching between Notion, Trello, and Figma all day.", name: "Alex Chen", role: "Product Manager at Vercel", avatar: "AC" },
                  { quote: "The diagram feature is amazing. It's like Excalidraw but integrated with our docs and tasks. Game changer.", name: "Sarah Kim", role: "Staff Engineer at Linear", avatar: "SK" },
                  { quote: "We migrated from 4 different tools to just Mew. Our team is more focused and shipping faster than ever.", name: "Marcus Lee", role: "Founder at Acme", avatar: "ML" },
                ].map((testimonial, i) => (
                  <motion.blockquote
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                    <footer className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C10801] to-[#F16001] flex items-center justify-center text-white text-sm font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <cite className="not-italic font-semibold text-slate-900">{testimonial.name}</cite>
                        <p className="text-sm text-slate-500">{testimonial.role}</p>
                      </div>
                    </footer>
                  </motion.blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-24 md:py-32 bg-slate-50" aria-labelledby="pricing-heading">
            <div className="container mx-auto px-6">
              <header className="text-center max-w-3xl mx-auto mb-16">
                <motion.h2
                  id="pricing-heading"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
                >
                  Simple, transparent pricing
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-slate-600"
                >
                  Start free, upgrade when you need more power
                </motion.p>
              </header>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <PricingCard
                  name="Free"
                  price="$0"
                  period="forever"
                  description="Perfect for personal projects"
                  features={['Up to 3 projects', '5 team members', 'Unlimited tasks & docs', 'Basic diagrams', 'Community support']}
                  ctaText="Get Started"
                />
                <PricingCard
                  name="Pro"
                  price="$10"
                  period="per user/month"
                  description="For growing teams"
                  features={['Unlimited projects', 'Unlimited members', 'Advanced diagrams', 'AI-powered features', 'Priority support', 'Custom templates', 'Version history']}
                  ctaText="Start Free Trial"
                  highlighted
                />
                <PricingCard
                  name="Enterprise"
                  price="Custom"
                  period=""
                  description="For large organizations"
                  features={['Everything in Pro', 'SSO & SAML', 'Advanced security', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'On-premise option']}
                  ctaText="Contact Sales"
                />
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-24 md:py-32 relative overflow-hidden" aria-labelledby="cta-heading">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C10801] via-[#E85002] to-[#F16001]" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl bg-white/10" />
              <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full blur-3xl bg-white/10" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm mb-6">
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-3xl font-bold text-[#E85002] rotate-3">
                    M
                  </div>
                </div>
              </motion.div>
              <motion.h2
                id="cta-heading"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              >
                Ready to transform
                <br />
                how your team works?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/80 mb-10 max-w-2xl mx-auto"
              >
                Join thousands of teams who've simplified their workflow with Mew.
              </motion.p>
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                {session ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="h-16 px-10 text-lg bg-white hover:bg-slate-50 text-[#E85002] font-semibold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 gap-3">
                      <LayoutDashboard className="h-5 w-5" />
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/signin">
                    <Button size="lg" className="h-16 px-10 text-lg bg-white hover:bg-slate-50 text-[#E85002] font-semibold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 gap-3">
                      <Sparkles className="h-5 w-5" />
                      Get Started for Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/70"
              >
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Free forever plan</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> No credit card required</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Setup in 5 minutes</span>
              </motion.div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-5 gap-12 mb-12">
              <div className="md:col-span-2">
                <Link href="/" className="flex items-center gap-2.5 mb-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-[#C10801] to-[#F16001] rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    M
                  </div>
                  <span className="text-xl font-bold text-white">Mew</span>
                </Link>
                <p className="text-sm text-slate-500 leading-relaxed mb-4 max-w-xs">
                  The collaborative workspace that combines tasks, docs, and diagrams. Built for modern teams.
                </p>
                <div className="flex gap-4">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="GitHub">
                    <Github className="h-5 w-5" />
                  </a>
                </div>
              </div>
              <nav aria-label="Product links">
                <h4 className="font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                </ul>
              </nav>
              <nav aria-label="Resources">
                <h4 className="font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                </ul>
              </nav>
              <nav aria-label="Company links">
                <h4 className="font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </nav>
            </div>
            <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} Mew. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

// Pricing Card Component
function PricingCard({
  name,
  price,
  period,
  description,
  features,
  ctaText,
  highlighted = false
}: {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  ctaText: string
  highlighted?: boolean
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'p-8 rounded-3xl border-2 transition-all relative',
        highlighted
          ? 'bg-gradient-to-br from-[#C10801] to-[#F16001] border-transparent text-white shadow-2xl scale-105 z-10'
          : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-lg'
      )}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-[#E85002] text-sm font-semibold rounded-full shadow-lg">
          Most Popular
        </div>
      )}
      <h3 className={cn('text-xl font-bold mb-2', highlighted ? 'text-white' : 'text-slate-900')}>
        {name}
      </h3>
      <div className="flex items-baseline gap-1 mb-2">
        <span className={cn('text-4xl font-bold', highlighted ? 'text-white' : 'text-slate-900')}>
          {price}
        </span>
        {period && <span className={highlighted ? 'text-white/70' : 'text-slate-500'}>/{period}</span>}
      </div>
      <p className={cn('text-sm mb-6', highlighted ? 'text-white/80' : 'text-slate-600')}>
        {description}
      </p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <CircleCheck className={cn('h-4 w-4 flex-shrink-0', highlighted ? 'text-white' : 'text-[#E85002]')} />
            <span className={highlighted ? 'text-white/90' : 'text-slate-600'}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/auth/signin">
        <Button className={cn(
          'w-full font-semibold rounded-xl h-12',
          highlighted
            ? 'bg-white hover:bg-slate-50 text-[#E85002]'
            : 'bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002] text-white'
        )}>
          {ctaText}
        </Button>
      </Link>
    </motion.article>
  )
}
