'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
      <div className="ghana-flag" />
      
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006B3F] to-[#CE1126] flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">❤️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#006B3F]">MAMA-AI</h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Maternal Emergency Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
              🇬🇭 Ghana
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
            🏆 Ghana AI Innovation Challenge 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            <span className="bg-gradient-to-r from-[#006B3F] via-[#FCD116] to-[#CE1126] bg-clip-text text-transparent">
              No mother should die
            </span>
            <br />
            <span className="text-gray-700">because help is too far away</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-powered maternal emergency support, referral intelligence, and safe birth coordination for rural Ghana.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="w-10 h-10 rounded-xl bg-red-50 mx-auto mb-2 flex items-center justify-center">
              <span className="text-red-600 text-xl">🚨</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">47</p>
            <p className="text-xs text-gray-500">High Risk Cases</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="w-10 h-10 rounded-xl bg-green-50 mx-auto mb-2 flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">GHS 47.2K</p>
            <p className="text-xs text-gray-500">Cost Savings</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-50 mx-auto mb-2 flex items-center justify-center">
              <span className="text-purple-600 text-xl">💜</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">187</p>
            <p className="text-xs text-gray-500">DALYs Averted</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 mx-auto mb-2 flex items-center justify-center">
              <span className="text-blue-600 text-xl">🚑</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">38</p>
            <p className="text-xs text-gray-500">Successful Referrals</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/assessment">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
              <div className="text-3xl mb-1">🚨</div>
              <div className="text-sm font-medium">Emergency Assessment</div>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
              <div className="text-3xl mb-1">📊</div>
              <div className="text-sm font-medium">Dashboard</div>
            </div>
          </Link>
          <Link href="/referral">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
              <div className="text-3xl mb-1">🚑</div>
              <div className="text-sm font-medium">Find Facility</div>
            </div>
          </Link>
          <Link href="/waiting-home">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
              <div className="text-3xl mb-1">🏠</div>
              <div className="text-sm font-medium">Safe Birth Centers</div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-gray-700 mb-3">📍 Impact So Far</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <span className="text-green-600">✅</span> 24 high-risk cases detected this month
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <span className="text-green-600">✅</span> 18 successful emergency referrals
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <span className="text-green-600">✅</span> GHS 47,200 in estimated cost savings
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <span className="text-green-600">✅</span> 187 DALYs averted through early intervention
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
            <span>Updated in real-time from pilot facilities</span>
            <span>Phase 1: 10 facilities</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>❤️</span>
            <span>MAMA-AI v1.0</span>
            <span className="text-gray-300">•</span>
            <span>Ghana AI Innovation Challenge 2026</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Built with ❤️ for Ghana</span>
            <span>•</span>
            <span>Powered by CS-TC Framework</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
