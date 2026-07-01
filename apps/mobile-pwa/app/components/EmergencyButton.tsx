'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Phone, MapPin, Clock, Car } from 'lucide-react'

export default function EmergencyButton() {
  const router = useRouter()
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleEmergency = () => {
    setIsPressed(true)
    // Vibrate on mobile
    if (navigator.vibrate) navigator.vibrate(200)
    // Navigate directly to assessment with emergency flag
    router.push('/assessment?emergency=true')
  }

  return (
    <div className="relative">
      {/* Emergency Button - Full width, prominent */}
      <button
        onClick={handleEmergency}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          w-full py-8 rounded-2xl text-white font-bold text-2xl
          flex items-center justify-center gap-6
          transition-all duration-300 transform
          ${isPressed ? 'scale-95' : isHovered ? 'scale-105' : 'scale-100'}
          bg-gradient-to-r from-red-600 via-red-700 to-red-800
          shadow-2xl hover:shadow-3xl
          animate-pulse
          relative overflow-hidden
        `}
      >
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-700 opacity-50 animate-pulse" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-4">
          <AlertTriangle className="w-12 h-12 animate-bounce" />
          <span className="tracking-wider">🚨 EMERGENCY</span>
          <AlertTriangle className="w-12 h-12 animate-bounce" />
        </div>

        {/* Subtle text */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs opacity-60">
          Tap once — Assessment starts immediately
        </div>
      </button>

      {/* Quick action buttons */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        <button className="bg-white p-3 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center gap-1 border border-gray-100 hover:border-red-200">
          <Phone className="w-5 h-5 text-green-600" />
          <span className="text-xs text-gray-600">Call 112</span>
        </button>
        <button className="bg-white p-3 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center gap-1 border border-gray-100 hover:border-red-200">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span className="text-xs text-gray-600">Nearest Facility</span>
        </button>
        <button className="bg-white p-3 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center gap-1 border border-gray-100 hover:border-red-200">
          <Clock className="w-5 h-5 text-purple-600" />
          <span className="text-xs text-gray-600">Ambulance ETA</span>
        </button>
        <button className="bg-white p-3 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center gap-1 border border-gray-100 hover:border-red-200">
          <Car className="w-5 h-5 text-red-600" />
          <span className="text-xs text-gray-600">Send Alert</span>
        </button>
      </div>

      {/* Emergency Info */}
      <div className="mt-3 text-xs text-gray-400 text-center">
        In case of emergency, tap the red button for immediate assessment.
        <br />
        All data is encrypted and secure.
      </div>
    </div>
  )
}
