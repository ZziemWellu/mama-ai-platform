'use client'

import { Clock, Car, Building2, AlertCircle, CheckCircle } from 'lucide-react'

interface DelayData {
  delay1: { value: number; label: string; description: string }
  delay2: { value: number; label: string; description: string }
  delay3: { value: number; label: string; description: string }
}

export default function ThreeDelaysVisual() {
  const data: DelayData = {
    delay1: { value: 22, label: 'Decision Delay', description: 'Time to recognize danger and seek care' },
    delay2: { value: 48, label: 'Transport Delay', description: 'Time to reach a health facility' },
    delay3: { value: 30, label: 'Facility Delay', description: 'Time to receive appropriate care' },
  }

  const delays = [
    { key: 'delay1', data: data.delay1, color: 'from-blue-400 to-blue-600', icon: Clock },
    { key: 'delay2', data: data.delay2, color: 'from-orange-400 to-orange-600', icon: Car },
    { key: 'delay3', data: data.delay3, color: 'from-green-400 to-green-600', icon: Building2 },
  ]

  const getDelayLevel = (value: number) => {
    if (value > 40) return { text: 'High', color: 'text-red-600' }
    if (value > 25) return { text: 'Medium', color: 'text-orange-600' }
    return { text: 'Low', color: 'text-green-600' }
  }

  const largestDelay = delays.reduce((a, b) => a.data.value > b.data.value ? a : b)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Three Delays Analysis
            </h3>
            <p className="text-sm text-gray-500">Identifying bottlenecks in maternal care</p>
          </div>
          <div className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
            {getDelayLevel(largestDelay.data.value).text} Priority
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Delay Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {delays.map((delay) => {
            const Icon = delay.icon
            const level = getDelayLevel(delay.data.value)
            return (
              <div key={delay.key} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-gray-700">{delay.data.label}</h4>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-3xl font-bold ${level.color}`}>{delay.data.value}%</p>
                    <p className="text-xs text-gray-500">{delay.data.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    delay.data.value > 40 ? 'bg-red-100 text-red-700' :
                    delay.data.value > 25 ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {level.text}
                  </span>
                </div>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${delay.color}`}
                    style={{ width: `${delay.data.value}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Insight */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Key Insight</p>
              <p className="text-sm text-amber-700">
                Transport delay is the biggest bottleneck at {largestDelay.data.value}%.
                <span className="font-medium"> Recommendation:</span> Strengthen ambulance network and referral coordination.
              </p>
            </div>
          </div>
        </div>

        {/* How MAMA-AI Helps */}
        <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-teal-800">How MAMA-AI Addresses These Delays</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-teal-700">
                <div>
                  <span className="font-medium">Delay 1:</span> Community awareness & early recognition
                </div>
                <div>
                  <span className="font-medium">Delay 2:</span> Referral coordination & facility locator
                </div>
                <div>
                  <span className="font-medium">Delay 3:</span> Facility preparation & referral notes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
