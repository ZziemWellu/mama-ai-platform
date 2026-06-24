'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReferralPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({ patient_id: 'P004', latitude: 7.3833, longitude: -1.3667, gestation_weeks: 39, risk_level: 'CRITICAL', primary_condition: 'PPH', needs_csection: true, needs_icu: false })

  const handleReferral = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://mama-ai-api.onrender.com/api/v1/referrals/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      setResult(data)
    } catch (error) { alert('Failed to get referral') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button onClick={() => router.back()} className="text-white">← Back</button>
          <h1 className="text-lg font-bold">🚑 Referral</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <input type="text" value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} className="w-full border rounded p-2 text-sm mb-2" placeholder="Patient ID" />
          <select value={formData.risk_level} onChange={(e) => setFormData({...formData, risk_level: e.target.value})} className="w-full border rounded p-2 text-sm">
            <option value="LOW">Low</option><option value="MODERATE">Moderate</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
          </select>
          <select value={formData.primary_condition} onChange={(e) => setFormData({...formData, primary_condition: e.target.value})} className="w-full border rounded p-2 text-sm mt-2">
            <option value="PPH">Postpartum Haemorrhage</option><option value="PRE_ECLAMPSIA">Pre-eclampsia</option><option value="OBSTRUCTED_LABOUR">Obstructed Labour</option><option value="SEPSIS">Sepsis</option>
          </select>
        </div>

        <button onClick={handleReferral} disabled={loading} className={`w-full py-3 rounded-xl text-white font-medium text-lg ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {loading ? '⏳ Finding...' : '🚑 Find Facility'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-white rounded-xl border-4 border-blue-500">
            <h3 className="font-bold text-blue-700">🏥 {result.destination_facility?.name}</h3>
            <p className="text-sm text-gray-600">{result.destination_facility?.type}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm"><span>📍 {result.destination_facility?.distance_km} km</span><span>⏱ {result.destination_facility?.travel_minutes} min</span></div>
            <p className="mt-2 text-sm">📞 {result.destination_facility?.phone}</p>
            {result.referral_note && <pre className="mt-2 text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">{result.referral_note}</pre>}
          </div>
        )}
      </main>
    </div>
  )
}
