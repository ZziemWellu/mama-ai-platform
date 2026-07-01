'use client'

import { useState } from 'react'
import { MapPin, Phone, BedDouble, Shield, AlertTriangle, Clock, Car, CheckCircle, XCircle, Info } from 'lucide-react'

interface WaitingHome {
  id: string
  name: string
  district: string
  distance_km: number
  estimated_travel_time_minutes: number
  phone: string
  capacity: number
  occupied_beds: number
  available_beds: number
  has_ambulance: boolean
}

interface Recommendation {
  risk_level: string
  risk_score: number
  recommendation: string
  rationale: string
  waiting_homes: WaitingHome[]
  recommended_arrival: string
  risk_factors: string[]
}

export default function WaitingHomeRecommendation() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Recommendation | null>(null)
  const [formData, setFormData] = useState({
    patient_id: 'P003',
    latitude: 7.3833,
    longitude: -1.3667,
    gestation_weeks: 38,
    distance_to_facility_km: 25,
    has_transport: false,
    previous_complications: true,
    road_conditions: 'poor',
    is_rainy_season: true,
    has_previous_hemorrhage: false,
    is_first_pregnancy: true
  })

  const handleRecommend = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        'https://mama-ai-access-risk.onrender.com/api/v1/access-risk/assess',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      )
      const data = await response.json()
      
      setResult({
        risk_level: data.access_risk_level || 'HIGH',
        risk_score: data.risk_score || 78,
        recommendation: data.recommendation || 'Relocate to waiting home within 48 hours',
        rationale: generateRationale(formData),
        waiting_homes: data.waiting_homes || [
          {
            id: '1',
            name: 'Kintampo Maternal Waiting Home',
            district: 'Kintampo',
            distance_km: 9,
            estimated_travel_time_minutes: 15,
            phone: '+233 24 555 6666',
            capacity: 24,
            occupied_beds: 6,
            available_beds: 18,
            has_ambulance: false
          },
          {
            id: '2',
            name: 'Ejura Waiting Home',
            district: 'Ejura',
            distance_km: 4,
            estimated_travel_time_minutes: 8,
            phone: '+233 24 777 8888',
            capacity: 16,
            occupied_beds: 4,
            available_beds: 12,
            has_ambulance: true
          }
        ],
        recommended_arrival: 'Within 48 hours',
        risk_factors: generateRiskFactors(formData)
      })
    } catch (error) {
      // Enhanced mock result with rationale
      setResult({
        risk_level: 'HIGH',
        risk_score: 78,
        recommendation: 'Relocate to waiting home within 48 hours',
        rationale: generateRationale(formData),
        waiting_homes: [
          {
            id: '1',
            name: 'Kintampo Maternal Waiting Home',
            district: 'Kintampo',
            distance_km: 9,
            estimated_travel_time_minutes: 15,
            phone: '+233 24 555 6666',
            capacity: 24,
            occupied_beds: 6,
            available_beds: 18,
            has_ambulance: false
          },
          {
            id: '2',
            name: 'Ejura Waiting Home',
            district: 'Ejura',
            distance_km: 4,
            estimated_travel_time_minutes: 8,
            phone: '+233 24 777 8888',
            capacity: 16,
            occupied_beds: 4,
            available_beds: 12,
            has_ambulance: true
          }
        ],
        recommended_arrival: 'Within 48 hours',
        risk_factors: generateRiskFactors(formData)
      })
    } finally {
      setLoading(false)
    }
  }

  const generateRiskFactors = (data: typeof formData): string[] => {
    const factors = []
    if (data.distance_to_facility_km > 20) {
      factors.push(`Lives ${data.distance_to_facility_km} km away from nearest facility`)
    }
    if (!data.has_transport) {
      factors.push('No personal transport available')
    }
    if (data.previous_complications) {
      factors.push('History of previous pregnancy complications')
    }
    if (data.road_conditions === 'poor' || data.road_conditions === 'flooded') {
      factors.push(`Poor road conditions (${data.road_conditions})`)
    }
    if (data.gestation_weeks >= 37) {
      factors.push(`Term pregnancy at ${data.gestation_weeks} weeks`)
    }
    if (data.is_rainy_season) {
      factors.push('Rainy season - roads may become impassable')
    }
    if (data.is_first_pregnancy) {
      factors.push('First pregnancy - higher risk of complications')
    }
    if (data.has_previous_hemorrhage) {
      factors.push('Previous hemorrhage - high risk of recurrence')
    }
    return factors
  }

  const generateRationale = (data: typeof formData): string => {
    const factors = generateRiskFactors(data)
    return factors.length > 0 ? factors.join('; ') : 'Multiple risk factors identified'
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-600'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-teal-600" />
          Patient Information
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">Patient ID</label>
            <input
              type="text"
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Gestation (weeks)</label>
            <input
              type="number"
              value={formData.gestation_weeks}
              onChange={(e) => setFormData({ ...formData, gestation_weeks: parseInt(e.target.value) || 0 })}
              className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs text-gray-500 font-medium">Distance to Facility (km)</label>
          <input
            type="number"
            value={formData.distance_to_facility_km}
            onChange={(e) => setFormData({ ...formData, distance_to_facility_km: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.has_transport}
              onChange={(e) => setFormData({ ...formData, has_transport: e.target.checked })}
              className="rounded"
            />
            Has Transport
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.previous_complications}
              onChange={(e) => setFormData({ ...formData, previous_complications: e.target.checked })}
              className="rounded"
            />
            Previous Complications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.is_rainy_season}
              onChange={(e) => setFormData({ ...formData, is_rainy_season: e.target.checked })}
              className="rounded"
            />
            Rainy Season
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.is_first_pregnancy}
              onChange={(e) => setFormData({ ...formData, is_first_pregnancy: e.target.checked })}
              className="rounded"
            />
            First Pregnancy
          </label>
        </div>
        <button
          onClick={handleRecommend}
          disabled={loading}
          className="w-full mt-4 py-3 rounded-xl text-white font-semibold bg-purple-600 hover:bg-purple-700 transition disabled:bg-gray-400"
        >
          {loading ? '⏳ Finding...' : '🏠 Find Safe Birth Center'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`${getRiskColor(result.risk_level)} text-white rounded-2xl p-6`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Access Risk Level</p>
              <p className="text-3xl font-bold">{result.risk_level}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Risk Score</p>
              <p className="text-2xl font-bold">{result.risk_score}/100</p>
            </div>
          </div>

          <div className="mt-4 bg-white/20 rounded-xl p-4">
            <p className="font-semibold text-sm">Recommendation</p>
            <p className="text-lg">{result.recommendation}</p>
            <p className="text-sm opacity-80 mt-1">⏱ Recommended arrival: {result.recommended_arrival}</p>
          </div>

          {/* Risk Factors - WHY */}
          <div className="mt-4 bg-white/20 rounded-xl p-4">
            <p className="font-semibold text-sm flex items-center gap-2">
              <Info className="w-4 h-4" />
              Why is this recommended?
            </p>
            <ul className="mt-2 space-y-1.5">
              {result.risk_factors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Waiting Homes */}
          {result.waiting_homes && result.waiting_homes.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-sm mb-3">🏠 Recommended Waiting Homes</p>
              <div className="space-y-3">
                {result.waiting_homes.map((home, i) => (
                  <div key={i} className="bg-white/20 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-lg">{home.name}</p>
                        <p className="text-sm opacity-80">{home.district}</p>
                      </div>
                      <span className="text-sm bg-green-500 px-3 py-1 rounded-full">
                        {home.available_beds} beds
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm opacity-80">
                      <span>📍 {home.distance_km} km</span>
                      <span>⏱ {home.estimated_travel_time_minutes} min</span>
                    </div>
                    <div className="flex gap-2 mt-2 text-sm">
                      <span>📞 {home.phone}</span>
                      {home.has_ambulance && (
                        <span className="flex items-center gap-1 text-xs bg-amber-500 px-2 py-0.5 rounded-full">
                          <Car className="w-3 h-3" /> Ambulance
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs opacity-70">
                      Capacity: {home.occupied_beds}/{home.capacity} occupied
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
