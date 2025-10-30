'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw, ChevronDown, Zap, Brain, Gem } from 'lucide-react'
import Image from 'next/image'

interface PredictionData {
  symbol: string
  prediction: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  priceTarget: {
    high: number
    low: number
    current: number
  }
  timeframe: string
  signals: {
    technical: string[]
    sentiment: string
  }
  lastUpdated: string
  technicalIndicators?: {
    rsi: number
    macd: { macd: number; signal: number; histogram: number }
    ema_20: number
    ema_50: number
    bollinger: { upper: number; middle: number; lower: number }
    signals: string[]
  }
  tradingSignals?: {
    recommendation: string
    entry_price: number
    stop_loss: number
    take_profit: number
    position_size: number
    risk_reward_ratio: number
  }
  historicalAccuracy?: {
    total_predictions: number
    accuracy: number
    bullish_accuracy: number
    bearish_accuracy: number
  }
}

interface AIPredictionCardProps {
  onRequestPrediction?: (symbol: string) => void
}

const SUPPORTED_SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '◆' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
]

const AI_MODELS = [
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI', color: '#10a37f', iconType: 'openai', enabled: true },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek AI', color: '#1a73e8', iconType: 'deepseek', enabled: true },
  { id: 'qwen-max', name: 'Qwen Max', provider: 'Alibaba Cloud', color: '#ff6a00', iconType: 'qwen', enabled: true },
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', color: '#d97757', iconType: 'claude', enabled: false },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', color: '#4285f4', iconType: 'gemini', enabled: false },
]

// AI Model Icon Component - Using official brand icons
const AIModelIcon = ({ type, size = 20 }: { type: string, size?: number }) => {
  switch (type) {
    case 'openai':
      // Official OpenAI logo
      return (
        <svg role="img" viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg" fill="#10a37f">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
        </svg>
      )
    case 'claude':
      // Anthropic Claude logo
      return (
        <Image 
          src="/claude.png" 
          alt="Claude" 
          width={size} 
          height={size}
          className="object-contain"
        />
      )
    case 'gemini':
      // Google Gemini logo
      return (
        <Image 
          src="/gemini.png" 
          alt="Gemini" 
          width={size} 
          height={size}
          className="object-contain"
        />
      )
    case 'qwen':
      // Alibaba Qwen logo
      return (
        <Image 
          src="/qwen-color.svg" 
          alt="Qwen" 
          width={size} 
          height={size}
          className="object-contain"
        />
      )
    case 'deepseek':
      // DeepSeek logo
      return (
        <Image 
          src="/deepseek-color.svg" 
          alt="DeepSeek" 
          width={size} 
          height={size}
          className="object-contain"
        />
      )
    case 'llama':
      // Meta logo (for Llama)
      return (
        <svg role="img" viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg" fill="#0668E1">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    default:
      return <Sparkles size={size} className="text-[#f0b90b]" />
  }
}

export default function AIPredictionCard({ onRequestPrediction }: AIPredictionCardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('BNBUSDT')
  const [selectedModel, setSelectedModel] = useState('gpt-5')
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePredict = async () => {
    setIsLoading(true)
    
    try {
      // Get API keys from localStorage
      const storedKeys = localStorage.getItem('aster_api_keys')
      const apiKeys = storedKeys ? JSON.parse(storedKeys) : null
      
      // Call real prediction API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          model: selectedModel, // Pass the selected model ID directly
          api_keys: apiKeys
        })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        setErrorMessage(data.analysis || 'Prediction failed. Please try again.')
        setIsLoading(false)
        return
      }
      
      // Format prediction data
      const predictionData: PredictionData = {
        symbol: selectedSymbol,
        prediction: data.prediction as 'bullish' | 'bearish' | 'neutral',
        confidence: Math.round(data.confidence * 100),
        priceTarget: {
          current: data.price_target.current,
          high: data.price_target.high,
          low: data.price_target.low
        },
        timeframe: data.timeframe,
        signals: {
          technical: data.signals.technical,
          sentiment: data.signals.sentiment
        },
        lastUpdated: new Date().toLocaleTimeString(),
        technicalIndicators: data.technical_indicators,
        tradingSignals: data.trading_signals,
        historicalAccuracy: data.historical_accuracy
      }
      
      setPrediction(predictionData)
      
      if (onRequestPrediction) {
        onRequestPrediction(selectedSymbol)
      }
    } catch (error) {
      console.error('Prediction error:', error)
      setErrorMessage('Failed to get prediction. Please check your API keys and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getPredictionColor = (pred: string) => {
    switch (pred) {
      case 'bullish': return 'text-[#0ecb81]'
      case 'bearish': return 'text-[#f6465d]'
      default: return 'text-slate-400'
    }
  }

  const getPredictionBg = (pred: string) => {
    switch (pred) {
      case 'bullish': return 'bg-[#0ecb81]/10 border-[#0ecb81]/30'
      case 'bearish': return 'bg-[#f6465d]/10 border-[#f6465d]/30'
      default: return 'bg-slate-500/10 border-slate-500/30'
    }
  }

  const getPredictionIcon = (pred: string) => {
    switch (pred) {
      case 'bullish': return <TrendingUp className="w-5 h-5" />
      case 'bearish': return <TrendingDown className="w-5 h-5" />
      default: return <Minus className="w-5 h-5" />
    }
  }

  const selectedCoin = SUPPORTED_SYMBOLS.find(s => s.symbol === selectedSymbol)
  const selectedAIModel = AI_MODELS.find(m => m.id === selectedModel)

  return (
    <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] rounded-xl border border-[#2b3139] overflow-hidden shadow-2xl shadow-black/30">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#2b3139] bg-gradient-to-r from-[#f0b90b]/10 via-[#f0b90b]/5 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f0b90b] to-[#f8d12f] rounded-xl flex items-center justify-center shadow-lg shadow-[#f0b90b]/20">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Market Prediction</h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <AIModelIcon type={selectedAIModel?.iconType || 'openai'} size={12} />
                <span>Powered by {selectedAIModel?.name}</span>
              </p>
            </div>
          </div>
          
          {/* Symbol Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2b3139] hover:bg-[#343b44] rounded-lg border border-[#474d57] transition-all hover:border-[#f0b90b]/30 shadow-sm"
            >
              <span className="text-xl">{selectedCoin?.icon}</span>
              <span className="text-sm font-semibold text-white">{selectedCoin?.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-xl z-10">
                {SUPPORTED_SYMBOLS.map((coin) => (
                  <button
                    key={coin.symbol}
                    onClick={() => {
                      setSelectedSymbol(coin.symbol)
                      setShowDropdown(false)
                      setPrediction(null)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#2b3139] transition-colors text-left"
                  >
                    <span className="text-xl">{coin.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{coin.name}</div>
                      <div className="text-xs text-slate-500">{coin.symbol}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* AI Model Selector */}
        <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">AI Model:</span>
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-[#2b3139] hover:bg-[#343b44] rounded-lg border border-[#474d57] transition-all hover:border-[#f0b90b]/30 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <AIModelIcon type={selectedAIModel?.iconType || 'openai'} size={20} />
                <div className="text-left">
                  <div className="text-xs font-medium text-white">{selectedAIModel?.name}</div>
                  <div className="text-xs text-slate-500">{selectedAIModel?.provider}</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            
            {showModelDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                {AI_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      if (!model.enabled) {
                        alert(`${model.name} is coming soon! Currently not supported.`)
                        return
                      }
                      setSelectedModel(model.id)
                      setShowModelDropdown(false)
                      setPrediction(null)
                    }}
                    disabled={!model.enabled}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b border-[#2b3139] last:border-0 ${
                      !model.enabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-[#2b3139] cursor-pointer'
                    } ${
                      selectedModel === model.id ? 'bg-[#2b3139]' : ''
                    }`}
                  >
                    <AIModelIcon type={model.iconType} size={24} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-white">{model.name}</div>
                        {!model.enabled && (
                          <span className="text-xs px-2 py-0.5 bg-slate-600 text-slate-300 rounded">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{model.provider}</div>
                    </div>
                    {selectedModel === model.id && model.enabled && (
                      <div className="w-2 h-2 bg-[#0ecb81] rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {!prediction && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#f0b90b]/20 to-[#f0b90b]/5 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-[#f0b90b]/10">
              <Sparkles className="w-10 h-10 text-[#f0b90b]" />
            </div>
            <p className="text-sm font-medium text-slate-300 mb-2">
              AI-Powered Market Analysis
            </p>
            <p className="text-xs text-slate-500 mb-5 max-w-xs">
              Get intelligent predictions for {selectedCoin?.name} using advanced AI models
            </p>
            <button
              onClick={handlePredict}
              className="flex items-center gap-2 bg-gradient-to-r from-[#f0b90b] to-[#f8d12f] hover:from-[#f8d12f] hover:to-[#f0b90b] text-black px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-[#f0b90b]/30 hover:shadow-xl hover:shadow-[#f0b90b]/40 hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              Analyze Market
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-14 h-14 border-4 border-[#f0b90b]/20 border-t-[#f0b90b] rounded-full animate-spin mb-5"></div>
            <p className="text-sm font-medium text-slate-300">Analyzing market data...</p>
            <p className="text-xs text-slate-500 mt-2">AI is processing market signals</p>
          </div>
        ) : prediction && (
          <div className="space-y-5">
            {/* Prediction Result */}
            <div className={`flex items-center justify-between p-5 rounded-xl border-2 ${getPredictionBg(prediction.prediction)} shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className={`${getPredictionColor(prediction.prediction)}`}>
                  {getPredictionIcon(prediction.prediction)}
                </div>
                <div>
                  <div className={`text-lg font-bold ${getPredictionColor(prediction.prediction)} uppercase`}>
                    {prediction.prediction}
                  </div>
                  <div className="text-xs text-slate-500">
                    Confidence: {prediction.confidence}%
                  </div>
                </div>
              </div>
              <button
                onClick={handlePredict}
                className="text-slate-400 hover:text-[#f0b90b] transition-colors p-2 hover:bg-[#2b3139] rounded"
                title="Refresh prediction"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Price Targets */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#2b3139]/70 rounded-xl p-4 border border-[#474d57] hover:border-[#f0b90b]/30 transition-colors">
                <div className="text-xs font-medium text-slate-400 mb-2">Current</div>
                <div className="text-base font-bold text-white">
                  ${prediction.priceTarget.current.toFixed(2)}
                </div>
              </div>
              <div className="bg-[#0ecb81]/10 rounded-xl p-4 border-2 border-[#0ecb81]/30 hover:border-[#0ecb81]/50 transition-colors">
                <div className="text-xs font-medium text-[#0ecb81] mb-2">Target High</div>
                <div className="text-base font-bold text-[#0ecb81]">
                  ${prediction.priceTarget.high.toFixed(2)}
                </div>
              </div>
              <div className="bg-[#f6465d]/10 rounded-xl p-4 border-2 border-[#f6465d]/30 hover:border-[#f6465d]/50 transition-colors">
                <div className="text-xs font-medium text-[#f6465d] mb-2">Target Low</div>
                <div className="text-base font-bold text-[#f6465d]">
                  ${prediction.priceTarget.low.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Technical Indicators */}
            {prediction.technicalIndicators && (
              <div className="bg-[#2b3139]/40 rounded-xl p-4 border border-[#474d57]">
                <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#10a37f] rounded-full"></div>
                  Technical Indicators
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1e2329] rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">RSI (14)</div>
                    <div className={`text-sm font-bold ${
                      prediction.technicalIndicators.rsi < 30 ? 'text-[#0ecb81]' :
                      prediction.technicalIndicators.rsi > 70 ? 'text-[#f6465d]' :
                      'text-slate-300'
                    }`}>
                      {prediction.technicalIndicators.rsi.toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-[#1e2329] rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">MACD</div>
                    <div className={`text-sm font-bold ${
                      prediction.technicalIndicators.macd.histogram > 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                    }`}>
                      {prediction.technicalIndicators.macd.macd.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-[#1e2329] rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">EMA 20</div>
                    <div className="text-sm font-bold text-slate-300">
                      ${prediction.technicalIndicators.ema_20.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-[#1e2329] rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">EMA 50</div>
                    <div className="text-sm font-bold text-slate-300">
                      ${prediction.technicalIndicators.ema_50.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trading Signals */}
            {prediction.tradingSignals && (
              <div className="bg-gradient-to-br from-[#f0b90b]/10 to-transparent rounded-xl p-4 border border-[#f0b90b]/30">
                <div className="text-xs font-semibold text-[#f0b90b] mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Trading Recommendation
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Action:</span>
                    <span className={`text-sm font-bold uppercase ${
                      prediction.tradingSignals.recommendation === 'buy' ? 'text-[#0ecb81]' :
                      prediction.tradingSignals.recommendation === 'sell' ? 'text-[#f6465d]' :
                      'text-slate-300'
                    }`}>
                      {prediction.tradingSignals.recommendation}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Entry Price</div>
                      <div className="text-sm font-bold text-white">
                        ${prediction.tradingSignals.entry_price.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Position Size</div>
                      <div className="text-sm font-bold text-white">
                        {prediction.tradingSignals.position_size}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#f6465d] mb-1">Stop Loss</div>
                      <div className="text-sm font-bold text-[#f6465d]">
                        ${prediction.tradingSignals.stop_loss.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#0ecb81] mb-1">Take Profit</div>
                      <div className="text-sm font-bold text-[#0ecb81]">
                        ${prediction.tradingSignals.take_profit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#2b3139]/50 rounded-lg p-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Risk/Reward Ratio:</span>
                    <span className="text-sm font-bold text-[#f0b90b]">
                      1:{prediction.tradingSignals.risk_reward_ratio.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Historical Accuracy */}
            {prediction.historicalAccuracy && prediction.historicalAccuracy.total_predictions > 0 && (
              <div className="bg-[#2b3139]/40 rounded-xl p-4 border border-[#474d57]">
                <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Historical Performance
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1e2329] rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Overall Accuracy</div>
                    <div className="text-lg font-bold text-[#0ecb81]">
                      {prediction.historicalAccuracy.accuracy.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-[#1e2329] rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Total Predictions</div>
                    <div className="text-lg font-bold text-slate-300">
                      {prediction.historicalAccuracy.total_predictions}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Signals */}
            <div className="bg-[#2b3139]/40 rounded-xl p-4 border border-[#474d57]">
              <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#f0b90b] rounded-full"></div>
                Key Technical Signals
              </div>
              <div className="space-y-2">
                {prediction.signals.technical.slice(0, 3).map((signal, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 bg-[#f0b90b] rounded-full mt-1.5 flex-shrink-0"></div>
                    <span className="text-xs text-slate-400 leading-relaxed">{signal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Sentiment */}
            <div className="bg-gradient-to-r from-[#f0b90b]/10 via-[#f0b90b]/5 to-transparent rounded-xl p-4 border border-[#f0b90b]/30">
              <div className="text-xs font-semibold text-[#f0b90b] mb-2">💡 Market Sentiment</div>
              <p className="text-xs text-slate-300 leading-relaxed">{prediction.signals.sentiment}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#2b3139]">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                Timeframe: <span className="font-medium text-slate-400">{prediction.timeframe}</span>
              </span>
              <span className="text-xs text-slate-500">
                Updated: <span className="font-medium text-slate-400">{prediction.lastUpdated}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e2329] rounded-xl border border-[#f6465d]/30 p-6 max-w-md w-full shadow-2xl shadow-[#f6465d]/20 animate-in fade-in zoom-in duration-200">
            {/* Icon */}
            <div className="w-14 h-14 bg-[#f6465d]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#f6465d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-bold text-white text-center mb-2">
              Prediction Failed
            </h3>
            
            {/* Message */}
            <p className="text-sm text-slate-400 text-center mb-6 leading-relaxed">
              {errorMessage}
            </p>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setErrorMessage(null)}
                className="flex-1 bg-[#2b3139] hover:bg-[#343b44] text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setErrorMessage(null)
                  const settingsBtn = document.querySelector('[data-settings-btn]') as HTMLButtonElement
                  settingsBtn?.click()
                }}
                className="flex-1 bg-gradient-to-r from-[#f0b90b] to-[#f8d12f] hover:from-[#f8d12f] hover:to-[#f0b90b] text-black px-4 py-2.5 rounded-lg font-semibold transition-all"
              >
                Open Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
