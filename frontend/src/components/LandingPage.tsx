'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Activity, ArrowRight, Zap, Shield, TrendingUp, Bot, Sparkles, BarChart3, Code2 } from 'lucide-react'

interface LandingPageProps {
  onEnter: () => void
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [typedText, setTypedText] = useState('')
  const fullText = 'AI-Powered Trading Assistant for AsterDEX'
  const [showSubtext, setShowSubtext] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [showA101Section, setShowA101Section] = useState(false)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
        setShowSubtext(true)
        // Remove cursor after typing completes
        setTimeout(() => {
          setShowCursor(false)
        }, 500)
      }
    }, 80)

    return () => clearInterval(typingInterval)
  }, [])

  // Scroll detection for A101 section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      
      // Show A101 section when scrolled past 50% of first screen
      if (scrollPosition > windowHeight * 0.5) {
        setShowA101Section(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: Sparkles,
      title: 'AI Market Prediction',
      description: 'Multi-model AI analysis with GPT-5, Qwen Max & DeepSeek Chat'
    },
    {
      icon: Bot,
      title: 'Natural Language Trading',
      description: 'Trade using simple commands in plain English'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Execute trades instantly with AI-powered automation'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your API keys are stored locally and never shared'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Insights',
      description: 'Monitor positions and balance in real-time'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0b0e11] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated Floating Circles */}
        <div 
          className="absolute top-20 left-10 w-[400px] h-[400px] bg-[#f0b90b]/20 rounded-full blur-3xl"
          style={{ animation: 'float 20s ease-in-out infinite' }}
        ></div>
        <div 
          className="absolute top-40 right-20 w-[500px] h-[500px] bg-[#0ecb81]/15 rounded-full blur-3xl"
          style={{ animation: 'float-slow 30s ease-in-out infinite' }}
        ></div>
        <div 
          className="absolute bottom-20 left-1/4 w-[450px] h-[450px] bg-[#3b82f6]/18 rounded-full blur-3xl"
          style={{ animation: 'float-reverse 25s ease-in-out infinite' }}
        ></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(240,185,11,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(240,185,11,0.035)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Accent Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f0b90b]/8 to-transparent"></div>
          <div className="absolute top-2/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0ecb81]/8 to-transparent"></div>
          <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f0b90b]/8 to-transparent"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-[#2b3139] bg-[#181a20]/80 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white">
                  <Image src="/A101.png" alt="A101" width={48} height={48} className="object-cover" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">A101 AI Trader</h1>
                  <p className="text-xs text-slate-500">Powered by A101 Protocol</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Title with Typing Effect */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 min-h-[120px] flex items-center justify-center">
                {typedText}
                {showCursor && <span className="inline-block w-1 h-16 bg-[#f0b90b] ml-2 animate-pulse"></span>}
              </h1>
              
              {showSubtext && (
                <div className="animate-fade-in">
                  <p className="text-xl md:text-2xl text-slate-400 mb-8">
                    Trade smarter with natural language commands
                  </p>
                  
                  {/* CTA Button */}
                  <button
                    onClick={onEnter}
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#f0b90b] to-[#f8d12f] hover:from-[#f8d12f] hover:to-[#f0b90b] text-black px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg shadow-[#f0b90b]/30 hover:shadow-xl hover:shadow-[#f0b90b]/50 hover:scale-105"
                  >
                    Launch App
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>

            {/* Features Grid - 5 cards layout */}
            {showSubtext && (
              <div className="mt-20 max-w-6xl mx-auto animate-fade-in-up">
                {/* First row - 3 cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {features.slice(0, 3).map((feature, idx) => (
                    <div
                      key={idx}
                      className="group bg-[#1e2329]/50 backdrop-blur-sm border border-[#2b3139] rounded-xl p-6 hover:border-[#f0b90b]/50 transition-all hover:transform hover:scale-105 hover:shadow-xl hover:shadow-[#f0b90b]/10 text-center"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-[#f0b90b]/20 to-[#f0b90b]/5 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:from-[#f0b90b]/30 group-hover:to-[#f0b90b]/10 transition-all">
                        <feature.icon className="w-7 h-7 text-[#f0b90b]" />
                      </div>
                      <h3 className="text-white font-bold text-base mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
                
                {/* Second row - 2 cards centered */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {features.slice(3, 5).map((feature, idx) => (
                    <div
                      key={idx + 3}
                      className="group bg-[#1e2329]/50 backdrop-blur-sm border border-[#2b3139] rounded-xl p-6 hover:border-[#f0b90b]/50 transition-all hover:transform hover:scale-105 hover:shadow-xl hover:shadow-[#f0b90b]/10 text-center"
                      style={{ animationDelay: `${(idx + 3) * 100}ms` }}
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-[#f0b90b]/20 to-[#f0b90b]/5 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:from-[#f0b90b]/30 group-hover:to-[#f0b90b]/10 transition-all">
                        <feature.icon className="w-7 h-7 text-[#f0b90b]" />
                      </div>
                      <h3 className="text-white font-bold text-base mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scroll Indicator */}
            {showSubtext && (
              <div className="mt-20 animate-bounce">
                <p className="text-xs text-slate-500 mb-2">Scroll down to explore</p>
                <div className="w-6 h-10 border-2 border-slate-600 rounded-full mx-auto flex items-start justify-center p-2">
                  <div className="w-1 h-3 bg-[#f0b90b] rounded-full animate-scroll"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* A101 Protocol Section */}
        <div className="min-h-screen flex items-center justify-center px-4 py-20 border-t border-[#2b3139]">
          <div className="max-w-6xl mx-auto">
            <div className={`text-center mb-16 transition-all duration-1000 ${showA101Section ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-block px-4 py-2 bg-[#f0b90b]/10 border border-[#f0b90b]/30 rounded-full mb-6">
                <span className="text-[#f0b90b] font-bold text-sm">A101 PROTOCOL</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                The Future of AI Trading
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-4">
                A101 is an advanced AI-powered trading protocol that combines multi-model market prediction,
                natural language processing, and real-time execution on AsterDEX.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#10a37f]/10 border border-[#10a37f]/30 rounded-full">
                  <div className="w-2 h-2 bg-[#10a37f] rounded-full"></div>
                  <span className="text-[#10a37f] font-medium">GPT-5</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#CC785C]/10 border border-[#CC785C]/30 rounded-full">
                  <div className="w-2 h-2 bg-[#CC785C] rounded-full"></div>
                  <span className="text-[#CC785C] font-medium">Claude Sonnet 4.5</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#4285F4]/10 border border-[#4285F4]/30 rounded-full">
                  <div className="w-2 h-2 bg-[#4285F4] rounded-full"></div>
                  <span className="text-[#4285F4] font-medium">Gemini 2.5 Pro</span>
                </div>
              </div>
            </div>

            {/* AI Market Prediction - Full Width Featured Card */}
            <div className={`mb-8 transition-all duration-1000 delay-200 ${showA101Section ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="bg-gradient-to-br from-[#f0b90b]/10 to-[#f0b90b]/5 backdrop-blur-sm border-2 border-[#f0b90b]/30 rounded-2xl p-10 hover:border-[#f0b90b] transition-all relative overflow-hidden shadow-2xl shadow-[#f0b90b]/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#f0b90b]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#f0b90b]/5 rounded-full blur-3xl"></div>
                
                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Left: Title and Description */}
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#f0b90b] to-[#f8d12f] rounded-2xl flex items-center justify-center shadow-lg shadow-[#f0b90b]/30">
                        <Sparkles className="w-9 h-9 text-black" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-white">AI Market Prediction</h3>
                        <p className="text-sm text-[#f0b90b]">Powered by Latest AI Models</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-base leading-relaxed">
                      Multi-model AI analysis powered by the latest language models for intelligent market insights. 
                      Get real-time predictions with confidence scoring and advanced technical analysis.
                    </p>
                  </div>

                  {/* Right: AI Models Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#10a37f]/10 border border-[#10a37f]/30 rounded-xl p-4 hover:bg-[#10a37f]/15 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#10a37f] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">G5</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-sm">GPT-5</h4>
                          <p className="text-[#10a37f] text-xs">Next-generation reasoning</p>
                        </div>
                        <div className="px-3 py-1 bg-[#0ecb81] rounded-full">
                          <span className="text-black text-xs font-bold">ACTIVE</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1a73e8]/10 border border-[#1a73e8]/30 rounded-xl p-4 hover:bg-[#1a73e8]/15 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1a73e8] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">DS</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-sm">DeepSeek Chat</h4>
                          <p className="text-[#1a73e8] text-xs">Mathematical reasoning</p>
                        </div>
                        <div className="px-3 py-1 bg-[#0ecb81] rounded-full">
                          <span className="text-black text-xs font-bold">ACTIVE</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#ff6a00]/10 border border-[#ff6a00]/30 rounded-xl p-4 hover:bg-[#ff6a00]/15 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ff6a00] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">QW</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-sm">Qwen Max</h4>
                          <p className="text-[#ff6a00] text-xs">Chinese market expert</p>
                        </div>
                        <div className="px-3 py-1 bg-[#0ecb81] rounded-full">
                          <span className="text-black text-xs font-bold">ACTIVE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Features Grid - 3 Columns */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-500 ${showA101Section ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              {/* Feature 1 */}
              <div className="bg-[#1e2329]/50 backdrop-blur-sm border border-[#2b3139] rounded-xl p-6 hover:border-[#f0b90b]/50 transition-all h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-[#f0b90b] to-[#f8d12f] rounded-xl flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Natural Language</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Trade using simple English commands.
                </p>
                <ul className="space-y-2 text-xs text-slate-500">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#f0b90b] rounded-full"></div>
                    <span>"Buy 0.1 BTC"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#f0b90b] rounded-full"></div>
                    <span>"Show positions"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#f0b90b] rounded-full"></div>
                    <span>"Close all"</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#1e2329]/50 backdrop-blur-sm border border-[#2b3139] rounded-xl p-6 hover:border-[#0ecb81]/50 transition-all h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0ecb81] to-[#0ecb81]/70 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Instant Execution</h3>
                <p className="text-slate-400 text-sm mb-4">
                  AI processes and executes in milliseconds.
                </p>
                <ul className="space-y-2 text-xs text-slate-500">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#0ecb81] rounded-full"></div>
                    <span>Real-time data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#0ecb81] rounded-full"></div>
                    <span>Auto placement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#0ecb81] rounded-full"></div>
                    <span>Smart management</span>
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#1e2329]/50 backdrop-blur-sm border border-[#2b3139] rounded-xl p-6 hover:border-[#3b82f6]/50 transition-all h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#3b82f6]/70 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Security First</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Keys stored locally, never shared.
                </p>
                <ul className="space-y-2 text-xs text-slate-500">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#3b82f6] rounded-full"></div>
                    <span>Local storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#3b82f6] rounded-full"></div>
                    <span>No server storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#3b82f6] rounded-full"></div>
                    <span>Direct API</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tech Stack */}
            <div className={`mt-16 bg-gradient-to-r from-[#1e2329]/80 to-[#1e2329]/40 backdrop-blur-sm border border-[#2b3139] rounded-xl p-8 text-center transition-all duration-1000 delay-700 overflow-hidden ${showA101Section ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <h3 className="text-2xl font-bold text-white mb-8">Powered By</h3>
              <div className="relative overflow-hidden">
                <div className="flex items-center justify-center gap-12 animate-scroll-x whitespace-nowrap">
                  {/* OpenAI */}
                  <div className="inline-flex items-center gap-3 group hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#10a37f] to-[#1a7f64] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[#10a37f]/50 transition-shadow p-2">
                      <svg role="img" viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="white">
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-[#10a37f]">OpenAI GPT-5</div>
                      <div className="text-xs text-slate-500">AI Processing</div>
                    </div>
                  </div>
                  
                  <div className="text-2xl text-slate-600">×</div>
                  
                  {/* AsterDEX */}
                  <div className="inline-flex items-center gap-3 group hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[#f0b90b]/50 transition-shadow p-2 border border-[#f0b90b]/20">
                      <Image 
                        src="/asterdex-icon.png" 
                        alt="AsterDEX" 
                        width={32} 
                        height={32}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-[#f0b90b]">AsterDEX</div>
                      <div className="text-xs text-slate-500">Trading Platform</div>
                    </div>
                  </div>
                  
                  <div className="text-2xl text-slate-600">×</div>
                  
                  {/* Qwen */}
                  <div className="inline-flex items-center gap-3 group hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[#ff6a00]/50 transition-shadow p-2 border border-[#ff6a00]/20">
                      <Image 
                        src="/qwen-color.svg" 
                        alt="Qwen" 
                        width={32} 
                        height={32}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-[#ff6a00]">Qwen Max</div>
                      <div className="text-xs text-slate-500">AI Analysis</div>
                    </div>
                  </div>
                  
                  <div className="text-2xl text-slate-600">×</div>
                  
                  {/* DeepSeek */}
                  <div className="inline-flex items-center gap-3 group hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[#1a73e8]/50 transition-shadow p-2 border border-[#1a73e8]/20">
                      <Image 
                        src="/deepseek-color.svg" 
                        alt="DeepSeek" 
                        width={32} 
                        height={32}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-[#1a73e8]">DeepSeek Chat</div>
                      <div className="text-xs text-slate-500">AI Insights</div>
                    </div>
                  </div>
                  
                  <div className="text-2xl text-slate-600">×</div>
                  
                  {/* Next.js */}
                  <div className="inline-flex items-center gap-3 group hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-white/20 transition-shadow border border-white/10">
                      <Code2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-white">Next.js</div>
                      <div className="text-xs text-slate-500">Web Framework</div>
                    </div>
                  </div>

                  {/* Duplicate for seamless loop */}
                  <div className="text-2xl text-slate-600">×</div>
                  
                  <div className="inline-flex items-center gap-3 group hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#10a37f] to-[#1a7f64] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[#10a37f]/50 transition-shadow p-2">
                      <svg role="img" viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="white">
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-[#10a37f]">OpenAI GPT-5</div>
                      <div className="text-xs text-slate-500">AI Processing</div>
                    </div>
                  </div>
                  
                  <div className="text-2xl text-slate-600">×</div>
                  
                  {/* AsterDEX - Duplicate */}
                  <div className="inline-flex items-center gap-3 group hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[#f0b90b]/50 transition-shadow p-2 border border-[#f0b90b]/20">
                      <Image 
                        src="/asterdex-icon.png" 
                        alt="AsterDEX" 
                        width={32} 
                        height={32}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-[#f0b90b]">AsterDEX</div>
                      <div className="text-xs text-slate-500">Trading Platform</div>
                    </div>
                  </div>
                  
                  <div className="text-2xl text-slate-600">×</div>
                  
                  {/* Qwen - Duplicate */}
                  <div className="inline-flex items-center gap-3 group hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[#ff6a00]/50 transition-shadow p-2 border border-[#ff6a00]/20">
                      <Image 
                        src="/qwen-color.svg" 
                        alt="Qwen" 
                        width={32} 
                        height={32}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-[#ff6a00]">Qwen Max</div>
                      <div className="text-xs text-slate-500">AI Analysis</div>
                    </div>
                  </div>
                  
                  <div className="text-2xl text-slate-600">×</div>
                  
                  {/* DeepSeek - Duplicate */}
                  <div className="inline-flex items-center gap-3 group hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[#1a73e8]/50 transition-shadow p-2 border border-[#1a73e8]/20">
                      <Image 
                        src="/deepseek-color.svg" 
                        alt="DeepSeek" 
                        width={32} 
                        height={32}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-[#1a73e8]">DeepSeek Chat</div>
                      <div className="text-xs text-slate-500">AI Insights</div>
                    </div>
                  </div>
                  
                  <div className="text-2xl text-slate-600">×</div>
                  
                  {/* Next.js - Duplicate */}
                  <div className="inline-flex items-center gap-3 group hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-white/20 transition-shadow border border-white/10">
                      <Code2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-white">Next.js</div>
                      <div className="text-xs text-slate-500">Web Framework</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className={`text-center mt-16 transition-all duration-1000 delay-600 ${showA101Section ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <button
                onClick={onEnter}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#f0b90b] to-[#f8d12f] hover:from-[#f8d12f] hover:to-[#f0b90b] text-black px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg shadow-[#f0b90b]/30 hover:shadow-xl hover:shadow-[#f0b90b]/50 hover:scale-105"
              >
                Start Trading Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-[#2b3139] bg-[#181a20]/80 backdrop-blur-md py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-slate-500">
              © 2025 A101 AI Trader. Professional AI-Powered Crypto Trading Platform.
            </p>
          </div>
        </footer>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(12px);
          }
        }

        @keyframes scroll-x {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }

        .animate-scroll-x {
          animation: scroll-x 20s linear infinite;
        }

        .animate-scroll-x:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
