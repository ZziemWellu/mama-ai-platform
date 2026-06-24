'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://mama-ai-api.onrender.com/api/v1/economics/dashboard')
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button onClick={() => router.back()} className="text-white">← Back</button>
          <h1 className="text-lg font-bold">📊 Dashboard</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-200"><p className="text-sm text-gray-600">💰 Savings</p><p className="text-2xl font-bold text-green-700">GHS {stats?.total_cost_savings_ghs?.toLocaleString() || 0}</p></div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200"><p className="text-sm text-gray-600">🩺 DALYs</p><p className="text-2xl font-bold text-purple-700">{stats?.total_dalys_averted?.toFixed(1) || 0}</p></div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200"><p className="text-sm text-gray-600">⚠️ High Risk</p><p className="text-2xl font-bold text-blue-700">{stats?.high_risk_cases || 0}</p></div>
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200"><p className="text-sm text-gray-600">🚑 Referrals</p><p className="text-2xl font-bold text-yellow-700">{stats?.successful_referrals || 0}</p></div>
        </div>

        {stats?.average_icer_usd_per_daly !== undefined && (
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 mb-4">
            <p className="text-sm text-gray-600">📈 ICER</p>
            <p className="text-2xl font-bold text-indigo-700">USD {stats.average_icer_usd_per_daly.toFixed(2)} / DALY</p>
            <p className="text-xs text-gray-500 mt-1">{stats.average_icer_usd_per_daly < 2200 ? '✅ Cost-effective' : '⚠️ Above threshold'}</p>
          </div>
        )}

        {stats?.facility_breakdown?.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="font-medium text-gray-700 mb-2">🏥 Facilities</h3>
            {stats.facility_breakdown.map((f: any, i: number) => (
              <div key={i} className="flex justify-between border-b py-1 text-sm"><span>{f.facility_name}</span><span className="font-medium text-green-600">GHS {f.cost_savings.toLocaleString()}</span></div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
