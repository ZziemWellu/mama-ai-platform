'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi, Upload, CheckCircle, Cloud } from 'lucide-react'
import { getPendingCount } from '../lib/offlineQueue'
import { flushQueue } from '../lib/offlineSync'

// Real online/offline detection (unchanged from before — this part was already correct) backed by
// the real IndexedDB queue (app/lib/offlineQueue.ts) instead of a hardcoded `pendingCount` prop, and
// a real sync (app/lib/offlineSync.ts) instead of `await new Promise(resolve => setTimeout(resolve, 2000))`.
export default function OfflineSyncIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncComplete, setSyncComplete] = useState(false)
  const [count, setCount] = useState(0)

  const refreshCount = () => { getPendingCount().then(setCount) }

  useEffect(() => {
    setIsOnline(navigator.onLine)
    refreshCount()

    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleOnline() {
    setIsOnline(true)
    handleSync()
  }

  const handleSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      await flushQueue()
      setCount(await getPendingCount())
    } finally {
      setIsSyncing(false)
      setSyncComplete(true)
      setTimeout(() => setSyncComplete(false), 3000)
    }
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
        <div className="flex items-center gap-2 text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
          <WifiOff className="w-3 h-3" />
          <span className="font-medium">Offline Mode</span>
          {count > 0 && (
            <>
              <span className="w-px h-4 bg-amber-300" />
              <span>{count} assessment{count === 1 ? '' : 's'} waiting to sync</span>
            </>
          )}
        </div>
      ) : count > 0 ? (
        <div className="flex items-center gap-2 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
          <Cloud className="w-3 h-3" />
          <span>{count} assessment{count === 1 ? '' : 's'} ready to sync</span>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`px-2 py-0.5 rounded font-medium transition ${
              isSyncing ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
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
        <div className="flex items-center gap-2 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full animate-pulse">
          <CheckCircle className="w-3 h-3" />
          <span>Sync complete!</span>
        </div>
      ) : null}
    </div>
  )
}
