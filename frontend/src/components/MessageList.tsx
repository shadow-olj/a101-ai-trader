'use client'

import { useEffect, useRef } from 'react'
import { Bot, User, MessageSquare } from 'lucide-react'

interface Message {
  type: 'user' | 'bot'
  content: string
  success?: boolean
  needsConfirmation?: boolean
  timestamp: Date
}

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="bg-[#1e2329] rounded-lg border border-[#2b3139] h-[calc(100vh-280px)] min-h-[400px] overflow-y-auto shadow-xl shadow-black/20">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
          <MessageSquare className="w-16 h-16 text-slate-700 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            AI Trading Assistant
          </h3>
          <p className="text-sm text-slate-500 max-w-md mb-4">
            Use natural language to trade on AsterDEX
          </p>
          <div className="text-xs text-slate-600 space-y-1">
            <p>💡 Try: "Show my balance"</p>
            <p>💡 Try: "Open long BTC 100 USDT 10x"</p>
            <p>💡 Try: "What's the BTC price?"</p>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'bot' && (
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-[#f0b90b] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                </div>
              )}
              
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-[#f0b90b] text-black'
                    : message.success === false
                    ? 'bg-[#f6465d]/10 border border-[#f6465d]/30 text-[#f6465d]'
                    : 'bg-[#2b3139] text-white border border-[#474d57]'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                <div className="text-xs opacity-60 mt-1.5">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
              
              {message.type === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-[#2b3139] border border-[#474d57] flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}
