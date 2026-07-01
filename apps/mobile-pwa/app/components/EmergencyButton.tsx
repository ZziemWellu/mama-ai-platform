'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Phone, MapPin, Clock } from 'lucide-react'

export default function EmergencyButton() {
  const router = useRouter()
  const [isPressed, setIsPressed] = useState(false)

  const handleEmergency = () => {
    setIsPressed(true)
    // Vibrate on mobile
    if (navigator.vibrate) navigator.vibrate(200)
    // Navigate directly to assessment with emergency flag
    router.push('/assessment?emergency=true')
  }

  return (
    <div className="relative">
      <button
        onClick={handleEmergency}
        className={`
          w-full py-6 rounded-2xl text-white font-bold text-xl
          flex items-center justify-center gap-4
          transition-all duration-300 transform
          ${isPressed ? 'scale-95' : 'scale-100 hover:scale-105'}
          bg-gradient-to-r from-red-600 to-red-700
          shadow-lg hover:shadow-xl
          animate-pulse
        `}
      >
        <AlertTriangle className="w-8 h-8" />
        <span>🚨 EMERGENCY</span>
      </button>

      {/* Quick action buttons */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <button className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-1 border border-gray-100">
          <Phone className="w-5 h-5 text-green-600" />
          <span className="text-xs text-gray-600">Call 112</span>
        </button>
        <button className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-1 border border-gray-100">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span className="text-xs text-gray-600">Nearest Facility</span>
        </button>
        <button className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-1 border border-gray-100">
          <Clock className="w-5 h-5 text-purple-600" />
          <span className="text-xs text-gray-600">Car ETA</span>
        </button>
      </div>
    </div>
  )
}
