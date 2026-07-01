'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi, Upload, CheckCircle, AlertTriangle, Cloud } from 'lucide-react'

interface OfflineSyncIndicatorProps {
  pendingCount?: number
}

export default function OfflineSyncIndicator({ pendingCount = 12 }: OfflineSyncIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncComplete, setSyncComplete] = useState(false)
  const [count, setCount] = useState(pendingCount)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-sync when coming online
      if (count > 0) {
        handleSync()
      }
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [count])

  const handleSync = async () => {
    if (isSyncing || count === 0) return

    setIsSyncing(true)
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCount(0)
    setIsSyncing(false)
    setSyncComplete(true)

    setTimeout(() => setSyncComplete(false), 3000)
  }

  if (isOnline && count === 0) {
    return (
      <div className="flex items-center gap-2 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
        <Wifi className="w-3 h-3" />
        <span>Connected</span>
        <span className="text-green-500">●</span>
        <span className="text-xs opacity-60">All data synced</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {!isOnline ? (
        // Offline Mode
        <div className="flex items-center gap-2 text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
          <WifiOff className="w-3 h-3" />
          <span className="font-medium">Offline Mode</span>
          <span className="w-px h-4 bg-amber-300" />
          <span>{count} assessments waiting</span>
          <button
            onClick={() => alert('Connect to internet to sync')}
            className="text-amber-700 hover:text-amber-900 font-medium underline-offset-2 hover:underline"
          >
            [Sync when connected]
          </button>
        </div>
      ) : count > 0 ? (
        // Online with pending sync
        <div className="flex items-center gap-2 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
          <Cloud className="w-3 h-3" />
          <span>{count} assessments ready to sync</span>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`px-2 py-0.5 rounded font-medium transition ${
              isSyncing
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSyncing ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin">⏳</span> Syncing...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Upload className="w-3 h-3" /> Sync Now
              </span>
            )}
          </button>
        </div>
      ) : syncComplete ? (
        // Sync complete
        <div className="flex items-center gap-2 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full animate-pulse">
          <CheckCircle className="w-3 h-3" />
          <span>Sync complete!</span>
        </div>
      ) : null}
    </div>
  )
}
