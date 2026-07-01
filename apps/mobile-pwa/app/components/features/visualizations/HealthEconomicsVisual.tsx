'use client'

import { Wallet, Heart, TrendingUp, Award, BarChart3 } from 'lucide-react'

interface HealthEconomicsVisualProps {
  costSaved?: number
  dalys?: number
  icer?: number
  roi?: number
  livesSaved?: number
}

export default function HealthEconomicsVisual({
  costSaved = 47200,
  dalys = 187,
  icer = 580,
  roi = 3.2,
  livesSaved = 12
}: HealthEconomicsVisualProps) {
  const metrics = [
    { label: 'Cost Saved', value: `GHS ${costSaved.toLocaleString()}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'DALYs Averted', value: dalys, icon: Heart, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Lives Saved', value: livesSaved, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'ICER', value: `USD ${icer}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" />
          Health Economics Impact
        </h3>
        <p className="text-sm text-gray-500">Real-time economic impact of AI-assisted care</p>
      </div>

      <div className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div key={index} className={`${metric.bg} rounded-xl p-4 text-center`}>
                <Icon className={`w-5 h-5 mx-auto ${metric.color} mb-1`} />
                <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.label}</p>
              </div>
            )
          })}
        </div>

        {/* ROI Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Return on Investment (ROI)</span>
            <span className="font-semibold text-gray-800">{roi}x</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
              style={{ width: `${Math.min(roi * 25, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0x</span>
            <span>ROI</span>
            <span>5x+</span>
          </div>
        </div>

        {/* ICER Explanation */}
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-xs text-indigo-700">
            <span className="font-semibold">ICER: USD {icer} per DALY</span> — Below Ghana's GDP per capita threshold (USD 2,200),
            indicating <span className="font-semibold">cost-effective</span> intervention.
          </p>
        </div>
      </div>
    </div>
  )
}
