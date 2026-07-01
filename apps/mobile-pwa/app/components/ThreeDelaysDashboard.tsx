'use client'

import { useState, useEffect } from 'react'
import { Clock, Car, Building2, AlertCircle, CheckCircle } from 'lucide-react'

interface DelayData {
  delay1: {
    decision: number
    recognition: number
    seeking: number
  }
  delay2: {
    transport: number
    distance: number
    travel_time: number
  }
  delay3: {
    referral: number
    triage: number
    treatment: number
  }
  total: number
}

export default function ThreeDelaysDashboard() {
  const [data, setData] = useState<DelayData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => {
      setData({
        delay1: {
          decision: 35,
          recognition: 28,
          seeking: 22
        },
        delay2: {
          transport: 42,
          distance: 38,
          travel_time: 31
        },
        delay3: {
          referral: 25,
          triage: 18,
          treatment: 15
        },
        total: 67
      })
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🕒 Three Delays Analysis</h2>
        <span className="text-sm text-gray-500">Last 30 days</span>
      </div>

      {/* Total Delay */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Average Total Delay</p>
            <p className="text-4xl font-bold">{data?.total || 0} minutes</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              Target: &lt; 30 min
            </span>
          </div>
        </div>
      </div>

      {/* Three Delays Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Delay 1: Decision */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold">Delay 1: Decision</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recognition</span>
                <span className="font-medium">{data?.delay1.recognition || 0}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data?.delay1.recognition || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Decision to Seek</span>
                <span className="font-medium">{data?.delay1.decision || 0}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${data?.delay1.decision || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Seeking Care</span>
                <span className="font-medium">{data?.delay1.seeking || 0}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-300 rounded-full" style={{ width: `${data?.delay1.seeking || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Delay 2: Transportation */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <Car className="w-5 h-5" />
            <h3 className="font-semibold">Delay 2: Transportation</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transport</span>
                <span className="font-medium">{data?.delay2.transport || 0}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${data?.delay2.transport || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Distance</span>
                <span className="font-medium">{data?.delay2.distance || 0}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${data?.delay2.distance || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Travel Time</span>
                <span className="font-medium">{data?.delay2.travel_time || 0}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-300 rounded-full" style={{ width: `${data?.delay2.travel_time || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Delay 3: Receiving Care */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Building2 className="w-5 h-5" />
            <h3 className="font-semibold">Delay 3: Receiving Care</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Referral</span>
                <span className="font-medium">{data?.delay3.referral || 0}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${data?.delay3.referral || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Triage</span>
                <span className="font-medium">{data?.delay3.triage || 0}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full" style={{ width: `${data?.delay3.triage || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Treatment</span>
                <span className="font-medium">{data?.delay3.treatment || 0}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-300 rounded-full" style={{ width: `${data?.delay3.treatment || 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">Focus area:</span> Transportation delays are the biggest bottleneck.
            Consider deploying mobile health units or strengthening ambulance networks.
          </span>
        </p>
      </div>
    </div>
  )
}
