'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import CommandInput from '@/components/CommandInput'
import PositionsList from '@/components/PositionsList'
import BalanceCard from '@/components/BalanceCard'
import MessageList from '@/components/MessageList'
import ApiKeysModal, { ApiKeys } from '@/components/ApiKeysModal'
import LandingPage from '@/components/LandingPage'
import AIPredictionCard from '@/components/AIPredictionCard'
import { Activity, Settings } from 'lucide-react'

export default function Home() {
  const [showLanding, setShowLanding] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [balance, setBalance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null)
  const [showApiKeysModal, setShowApiKeysModal] = useState(false)

  // Always show landing page on initial load
  // Remove this useEffect if you want landing page every time
  // useEffect(() => {
  //   const hasVisited = localStorage.getItem('aster_has_visited')
  //   if (hasVisited) {
  //     setShowLanding(false)
  //   }
  // }, [])

  // Load API Keys from localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem('aster_api_keys')
    if (savedKeys) {
      const keys = JSON.parse(savedKeys)
      setApiKeys(keys)
      // Load data with the loaded keys
      loadPositions(keys)
      loadBalance(keys)
    } else {
      // Show modal if no keys configured
      setShowApiKeysModal(true)
      // Still load data (will use backend default keys)
      loadPositions(null)
      loadBalance(null)
    }
  }, [])

  const loadPositions = async (keys?: ApiKeys | null) => {
    try {
      const keysToUse = keys !== undefined ? keys : apiKeys
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_keys: keysToUse || undefined })
      })
      const data = await response.json()
      setPositions(data.positions || [])
    } catch (error) {
      console.error('Failed to load positions:', error)
      setPositions([])
    }
  }

  const loadBalance = async (keys?: ApiKeys | null) => {
    try {
      const keysToUse = keys !== undefined ? keys : apiKeys
      console.log('[Balance] API Keys being sent:', keysToUse ? 'Keys present' : 'No keys')
      console.log('[Balance] Keys structure:', keysToUse ? Object.keys(keysToUse) : 'null')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_keys: keysToUse || undefined })
      })
      
      if (response.status === 401) {
        // API Keys not configured
        setBalance({
          error: true,
          message: 'API Keys Required',
          balances: [],
          total_balance: 0
        })
        return
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      setBalance(data)
    } catch (error) {
      console.error('Failed to load balance:', error)
      setBalance({
        error: true,
        message: 'Failed to load balance',
        balances: [],
        total_balance: 0
      })
    }
  }

  const handleSaveApiKeys = (keys: ApiKeys) => {
    setApiKeys(keys)
    localStorage.setItem('aster_api_keys', JSON.stringify(keys))
    // Reload data with new keys
    loadPositions(keys)
    loadBalance(keys)
  }

  const handleCommandSubmit = async (command: string, confirm: boolean = false) => {
    setIsLoading(true)
    
    // Add user message
    const userMessage = {
      type: 'user',
      content: command,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          command, 
          confirm,
          api_keys: apiKeys 
        }),
      })

      const data = await response.json()

      // Add bot response
      const botMessage = {
        type: 'bot',
        content: data.message,
        success: data.success,
        needsConfirmation: data.needs_confirmation,
        intent: data.intent,
        data: data.data,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])

      // Refresh data if trade was executed
      if (data.success && data.intent?.action?.includes('open') || data.intent?.action?.includes('close')) {
        setTimeout(() => {
          loadPositions()
          loadBalance()
        }, 1000)
      }

    } catch (error) {
      const errorMessage = {
        type: 'bot',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnterApp = () => {
    // localStorage.setItem('aster_has_visited', 'true') // Comment out to show landing every time
    setShowLanding(false)
    // Scroll to top when entering app
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)
  }

  // Show landing page
  if (showLanding) {
    return <LandingPage onEnter={handleEnterApp} />
  }

  // Show main app
  return (
    <div className="min-h-screen bg-[#0b0e11] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated Floating Circles */}
        <div 
          className="absolute top-20 left-10 w-[400px] h-[400px] bg-[#f0b90b]/20 rounded-full blur-3xl"
          style={{
            animation: 'float 20s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute top-40 right-20 w-[500px] h-[500px] bg-[#0ecb81]/15 rounded-full blur-3xl"
          style={{
            animation: 'float-slow 30s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-1/4 w-[450px] h-[450px] bg-[#3b82f6]/18 rounded-full blur-3xl"
          style={{
            animation: 'float-reverse 25s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute top-1/3 right-1/3 w-[380px] h-[380px] bg-[#f0b90b]/12 rounded-full blur-3xl"
          style={{
            animation: 'float-slow 30s ease-in-out infinite 5s'
          }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-10 w-[350px] h-[350px] bg-[#0ecb81]/20 rounded-full blur-3xl"
          style={{
            animation: 'float 20s ease-in-out infinite 10s'
          }}
        ></div>
        
        {/* Gradient Orbs (Static) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f0b90b]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0ecb81]/5 rounded-full blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(240,185,11,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(240,185,11,0.035)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Accent Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f0b90b]/8 to-transparent"></div>
          <div className="absolute top-2/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0ecb81]/8 to-transparent"></div>
          <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f0b90b]/8 to-transparent"></div>
        </div>
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
      </div>

      {/* Header - AsterDEX Style */}
      <header className="border-b border-[#2b3139] bg-[#181a20]/80 backdrop-blur-md sticky top-0 z-40 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left - Logo & Title */}
            <div className="flex items-center gap-6">
              <div 
                className="flex items-center gap-3 cursor-pointer group transition-all hover:opacity-80"
                onClick={() => setShowLanding(true)}
                title="Back to Home"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white group-hover:ring-2 group-hover:ring-[#f0b90b] transition-all">
                  <Image src="/A101.png" alt="A101" width={48} height={48} className="object-cover" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight group-hover:text-[#f0b90b] transition-colors">A101 AI Trader</h1>
                  <p className="text-xs text-slate-500">Powered by A101 Protocol</p>
                </div>
              </div>
              
              {/* Status Badges */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0ecb81]/10 border border-[#0ecb81]/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-[#0ecb81] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[#0ecb81] font-medium">Live</span>
                </div>
                <div className="px-2.5 py-1 bg-[#2b3139] border border-[#474d57] rounded-full">
                  <span className="text-xs text-slate-400">AI Powered</span>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              {apiKeys && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#2b3139] rounded-lg border border-[#474d57]">
                  <div className="w-2 h-2 bg-[#0ecb81] rounded-full"></div>
                  <span className="text-xs text-slate-400">Connected</span>
                </div>
              )}
              <button
                data-settings-btn
                onClick={() => setShowApiKeysModal(true)}
                className="flex items-center gap-2 bg-[#2b3139] hover:bg-[#343b44] text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg border border-[#474d57]"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* API Keys Modal */}
      <ApiKeysModal
        isOpen={showApiKeysModal}
        onClose={() => setShowApiKeysModal(false)}
        onSave={handleSaveApiKeys}
        currentKeys={apiKeys}
      />

      {/* Main Content - AsterDEX Style */}
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-[1800px]">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Sidebar - AI Prediction */}
          <div className="xl:col-span-4 space-y-6">
            <AIPredictionCard 
              onRequestPrediction={(symbol) => {
                // Optional: Auto-send prediction request to chat
                console.log('Prediction requested for:', symbol)
              }}
            />
            
            {/* Account Info - Mobile/Tablet */}
            <div className="xl:hidden space-y-4">
              <BalanceCard balance={balance} onRefresh={() => loadBalance(apiKeys)} />
              <PositionsList positions={positions} onRefresh={() => loadPositions(apiKeys)} />
            </div>
          </div>

          {/* Center - Chat Interface */}
          <div className="xl:col-span-5 space-y-4">
            <MessageList messages={messages} />
            <CommandInput 
              onSubmit={handleCommandSubmit} 
              isLoading={isLoading}
            />
          </div>

          {/* Right Sidebar - Account Info (Desktop) */}
          <div className="hidden xl:block xl:col-span-3 space-y-4">
            <BalanceCard balance={balance} onRefresh={() => loadBalance(apiKeys)} />
            <PositionsList positions={positions} onRefresh={() => loadPositions(apiKeys)} />
          </div>
        </div>
      </div>
    </div>
  )
}
