'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Phone, MapPin, Clock, X, Car, Building2 } from 'lucide-react'

export default function FloatingEmergencyButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100)
      lastScrollY = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleEmergency = () => {
    setIsOpen(false)
    router.push('/assessment?emergency=true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? 'bg-gray-800 rotate-90' 
            : 'bg-gradient-to-r from-red-600 to-red-700 hover:scale-110 animate-pulse'
        }`}
        aria-label="Emergency"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-white" />
        )}
      </button>

      {/* Menu */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 space-y-3 animate-slide-up">
          <button
            onClick={handleEmergency}
            className="w-48 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transition-all hover:scale-105"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium text-sm">Emergency Assessment</span>
          </button>
          
          <button
            onClick={() => router.push('/referral')}
            className="w-48 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transition-all hover:scale-105"
          >
            <MapPin className="w-5 h-5" />
            <span className="font-medium text-sm">Find Facility</span>
          </button>
          
          <button
            onClick={() => router.push('/waiting-home')}
            className="w-48 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transition-all hover:scale-105"
          >
            <Building2 className="w-5 h-5" />
            <span className="font-medium text-sm">Waiting Homes</span>
          </button>
          
          <button
            onClick={() => window.open('tel:112')}
            className="w-48 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transition-all hover:scale-105"
          >
            <Phone className="w-5 h-5" />
            <span className="font-medium text-sm">Call 112</span>
          </button>
        </div>
      )}
    </div>
  )
}
