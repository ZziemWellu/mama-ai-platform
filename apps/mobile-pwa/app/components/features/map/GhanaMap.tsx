'use client'

import { useState } from 'react'
import { MapPin, Activity, TrendingUp } from 'lucide-react'

interface RegionData {
  name: string
  cases: number
  critical: number
  color: string
  position: { x: number; y: number }
}

export default function GhanaMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const regions: RegionData[] = [
    { name: 'Upper East', cases: 4, critical: 1, color: '#FCD34D', position: { x: 75, y: 10 } },
    { name: 'Upper West', cases: 3, critical: 0, color: '#FCD34D', position: { x: 45, y: 12 } },
    { name: 'Northern', cases: 7, critical: 2, color: '#FCD34D', position: { x: 55, y: 22 } },
    { name: 'Ashanti', cases: 12, critical: 4, color: '#EF4444', position: { x: 50, y: 45 } },
    { name: 'Bono', cases: 5, critical: 1, color: '#F97316', position: { x: 40, y: 38 } },
    { name: 'Bono East', cases: 3, critical: 0, color: '#FCD34D', position: { x: 55, y: 35 } },
    { name: 'Eastern', cases: 6, critical: 2, color: '#F97316', position: { x: 68, y: 42 } },
    { name: 'Greater Accra', cases: 8, critical: 3, color: '#EF4444', position: { x: 70, y: 55 } },
    { name: 'Western', cases: 4, critical: 1, color: '#FCD34D', position: { x: 30, y: 52 } },
    { name: 'Volta', cases: 5, critical: 1, color: '#F97316', position: { x: 80, y: 50 } },
  ]

  const totalCases = regions.reduce((sum, r) => sum + r.cases, 0)
  const totalCritical = regions.reduce((sum, r) => sum + r.critical, 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Ghana Maternal Health Map
            </h3>
            <p className="text-sm text-gray-500">Regional case distribution</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-600">Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-xs text-gray-600">High</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-300" />
              <span className="text-xs text-gray-600">Moderate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Map Container */}
        <div className="relative bg-gradient-to-b from-teal-50 to-blue-50 rounded-2xl p-8 min-h-[400px] border-2 border-dashed border-teal-200">
          {/* Map Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="text-center">
              <MapPin className="w-24 h-24 text-teal-600 mx-auto" />
              <p className="text-sm text-gray-400">Interactive Ghana Map</p>
              <p className="text-xs text-gray-300">(Live map integration available)</p>
            </div>
          </div>

          {/* Region Markers */}
          <div className="relative z-10">
            {regions.map((region) => (
              <button
                key={region.name}
                className="absolute group"
                style={{ left: `${region.position.x}%`, top: `${region.position.y}%` }}
                onClick={() => setSelectedRegion(region.name)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg transition-all hover:scale-125 ${
                    selectedRegion === region.name ? 'ring-4 ring-teal-400 scale-125' : ''
                  }`}
                  style={{ backgroundColor: region.color }}
                >
                  {region.cases}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {region.name}: {region.cases} cases
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">{totalCases}</p>
            <p className="text-xs text-gray-500">Total Cases</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{totalCritical}</p>
            <p className="text-xs text-gray-500">Critical Cases</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{regions.length}</p>
            <p className="text-xs text-gray-500">Regions Active</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">18</p>
            <p className="text-xs text-gray-500">Referrals Made</p>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500"></span> Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-400"></span> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-300"></span> Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></span> Low
          </span>
        </div>
      </div>
    </div>
  )
}
