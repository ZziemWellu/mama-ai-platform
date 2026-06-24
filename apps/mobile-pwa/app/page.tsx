'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white p-4 shadow-lg">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">MAMA-AI</h1>
            <p className="text-xs opacity-80">Maternal Emergency Intelligence • Ghana</p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                📡 Offline
              </span>
            )}
            <span className="bg-green-600 px-2 py-1 rounded-full text-xs">🇬🇭</span>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-xl mb-6">
          <h2 className="text-xl font-bold">No mother should die because help is too far away.</h2>
          <p className="text-sm opacity-90 mt-2">AI-powered maternal emergency support for rural Ghana.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/assessment" className="bg-red-600 text-white p-4 rounded-xl text-center hover:bg-red-700 transition">
            <div className="text-3xl mb-1">🚨</div>
            <div className="text-sm font-medium">Emergency Assessment</div>
          </Link>
          <Link href="/dashboard" className="bg-green-600 text-white p-4 rounded-xl text-center hover:bg-green-700 transition">
            <div className="text-3xl mb-1">📊</div>
            <div className="text-sm font-medium">Dashboard</div>
          </Link>
          <Link href="/referral" className="bg-blue-600 text-white p-4 rounded-xl text-center hover:bg-blue-700 transition">
            <div className="text-3xl mb-1">🚑</div>
            <div className="text-sm font-medium">Find Facility</div>
          </Link>
          <Link href="/waiting-home" className="bg-purple-600 text-white p-4 rounded-xl text-center hover:bg-purple-700 transition">
            <div className="text-3xl mb-1">🏠</div>
            <div className="text-sm font-medium">Safe Birth Centers</div>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-medium text-gray-700 mb-2">📈 Impact So Far</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-2xl font-bold text-green-600">47</p><p className="text-xs text-gray-500">High Risk Cases</p></div>
            <div><p className="text-2xl font-bold text-blue-600">GHS 47k</p><p className="text-xs text-gray-500">Cost Savings</p></div>
            <div><p className="text-2xl font-bold text-purple-600">187</p><p className="text-xs text-gray-500">DALYs Averted</p></div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4">
          <p>MAMA-AI v1.0 • Ghana AI Innovation Challenge 2026</p>
          <p className="mt-1"><span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>{isOnline ? 'Connected to API' : 'Offline Mode'}</p>
        </div>
      </main>
    </div>
  )
}
