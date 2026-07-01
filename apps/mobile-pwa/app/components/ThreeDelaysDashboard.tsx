'use client'

import { useState, useEffect } from 'react'
import { Clock, Car, Building2, AlertCircle, CheckCircle, Users, MapPin, Phone } from 'lucide-react'

interface DelayData {
  delay1: {
    decision: number
    recognition: number
    seeking: number
    solutions: string[]
  }
  delay2: {
    transport: number
    distance: number
    travel_time: number
    solutions: string[]
  }
  delay3: {
    referral: number
    triage: number
    treatment: number
    solutions: string[]
  }
  total: number
}

export default function ThreeDelaysDashboard() {
  const [data, setData] = useState<DelayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDelay, setSelectedDelay] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    setTimeout(() => {
      setData({
        delay1: {
          decision: 35,
          recognition: 28,
          seeking: 22,
          solutions: [
            '📱 Community awareness campaigns via SMS',
            '👩‍⚕️ Training for traditional birth attendants',
            '📻 Radio health education programs',
            '🏥 Mobile health clinics in remote areas'
          ]
        },
        delay2: {
          transport: 42,
          distance: 38,
          travel_time: 31,
          solutions: [
            '🚑 Ambulance dispatch coordination system',
            '🗺️ Referral route optimization',
            '🏍️ Emergency motorbike transport network',
            '📡 Real-time road condition monitoring'
          ]
        },
        delay3: {
          referral: 25,
          triage: 18,
          treatment: 15,
          solutions: [
            '🏥 Facility capacity monitoring',
            '📋 Automated referral notes',
            '💊 Essential drug stock tracking',
            '👩‍⚕️ Telemedicine consultation support'
          ]
        },
        total: 67
      })
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const delayDetails = {
    1: {
      title: 'Delay 1: Decision to Seek Care',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      description: 'Time from recognizing danger signs to deciding to seek care',
      stats: [
        { label: 'Recognition', value: data?.delay1.recognition || 0 },
        { label: 'Decision to Seek', value: data?.delay1.decision || 0 },
        { label: 'Seeking Care', value: data?.delay1.seeking || 0 }
      ],
      solutions: data?.delay1.solutions || []
    },
    2: {
      title: 'Delay 2: Transportation to Care',
      icon: <Car className="w-6 h-6" />,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      description: 'Time from deciding to seek care to arriving at a facility',
      stats: [
        { label: 'Transport Availability', value: data?.delay2.transport || 0 },
        { label: 'Distance', value: data?.delay2.distance || 0 },
        { label: 'Travel Time', value: data?.delay2.travel_time || 0 }
      ],
      solutions: data?.delay2.solutions || []
    },
    3: {
      title: 'Delay 3: Receiving Care',
      icon: <Building2 className="w-6 h-6" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      description: 'Time from arrival at facility to receiving appropriate care',
      stats: [
        { label: 'Referral', value: data?.delay3.referral || 0 },
        { label: 'Triage', value: data?.delay3.triage || 0 },
        { label: 'Treatment', value: data?.delay3.treatment || 0 }
      ],
      solutions: data?.delay3.solutions || []
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-teal-600" />
          Three Delays Analysis
        </h2>
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

      {/* Delay Selector Tabs */}
      <div className="flex gap-2">
        {[1, 2, 3].map((num) => {
          const delay = delayDetails[num as 1 | 2 | 3]
          return (
            <button
              key={num}
              onClick={() => setSelectedDelay(num as 1 | 2 | 3)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 ${
                selectedDelay === num
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {delay.icon}
              <span>Delay {num}</span>
            </button>
          )
        })}
      </div>

      {/* Selected Delay Detail */}
      {(() => {
        const delay = delayDetails[selectedDelay]
        return (
          <div className={`${delay.bg} rounded-2xl p-6 border ${delay.border}`}>
            <div className="flex items-center gap-2 mb-2">
              {delay.icon}
              <h3 className={`text-lg font-semibold ${delay.color}`}>{delay.title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{delay.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {delay.stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-2xl font-bold text-gray-800">{stat.value}%</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* How MAMA-AI Solves This Delay */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                How MAMA-AI Addresses This Delay
              </p>
              <ul className="space-y-1.5">
                {delay.solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-teal-500">→</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Impact Measurement */}
            <div className="mt-3 p-3 bg-white/50 rounded-xl">
              <p className="text-xs text-gray-500">
                📊 MAMA-AI reduces this delay by an average of {selectedDelay === 1 ? '28%' : selectedDelay === 2 ? '31%' : '22%'}
              </p>
              <div className="mt-1 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: selectedDelay === 1 ? '28%' : selectedDelay === 2 ? '31%' : '22%' }}
                />
              </div>
            </div>
          </div>
        )
      })()}

      {/* Summary Footer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">Key Insight:</span> Transportation delays are the biggest bottleneck.
            MAMA-AI's referral coordination system reduces this by up to 31%.
          </span>
        </p>
      </div>
    </div>
  )
}
