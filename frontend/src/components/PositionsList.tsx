'use client'

import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

interface Position {
  symbol: string
  positionAmt: string
  entryPrice: string
  markPrice: string
  unRealizedProfit: string
  leverage: string
}

interface PositionsListProps {
  positions: Position[]
  onRefresh: () => void
}

export default function PositionsList({ positions, onRefresh }: PositionsListProps) {
  const totalPnl = positions.reduce((sum, pos) => sum + parseFloat(pos.unRealizedProfit || '0'), 0)

  return (
    <div className="bg-[#1e2329] rounded-lg border border-[#2b3139] overflow-hidden shadow-xl shadow-black/20 flex flex-col" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 400px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2b3139] bg-gradient-to-r from-[#181a20] to-[#1e2329]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0ecb81]/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#0ecb81]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Open Positions</h2>
            <p className="text-xs text-slate-500">{positions.length} Active</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="text-slate-500 hover:text-[#0ecb81] transition-colors p-1.5 hover:bg-[#2b3139] rounded"
          title="Refresh positions"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-3 py-2.5 flex-1 overflow-y-auto">
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="w-12 h-12 bg-[#0ecb81]/10 rounded-full flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-[#0ecb81]/50" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">No Open Positions</p>
            <p className="text-xs text-slate-600">Start trading to see your positions here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {positions.map((position, idx) => {
              const pnl = parseFloat(position.unRealizedProfit || '0')
              const isProfitable = pnl >= 0
              const isLong = parseFloat(position.positionAmt) > 0
              
              return (
                <div
                  key={idx}
                  className="border border-[#2b3139] rounded p-2 hover:border-[#474d57] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {position.symbol}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        isLong 
                          ? 'bg-[#10b981]/10 text-[#10b981]' 
                          : 'bg-[#ef4444]/10 text-[#ef4444]'
                      }`}>
                        {isLong ? 'LONG' : 'SHORT'}
                      </span>
                      <span className="text-xs text-slate-500">{position.leverage}x</span>
                    </div>
                    <span className={`text-xs font-bold ${
                      isProfitable ? 'text-[#10b981]' : 'text-[#ef4444]'
                    }`}>
                      {isProfitable ? '+' : ''}{pnl.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500">Size</div>
                      <div className="text-white font-medium">
                        {Math.abs(parseFloat(position.positionAmt)).toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Entry</div>
                      <div className="text-white font-medium">
                        ${parseFloat(position.entryPrice).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Mark</div>
                      <div className="text-white font-medium">
                        ${parseFloat(position.markPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
