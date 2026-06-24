'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    patient_id: 'P001',
    symptoms: { bleeding_volume: 600, headache_severity: 0, visual_changes: false, abdominal_pain_severity: 0, foul_discharge: false, fever: false },
    vitals: { systolic_bp: 110, diastolic_bp: 70, temperature: 36.8 },
    obstetric_history: { gestation_weeks: 39, labour_hours: 0, previous_csection: false, multiple_pregnancy: false }
  })

  const handleAssess = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('https://mama-ai-api.onrender.com/api/v1/assessments/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to connect to API' })
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level?: string) => {
    if (level === 'CRITICAL') return 'bg-red-600 text-white'
    if (level === 'HIGH') return 'bg-orange-500 text-white'
    if (level === 'MODERATE') return 'bg-yellow-500 text-black'
    if (level === 'LOW') return 'bg-green-500 text-white'
    return 'bg-gray-500 text-white'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-700 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button onClick={() => router.back()} className="text-white">← Back</button>
          <h1 className="text-lg font-bold">🚨 Emergency Assessment</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Patient</h3>
          <input type="text" value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="Patient ID" />
          <input type="number" value={formData.obstetric_history.gestation_weeks} onChange={(e) => setFormData({...formData, obstetric_history: {...formData.obstetric_history, gestation_weeks: parseInt(e.target.value) || 0}})} className="w-full border rounded p-2 text-sm mt-2" placeholder="Gestation weeks" />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Symptoms</h3>
          <select value={formData.symptoms.bleeding_volume} onChange={(e) => setFormData({...formData, symptoms: {...formData.symptoms, bleeding_volume: parseInt(e.target.value) || 0}})} className="w-full border rounded p-2 text-sm">
            <option value="0">No bleeding</option>
            <option value="300">300 mL</option>
            <option value="500">500 mL</option>
            <option value="600">600 mL</option>
            <option value="1000">1000+ mL</option>
          </select>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="flex items-center text-sm"><input type="checkbox" checked={formData.symptoms.visual_changes} onChange={(e) => setFormData({...formData, symptoms: {...formData.symptoms, visual_changes: e.target.checked}})} className="mr-2" /> Visual Changes</label>
            <label className="flex items-center text-sm"><input type="checkbox" checked={formData.symptoms.fever} onChange={(e) => setFormData({...formData, symptoms: {...formData.symptoms, fever: e.target.checked}})} className="mr-2" /> Fever</label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Vitals</h3>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={formData.vitals.systolic_bp} onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, systolic_bp: parseInt(e.target.value) || 0}})} className="border rounded p-2 text-sm" placeholder="Systolic" />
            <input type="number" value={formData.vitals.diastolic_bp} onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, diastolic_bp: parseInt(e.target.value) || 0}})} className="border rounded p-2 text-sm" placeholder="Diastolic" />
            <input type="number" step="0.1" value={formData.vitals.temperature} onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, temperature: parseFloat(e.target.value) || 36.5}})} className="border rounded p-2 text-sm" placeholder="Temp °C" />
          </div>
        </div>

        <button onClick={handleAssess} disabled={loading} className={`w-full py-3 rounded-xl text-white font-medium text-lg ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}>
          {loading ? '⏳ Assessing...' : '🚨 Assess Risk'}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-xl ${getRiskColor(result.risk_level)}`}>
            {result.error ? <p className="text-red-600">{result.error}</p> : (
              <>
                <div className="flex justify-between">
                  <div><p className="text-sm opacity-75">Risk Level</p><p className="text-2xl font-bold">{result.risk_level || 'UNKNOWN'}</p></div>
                  <div className="text-right"><p className="text-sm opacity-75">Confidence</p><p className="text-lg font-bold">{Math.round((result.confidence_score || 0) * 100)}%</p></div>
                </div>
                {result.primary_condition && result.primary_condition !== 'NORMAL' && (
                  <div className="mt-2 p-2 bg-white bg-opacity-20 rounded"><p className="font-semibold">{result.primary_condition}</p><p className="text-sm">{result.explanation}</p></div>
                )}
                {result.recommended_actions && <div className="mt-2"><p className="font-semibold text-sm">Actions:</p><ul className="list-disc list-inside text-sm">{result.recommended_actions.map((a: string, i: number) => <li key={i}>{a}</li>)}</ul></div>}
                {result.referral_options && <div className="mt-2"><p className="font-semibold text-sm">Nearby:</p>{result.referral_options.map((f: any, i: number) => <div key={i} className="bg-white bg-opacity-10 p-2 rounded mt-1 text-sm"><p className="font-medium">{f.facility_name}</p><p>📍 {f.distance_km}km · {f.estimated_travel_minutes}min</p></div>)}</div>}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
