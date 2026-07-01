'use client'

import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, Circle, Clock, AlertTriangle, Heart, Baby, Car, Building2 } from 'lucide-react'

interface TimelineEvent {
  id: string
  week: number
  label: string
  type: 'visit' | 'emergency' | 'referral' | 'delivery'
  status: 'completed' | 'current' | 'upcoming'
  date?: string
  notes?: string
}

interface MaternalTimelineProps {
  patientId?: string
  gestationWeeks?: number
}

export default function MaternalTimeline({ patientId = 'P001', gestationWeeks = 38 }: MaternalTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  useEffect(() => {
    const generatedEvents: TimelineEvent[] = []
    const visitWeeks = [12, 18, 24, 31, 36]
    
    visitWeeks.forEach((week) => {
      const isCompleted = week <= gestationWeeks
      generatedEvents.push({
        id: `visit-${week}`,
        week,
        label: `ANC Visit Week ${week}`,
        type: 'visit',
        status: isCompleted ? 'completed' : (week === gestationWeeks ? 'current' : 'upcoming'),
        date: isCompleted ? `Week ${week}` : undefined
      })
    })

    if (gestationWeeks >= 37) {
      generatedEvents.push({
        id: 'emergency',
        week: gestationWeeks,
        label: 'Emergency Assessment',
        type: 'emergency',
        status: 'current',
        date: 'Today'
      })
    }

    generatedEvents.push({
      id: 'referral',
      week: 40,
      label: 'Referral Planning',
      type: 'referral',
      status: gestationWeeks >= 39 ? 'current' : 'upcoming'
    })

    generatedEvents.push({
      id: 'delivery',
      week: 40,
      label: 'Expected Delivery',
      type: 'delivery',
      status: 'upcoming'
    })

    setEvents(generatedEvents)
  }, [gestationWeeks])

  const getIcon = (type: string) => {
    switch (type) {
      case 'visit': return <Calendar className="w-5 h-5" />
      case 'emergency': return <AlertTriangle className="w-5 h-5" />
      case 'referral': return <Car className="w-5 h-5" />
      case 'delivery': return <Baby className="w-5 h-5" />
      default: return <Circle className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'current': return 'bg-teal-100 text-teal-700 animate-pulse'
      case 'upcoming': return 'bg-gray-100 text-gray-500'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visit': return 'border-blue-400'
      case 'emergency': return 'border-red-400'
      case 'referral': return 'border-orange-400'
      case 'delivery': return 'border-purple-400'
      default: return 'border-gray-300'
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Maternal Journey Timeline
          </h3>
          <p className="text-sm text-gray-500">Patient: {patientId} • Week {gestationWeeks}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full">
            {gestationWeeks} weeks
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {events.map((event) => {
            const Icon = getIcon(event.type)

            return (
              <div key={event.id} className="relative pl-12">
                <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-2 ${getTypeColor(event.type)} flex items-center justify-center bg-white ${event.status === 'current' ? 'ring-4 ring-teal-200' : ''}`}>
                  {event.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    Icon
                  )}
                </div>

                <div 
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                    event.status === 'current' ? 'border-teal-200 bg-teal-50/50' : 
                    event.status === 'completed' ? 'border-green-100 bg-green-50/30' : 
                    'border-gray-100'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-gray-800 ${event.status === 'current' ? 'text-teal-700' : ''}`}>
                          {event.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>Week {event.week}</span>
                        {event.date && <span>• {event.date}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {event.type === 'emergency' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Urgent
                        </span>
                      )}
                      {event.type === 'delivery' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Baby className="w-3 h-3" /> Expected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-600" /> Completed
        </span>
        <span className="flex items-center gap-1">
          <Circle className="w-4 h-4 text-teal-600" /> Current
        </span>
        <span className="flex items-center gap-1">
          <Circle className="w-4 h-4 text-gray-300" /> Upcoming
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle className="w-4 h-4 text-red-500" /> Emergency
        </span>
        <span className="flex items-center gap-1">
          <Baby className="w-4 h-4 text-purple-500" /> Delivery
        </span>
      </div>
    </div>
  )
}
