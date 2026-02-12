'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect } from 'react'

export default function WalletConnect({ onConnect }: { onConnect?: (address: string) => void }) {
  const { address, isConnected } = useAccount()
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()

  // 1. WATCH FOR CONNECTION: Tell the parent component when we connect
  useEffect(() => {
    if (isConnected && address && onConnect) {
        onConnect(address);
    }
  }, [isConnected, address, onConnect]);

  // 2. CONNECTED STATE: Show Address & Disconnect Button
  if (isConnected && address) {
     return (
       <div className="flex items-center gap-4 bg-gray-900/50 p-1 rounded-lg border border-emerald-500/30">
         <div className="px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded font-mono text-xs flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           🟢{address.slice(0, 6)}...{address.slice(-4)}
         </div>
         <button 
           onClick={() => disconnect()}
           className="px-2 text-xs text-gray-400 hover:text-white transition-colors"
         >
           Exit
         </button>
       </div>
     )
  }

  // 3. NO WALLET DETECTED STATE
  if (connectors.length === 0) {
      return (
          <button className="px-4 py-2 bg-gray-700 text-gray-400 text-xs rounded cursor-not-allowed border border-gray-600">
             🚫 No Wallet Found
          </button>
      )
  }

  // 4. DISCONNECTED STATE: Show available connectors (MetaMask, Trust, etc)
  return (
    <div className="flex flex-col items-end gap-1">
        <div className="flex gap-2">
            {connectors.map((connector) => (
                <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded shadow-lg transition-all hover:scale-105 border border-indigo-400"
                >
                    🔗 Connect {connector.name}
                </button>
            ))}
        </div>
        
        {/* Error Message if connection fails */}
        {error && (
            <div className="text-red-400 text-[10px] bg-red-900/20 px-2 py-1 rounded">
                ⚠️ {error.message.split('.')[0]}
            </div>
        )}
    </div>
  )
}