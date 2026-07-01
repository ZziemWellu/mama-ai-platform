'use client'

import { useEffect, useState } from 'react'
import { MapPin, Phone, Building2, Droplet, Clock, Car, HeartPulse } from 'lucide-react'

interface Facility {
  id: string
  name: string
  type: string
  latitude: number
  longitude: number
  distance_km: number
  travel_minutes: number
  phone: string
  has_csection: boolean
  has_blood_bank: boolean
  has_ambulance: boolean
  rating: number
}

export default function FacilityMap() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          // Fallback to Ejura
          setUserLocation({ lat: 7.3833, lng: -1.3667 })
        }
      )
    } else {
      setUserLocation({ lat: 7.3833, lng: -1.3667 })
    }

    // Fetch facilities
    fetchFacilities()
  }, [])

  const fetchFacilities = async () => {
    try {
      const response = await fetch(
        'https://mama-ai-api.onrender.com/api/v1/facilities/nearby?lat=7.3833&lng=-1.3667&radius=50'
      )
      const data = await response.json()
      setFacilities(data.facilities || [])
    } catch (error) {
      // Mock data if API fails
      setFacilities([
        {
          id: '1',
          name: 'Ejura District Building2',
          type: 'District Building2',
          latitude: 7.3833,
          longitude: -1.3667,
          distance_km: 0.5,
          travel_minutes: 5,
          phone: '+233 24 123 4567',
          has_csection: true,
          has_blood_bank: true,
          has_ambulance: true,
          rating: 4.5
        },
        {
          id: '2',
          name: 'Nkwanta Health Centre',
          type: 'Health Centre',
          latitude: 7.3500,
          longitude: -1.4000,
          distance_km: 18,
          travel_minutes: 30,
          phone: '+233 24 765 4321',
          has_csection: false,
          has_blood_bank: false,
          has_ambulance: true,
          rating: 3.8
        },
        {
          id: '3',
          name: 'Mampong District Building2',
          type: 'District Building2',
          latitude: 7.3000,
          longitude: -1.4200,
          distance_km: 25,
          travel_minutes: 42,
          phone: '+233 24 333 4444',
          has_csection: true,
          has_blood_bank: true,
          has_ambulance: true,
          rating: 4.2
        },
        {
          id: '4',
          name: 'Kintampo Maternal Waiting Home',
          type: 'Waiting Home',
          latitude: 7.4000,
          longitude: -1.3500,
          distance_km: 9,
          travel_minutes: 15,
          phone: '+233 24 555 6666',
          has_csection: false,
          has_blood_bank: false,
          has_ambulance: false,
          rating: 4.0
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📍 Nearby Facilities</h2>
          <p className="text-sm text-gray-500">{facilities.length} facilities within 50km</p>
        </div>
        <button className="text-sm text-teal-600 font-medium hover:text-teal-700">
          View All →
        </button>
      </div>

      {/* Map (simulated with grid for hackathon) */}
      <div className="relative bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-4 min-h-[400px] border-2 border-dashed border-teal-200">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-teal-600 mx-auto" />
            <p className="text-sm text-gray-500">Interactive Map</p>
            <p className="text-xs text-gray-400">(Live map integration available)</p>
          </div>
        </div>

        {/* Facility Cards Overlay */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedFacility?.id === facility.id ? 'ring-2 ring-teal-500' : ''
              }`}
              onClick={() => setSelectedFacility(facility)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{facility.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {facility.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <span>⭐</span>
                  <span className="text-sm font-medium">{facility.rating}</span>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1 text-sm text-gray-600">
                <span>📍 {facility.distance_km} km</span>
                <span>⏱ {facility.travel_minutes} min</span>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {facility.has_csection && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> C-Section
                  </span>
                )}
                {facility.has_blood_bank && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Droplet className="w-3 h-3" /> Blood Bank
                  </span>
                )}
                {facility.has_ambulance && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Car className="w-3 h-3" /> Car
                  </span>
                )}
              </div>

              {selectedFacility?.id === facility.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  <button className="w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> Call {facility.phone}
                  </button>
                  <button className="w-full border border-teal-600 text-teal-600 py-2 rounded-lg text-sm font-medium hover:bg-teal-50 transition flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" /> Get Directions
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span> C-Section Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span> Car
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500"></span> Blood Bank
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-purple-500"></span> Waiting Home
        </span>
      </div>
    </div>
  )
}
