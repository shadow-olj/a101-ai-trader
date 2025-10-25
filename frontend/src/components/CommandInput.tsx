'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface CommandInputProps {
  onSubmit: (command: string, confirm?: boolean) => void
  isLoading: boolean
}

export default function CommandInput({ onSubmit, isLoading }: CommandInputProps) {
  const [command, setCommand] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim() && !isLoading) {
      onSubmit(command)
      setCommand('')
    }
  }

  const quickCommands = [
    "Show my positions",
    "Check my balance",
    "What's the BTC price?",
    "Open long BTC with 10x leverage, 100 USDT",
  ]

  return (
    <form onSubmit={handleSubmit} className="bg-[#1e2329] rounded-lg border border-[#2b3139] p-4 shadow-xl shadow-black/20">
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type your command... (e.g., 'Show my balance' or 'Open long BTC 100 USDT 10x')"
            disabled={isLoading}
            className="flex-1 bg-[#2b3139] border border-[#474d57] rounded-lg px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f0b90b] focus:border-[#f0b90b] disabled:opacity-50 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!command.trim() || isLoading}
            className="bg-gradient-to-r from-[#f0b90b] to-[#f8d12f] hover:from-[#f8d12f] hover:to-[#f0b90b] disabled:bg-[#2b3139] disabled:text-slate-600 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 text-sm shadow-lg shadow-[#f0b90b]/20 hover:shadow-xl hover:shadow-[#f0b90b]/30"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Processing</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Commands */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-400">Quick commands:</span>
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCommand(cmd)}
              className="text-xs bg-[#2b3139] hover:bg-[#343b44] text-slate-400 hover:text-white px-3 py-1 rounded transition-colors border border-[#474d57]"
              disabled={isLoading}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </form>
  )
}
