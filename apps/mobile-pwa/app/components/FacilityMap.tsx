'use client'

import { useEffect, useState } from 'react'
import { MapPin, Phone, Building2, Droplet, Clock, Car, Heart, Stethoscope, CheckCircle, XCircle } from 'lucide-react'

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
  has_theatre: boolean
  has_icu: boolean
  has_obstetrician: boolean
  has_ambulance: boolean
  rating: number
  reason?: string
}

export default function FacilityMap() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      // Enhanced mock data with capabilities
      setFacilities([
        {
          id: '1',
          name: 'Ejura District Hospital',
          type: 'District Hospital',
          latitude: 7.3833,
          longitude: -1.3667,
          distance_km: 0.5,
          travel_minutes: 5,
          phone: '+233 24 123 4567',
          has_csection: true,
          has_blood_bank: true,
          has_theatre: true,
          has_icu: true,
          has_obstetrician: true,
          has_ambulance: true,
          rating: 4.5,
          reason: 'Nearest facility with C-section, blood bank, and 24-hour theatre'
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
          has_theatre: false,
          has_icu: false,
          has_obstetrician: false,
          has_ambulance: true,
          rating: 3.8,
          reason: 'Closest facility with ambulance services'
        },
        {
          id: '3',
          name: 'Mampong District Hospital',
          type: 'District Hospital',
          latitude: 7.3000,
          longitude: -1.4200,
          distance_km: 25,
          travel_minutes: 42,
          phone: '+233 24 333 4444',
          has_csection: true,
          has_blood_bank: true,
          has_theatre: true,
          has_icu: false,
          has_obstetrician: true,
          has_ambulance: true,
          rating: 4.2,
          reason: 'Specialist obstetric care with C-section and blood bank'
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
          has_theatre: false,
          has_icu: false,
          has_obstetrician: false,
          has_ambulance: false,
          rating: 4.0,
          reason: 'Safe waiting home for pregnant women near term'
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-teal-600" />
            Nearby Facilities
          </h2>
          <p className="text-sm text-gray-500">{facilities.length} facilities within 50km</p>
        </div>
        <button className="text-sm text-teal-600 font-medium hover:text-teal-700">
          View All →
        </button>
      </div>

      {/* Facility Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilities.map((facility) => (
          <div
            key={facility.id}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all cursor-pointer hover:shadow-md ${
              selectedFacility?.id === facility.id ? 'ring-2 ring-teal-500 border-teal-200' : 'border-gray-100'
            }`}
            onClick={() => setSelectedFacility(facility)}
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{facility.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {facility.type}
                </span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <span>⭐</span>
                <span className="text-sm font-medium">{facility.rating}</span>
              </div>
            </div>

            {/* Distance & Time */}
            <div className="mt-2 flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">📍 {facility.distance_km} km</span>
              <span className="flex items-center gap-1">⏱ {facility.travel_minutes} min</span>
            </div>

            {/* Capabilities */}
            <div className="mt-3 flex flex-wrap gap-1.5">
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
              {facility.has_theatre && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" /> Theatre
                </span>
              )}
              {facility.has_icu && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Heart className="w-3 h-3" /> ICU
                </span>
              )}
              {facility.has_obstetrician && (
                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" /> Obstetrician
                </span>
              )}
              {facility.has_ambulance && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Car className="w-3 h-3" /> Ambulance
                </span>
              )}
            </div>

            {/* Expanded Details - Only show when selected */}
            {selectedFacility?.id === facility.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                {/* Reason */}
                {facility.reason && (
                  <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                    <p className="text-xs font-semibold text-teal-700">Why this facility?</p>
                    <p className="text-sm text-teal-600">{facility.reason}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> Call Now
                  </button>
                  <button className="border border-teal-600 text-teal-600 py-2 rounded-lg text-sm font-medium hover:bg-teal-50 transition flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" /> Directions
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                  <span className="flex items-center gap-1">
                    {facility.has_blood_bank ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-400" />}
                    Blood available
                  </span>
                  <span className="flex items-center gap-1">
                    {facility.has_csection ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-400" />}
                    C-Section
                  </span>
                  <span className="flex items-center gap-1">
                    {facility.has_theatre ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-400" />}
                    Theatre
                  </span>
                  <span className="flex items-center gap-1">
                    {facility.has_ambulance ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-400" />}
                    Ambulance
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-gray-300"></span> Not Available
        </span>
        <span className="flex items-center gap-1">
          <Building2 className="w-3 h-3" /> C-Section
        </span>
        <span className="flex items-center gap-1">
          <Droplet className="w-3 h-3" /> Blood Bank
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" /> ICU
        </span>
      </div>
    </div>
  )
}
