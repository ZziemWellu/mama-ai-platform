'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Search, Filter, UserPlus, Phone, MapPin, Calendar, CheckCircle, Clock, AlertCircle, Upload, WifiOff, Wifi } from 'lucide-react'

interface Patient {
  id: string
  name: string
  village: string
  phone: string
  gestation_weeks: number
  due_date: string
  last_visit: string
  status: 'registered' | 'monitoring' | 'due' | 'emergency' | 'delivered'
  risk_level?: string
  missed_appointments: number
}

interface CHWModeProps {
  onPatientSelect?: (patientId: string) => void
}

export default function CommunityHealthWorkerMode({ onPatientSelect }: CHWModeProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [isOnline, setIsOnline] = useState(true)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  useEffect(() => {
    // Load mock patient data
    loadMockPatients()
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadMockPatients = () => {
    setPatients([
      {
        id: 'P001',
        name: 'Ama Mensah',
        village: 'Nkwanta',
        phone: '+233 24 111 2222',
        gestation_weeks: 38,
        due_date: '2026-07-15',
        last_visit: '2026-06-20',
        status: 'monitoring',
        missed_appointments: 0
      },
      {
        id: 'P002',
        name: 'Esi Ofori',
        village: 'Ejura',
        phone: '+233 24 333 4444',
        gestation_weeks: 36,
        due_date: '2026-07-28',
        last_visit: '2026-06-18',
        status: 'registered',
        risk_level: 'HIGH',
        missed_appointments: 1
      },
      {
        id: 'P003',
        name: 'Akua Adjei',
        village: 'Kintampo',
        phone: '+233 24 555 6666',
        gestation_weeks: 40,
        due_date: '2026-06-28',
        last_visit: '2026-06-22',
        status: 'due',
        risk_level: 'CRITICAL',
        missed_appointments: 0
      },
      {
        id: 'P004',
        name: 'Abena Kwarteng',
        village: 'Mampong',
        phone: '+233 24 777 8888',
        gestation_weeks: 34,
        due_date: '2026-08-10',
        last_visit: '2026-06-15',
        status: 'registered',
        missed_appointments: 0
      },
      {
        id: 'P005',
        name: 'Yaa Asantewaa',
        village: 'Takoradi',
        phone: '+233 24 999 0000',
        gestation_weeks: 39,
        due_date: '2026-07-05',
        last_visit: '2026-06-19',
        status: 'emergency',
        risk_level: 'CRITICAL',
        missed_appointments: 2
      }
    ])
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-100 text-blue-700'
      case 'monitoring': return 'bg-teal-100 text-teal-700'
      case 'due': return 'bg-amber-100 text-amber-700'
      case 'emergency': return 'bg-red-100 text-red-700 animate-pulse'
      case 'delivered': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered': return <Clock className="w-4 h-4" />
      case 'monitoring': return <CheckCircle className="w-4 h-4" />
      case 'due': return <AlertCircle className="w-4 h-4" />
      case 'emergency': return <AlertCircle className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.id.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'all') return matchesSearch
    return matchesSearch && patient.status === filter
  })

  const stats = {
    total: patients.length,
    due: patients.filter(p => p.status === 'due').length,
    emergency: patients.filter(p => p.status === 'emergency').length,
    delivered: patients.filter(p => p.status === 'delivered').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            Community Health Worker Mode
          </h2>
          <p className="text-sm text-gray-500">Manage pregnant women in your community</p>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          )}
          <button
            onClick={() => setShowAddPatient(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Register
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 shadow-sm border border-amber-200">
          <p className="text-xs text-amber-600">Due</p>
          <p className="text-2xl font-bold text-amber-700">{stats.due}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-200">
          <p className="text-xs text-red-600">Emergency</p>
          <p className="text-2xl font-bold text-red-700">{stats.emergency}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200">
          <p className="text-xs text-green-600">Delivered</p>
          <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, village, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
        >
          <option value="all">All</option>
          <option value="registered">Registered</option>
          <option value="monitoring">Monitoring</option>
          <option value="due">Due</option>
          <option value="emergency">Emergency</option>
          <option value="delivered">Delivered</option>
        </select>
        <button className="border rounded-xl px-4 py-2 text-sm hover:bg-gray-50 transition flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Patient List */}
      <div className="space-y-3">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
            onClick={() => {
              setSelectedPatient(patient)
              if (onPatientSelect) onPatientSelect(patient.id)
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800">{patient.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(patient.status)} flex items-center gap-1`}>
                    {getStatusIcon(patient.status)}
                    {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                  </span>
                  {patient.risk_level && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      patient.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      patient.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {patient.risk_level}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {patient.village}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {patient.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Week {patient.gestation_weeks}
                  </span>
                  <span className="flex items-center gap-1">
                    {patient.missed_appointments > 0 ? (
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                    {patient.missed_appointments} missed visits
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-lg hover:bg-teal-100 transition">
                  View
                </button>
                <button className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-100 transition">
                  Remind
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No patients found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Offline Sync Status */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">Offline Mode</span>
              <span className="text-sm">• All patient data stored locally</span>
            </div>
            <button className="text-sm bg-amber-200 text-amber-800 px-4 py-1 rounded-lg hover:bg-amber-300 transition flex items-center gap-2">
              <Upload className="w-4 h-4" /> Sync when online
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
