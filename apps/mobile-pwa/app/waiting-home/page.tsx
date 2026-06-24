'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WaitingHomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    patient_id: 'P003',
    latitude: 7.3833,
    longitude: -1.3667,
    gestation_weeks: 38,
    distance_to_facility_km: 25,
    has_transport: false,
    previous_complications: false,
    road_conditions: 'fair'
  })

  const handleAssess = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        'https://mama-ai-access-risk.onrender.com/api/v1/access-risk/assess',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      )
      const data = await res.json()
      setResult(data)
    } catch (error) {
      alert('Failed to connect. Please try again.')
    }
    setLoading(false)
  }

  const getRiskColor = (level?: string) => {
    if (level === 'CRITICAL') return 'bg-red-600 text-white'
    if (level === 'HIGH') return 'bg-orange-500 text-white'
    if (level === 'MEDIUM') return 'bg-yellow-500 text-black'
    return 'bg-green-500 text-white'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-700 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button onClick={() => router.back()} className="text-white">← Back</button>
          <h1 className="text-lg font-bold">🏠 Safe Birth Centers</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <input
            type="text"
            value={formData.patient_id}
            onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
            className="w-full border rounded p-2 text-sm mb-2"
            placeholder="Patient ID"
          />
          <input
            type="number"
            value={formData.gestation_weeks}
            onChange={(e) => setFormData({
              ...formData,
              gestation_weeks: parseInt(e.target.value) || 0
            })}
            className="w-full border rounded p-2 text-sm mb-2"
            placeholder="Gestation weeks"
          />
          <input
            type="number"
            value={formData.distance_to_facility_km}
            onChange={(e) => setFormData({
              ...formData,
              distance_to_facility_km: parseFloat(e.target.value) || 0
            })}
            className="w-full border rounded p-2 text-sm"
            placeholder="Distance to facility (km)"
          />
        </div>

        <button
          onClick={handleAssess}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-medium text-lg ${
            loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {loading ? '⏳ Finding...' : '🏠 Find Safe Birth Center'}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-xl ${getRiskColor(result.access_risk_level)}`}>
            <div className="flex justify-between">
              <div>
                <p className="text-sm opacity-75">Access Risk</p>
                <p className="text-2xl font-bold">{result.access_risk_level}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Score</p>
                <p className="text-lg font-bold">{result.risk_score}/100</p>
              </div>
            </div>

            {result.waiting_homes && result.waiting_homes.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-sm">🏠 Recommended Waiting Homes:</p>
                {result.waiting_homes.map((home: any, i: number) => (
                  <div key={i} className="bg-white bg-opacity-10 p-2 rounded mt-2">
                    <p className="font-medium">{home.name}</p>
                    <p className="text-sm">📍 {home.distance_km}km · {home.estimated_travel_time_minutes}min</p>
                    <p className="text-sm">📞 {home.phone}</p>
                    <p className="text-sm">🛏 {home.available_beds} beds available</p>
                  </div>
                ))}
              </div>
            )}

            {result.rationale && (
              <p className="mt-2 text-sm opacity-80">{result.rationale}</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
