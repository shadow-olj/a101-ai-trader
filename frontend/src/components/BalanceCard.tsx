'use client'

import { RefreshCw, Wallet } from 'lucide-react'

interface Balance {
  balances: Array<{
    asset: string
    balance: string
    availableBalance: string
  }>
  total_balance: number
  error?: boolean
  message?: string
}

interface BalanceCardProps {
  balance: Balance | null
  onRefresh: () => void
}

export default function BalanceCard({ balance, onRefresh }: BalanceCardProps) {
  return (
    <div className="bg-[#1e2329] rounded-lg border border-[#2b3139] overflow-hidden shadow-xl shadow-black/20 min-h-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2b3139] bg-gradient-to-r from-[#181a20] to-[#1e2329]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#f0b90b]/10 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-[#f0b90b]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Account Balance</h2>
            <p className="text-xs text-slate-500">Total Assets</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="text-slate-500 hover:text-[#f0b90b] transition-colors p-1.5 hover:bg-[#2b3139] rounded"
          title="Refresh balance"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 py-2.5">
        {!balance ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <div className="w-8 h-8 border-2 border-[#f0b90b]/20 border-t-[#f0b90b] rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-400">Loading balance...</p>
          </div>
        ) : balance.error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-3">
              <Wallet className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-red-400 mb-1">{balance.message || 'Error'}</p>
            <p className="text-xs text-slate-500 mb-3">Configure your AsterDEX API Keys in Settings</p>
            <button
              onClick={() => {
                const settingsBtn = document.querySelector('[data-settings-btn]') as HTMLButtonElement
                settingsBtn?.click()
              }}
              className="text-xs bg-[#f0b90b] hover:bg-[#f8d12f] text-black px-4 py-2 rounded font-medium transition-colors"
            >
              Open Settings
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {balance.balances && balance.balances.length > 0 ? (
              balance.total_balance > 0 ? (
                <>
                  {balance.balances
                    .filter(b => parseFloat(b.balance) > 0)
                    .map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-[#2b3139] last:border-0"
                    >
                      <div>
                        <div className="text-xs font-medium text-white">{item.asset}</div>
                        <div className="text-xs text-slate-500">Available: {parseFloat(item.availableBalance).toFixed(2)}</div>
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {parseFloat(item.balance).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#2b3139] bg-gradient-to-r from-[#f0b90b]/5 to-transparent -mx-4 px-4 py-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Total Value</div>
                      <div className="text-xs text-slate-400">≈ USDT</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#f0b90b]">
                        ${balance.total_balance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <div className="w-12 h-12 bg-[#f0b90b]/10 rounded-full flex items-center justify-center mb-3">
                    <Wallet className="w-6 h-6 text-[#f0b90b]/50" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-1">No Balance</p>
                  <p className="text-xs text-slate-600">Deposit funds to start trading</p>
                </div>
              )
            ) : (
              <div className="text-center py-4 text-slate-500">
                <p className="text-xs">Loading...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
