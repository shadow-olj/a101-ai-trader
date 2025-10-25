'use client'

import { useState, useEffect } from 'react'
import { X, Key, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface ApiKeysModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (keys: ApiKeys) => void
  currentKeys: ApiKeys | null
}

export interface ApiKeys {
  aster_api_key: string
  aster_api_secret: string
  openai_api_key: string
}

export default function ApiKeysModal({ isOpen, onClose, onSave, currentKeys }: ApiKeysModalProps) {
  const [asterApiKey, setAsterApiKey] = useState('')
  const [asterApiSecret, setAsterApiSecret] = useState('')
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [showKeys, setShowKeys] = useState(false)

  useEffect(() => {
    if (currentKeys) {
      setAsterApiKey(currentKeys.aster_api_key)
      setAsterApiSecret(currentKeys.aster_api_secret)
      setOpenaiApiKey(currentKeys.openai_api_key)
    }
  }, [currentKeys])

  const handleSave = () => {
    if (!asterApiKey || !asterApiSecret) {
      alert('Please enter AsterDEX API Key and Secret')
      return
    }

    onSave({
      aster_api_key: asterApiKey,
      aster_api_secret: asterApiSecret,
      openai_api_key: openaiApiKey
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#161a1e] rounded border border-[#2b3139] p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#f0b90b]" />
            <h2 className="text-xl font-semibold text-white">API Keys Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-[#2b2618] border border-[#f0b90b]/30 rounded p-3 mb-4 flex gap-2">
          <AlertCircle className="w-5 h-5 text-[#f0b90b] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-medium mb-1 text-white">Security Notice</p>
            <p className="text-xs text-slate-400">
              API Keys are stored locally in your browser and never sent to our servers except for trading operations.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* AsterDEX API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              AsterDEX API Key *
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={asterApiKey}
              onChange={(e) => setAsterApiKey(e.target.value)}
              placeholder="Enter your AsterDEX API Key"
              className="w-full bg-[#1e2329] border border-[#2b3139] rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#f0b90b] focus:border-[#f0b90b]"
            />
          </div>

          {/* AsterDEX API Secret */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              AsterDEX API Secret *
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={asterApiSecret}
              onChange={(e) => setAsterApiSecret(e.target.value)}
              placeholder="Enter your AsterDEX API Secret"
              className="w-full bg-[#1e2329] border border-[#2b3139] rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#f0b90b] focus:border-[#f0b90b]"
            />
          </div>

          {/* OpenAI API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              OpenAI API Key (Optional)
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="sk-proj-... (for advanced AI features)"
              className="w-full bg-[#1e2329] border border-[#2b3139] rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#f0b90b] focus:border-[#f0b90b]"
            />
            <div className="mt-2 p-3 bg-[#1a1d21] border border-[#2b3139] rounded">
              <p className="text-xs text-slate-300 font-medium mb-1">✨ With OpenAI API Key:</p>
              <ul className="text-xs text-slate-400 space-y-1 ml-4">
                <li>• Full natural language control</li>
                <li>• Intelligent understanding of complex trading commands</li>
                <li>• Support for all operations (open, close, leverage, etc.)</li>
                <li>• Automatic extraction of symbols, amounts, and parameters</li>
              </ul>
              <p className="text-xs text-slate-300 font-medium mt-2 mb-1">🔧 Without OpenAI API Key:</p>
              <ul className="text-xs text-slate-400 space-y-1 ml-4">
                <li>• Basic queries only (balance, positions, price)</li>
                <li>• Simple keyword-based commands required</li>
              </ul>
            </div>
          </div>

          {/* Show/Hide Keys */}
          <button
            type="button"
            onClick={() => setShowKeys(!showKeys)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showKeys ? 'Hide' : 'Show'} API Keys
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-[#1e2329] rounded space-y-2">
          <div className="text-xs text-slate-400">
            <strong className="text-slate-300">📍 AsterDEX API Keys (Required):</strong><br />
            1. Visit <a href="https://www.asterdex.com/en/api-management" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">AsterDEX API Management</a><br />
            2. Create a new API Key with trading permissions<br />
            3. Copy the API Key and Secret here
          </div>
          <div className="text-xs text-slate-400 pt-2 border-t border-[#2b3139]">
            <strong className="text-slate-300">🤖 OpenAI API Key (Optional):</strong><br />
            1. Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenAI Platform</a><br />
            2. Create a new secret key<br />
            3. Ensure your account has available credits<br />
            4. Recommended model: GPT-5 (latest & most powerful)
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-[#2b3139] hover:bg-[#343b44] text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-[#f0b90b] hover:bg-[#f8d12f] text-black px-4 py-2 rounded font-medium transition-colors"
          >
            Save Keys
          </button>
        </div>
      </div>
    </div>
  )
}
