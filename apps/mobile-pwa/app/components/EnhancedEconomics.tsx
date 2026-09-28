'use client'

import { useState, useEffect } from 'react'
import { Wallet, Heart, Activity, TrendingUp, Award, Building2, Target, BarChart3, Info } from 'lucide-react'
import { getEconomicsDashboard } from '../lib/api'

// Every figure on this screen comes from GET /economics/dashboard. It used to fill in anything the API
// didn't return — and any genuine zero, via `value || fallback` — with invented numbers (GHS 47,200,
// 187 DALYs, "62% fewer deaths", USD 580/DALY, a GHS 4.70 ROI, made-up facility rows), and showed the
// same fabricated set outright whenever the request failed. A figure the app can't honestly produce is
// now shown as "not yet estimated" rather than guessed.

interface ConditionCount {
  condition: string
  count: number
  case_fatality_rate: number | null
}

interface EconomicsData {
  total_cost_savings_ghs: number
  total_dalys_averted: number
  average_icer_usd_per_daly: number | null
  high_risk_cases: number
  successful_referrals: number
  by_facility: Array<{ facility_name: string; cost_savings: number; dalys_averted: number }>
  referrals_by_condition?: ConditionCount[]
  expected_deaths_at_stake?: number | null
  case_fatality_source?: string
}

const CONDITION_LABELS: Record<string, string> = {
  PPH: 'Postpartum haemorrhage',
  PRE_ECLAMPSIA: 'Pre-eclampsia',
  OBSTRUCTED_LABOUR: 'Obstructed labour',
  SEPSIS: 'Sepsis',
  NORMAL: 'No danger signs',
}

export default function EnhancedEconomics() {
  const [data, setData] = useState<EconomicsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEconomicsDashboard()
      .then(setData)
      .catch(() => setError('Could not load impact data. Check your connection and try again.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">{error}</div>
  }

  // Cost savings and DALYs averted need outcome and costing data (did the woman arrive, was she
  // treated, what did it cost) that the app doesn't record yet, so until any exist they're "not yet
  // estimated" — a 0 there would read as "no impact", which isn't what the data says either.
  const hasOutcomeEstimates = data.total_cost_savings_ghs > 0 || data.total_dalys_averted > 0
  const conditions = data.referrals_by_condition ?? []
  const maxCount = Math.max(1, ...conditions.map((c) => c.count))

  const cards = [
    { icon: Activity, label: 'High Risk Cases', value: data.high_risk_cases.toLocaleString(), note: 'Assessed HIGH or CRITICAL', color: 'text-red-700', iconColor: 'text-red-600' },
    { icon: TrendingUp, label: 'Referrals', value: data.successful_referrals.toLocaleString(), note: 'Referred from an assessment', color: 'text-blue-700', iconColor: 'text-blue-600' },
    { icon: Wallet, label: 'Cost Savings', value: hasOutcomeEstimates ? `GHS ${data.total_cost_savings_ghs.toLocaleString()}` : 'Not yet estimated', note: hasOutcomeEstimates ? 'From recorded outcomes' : 'Needs outcome & costing data', color: 'text-green-700', iconColor: 'text-green-600' },
    { icon: Heart, label: 'DALYs Averted', value: hasOutcomeEstimates ? data.total_dalys_averted.toFixed(1) : 'Not yet estimated', note: hasOutcomeEstimates ? 'Disability-adjusted life years' : 'Needs outcome data', color: 'text-purple-700', iconColor: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-600" />
          Health Economics Impact
        </h2>
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">📊 Live</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
                <span className="text-xs text-gray-500">{card.label}</span>
              </div>
              <p className={`font-bold mt-1 ${card.color} ${card.value === 'Not yet estimated' ? 'text-lg' : 'text-3xl'}`}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.note}</p>
            </div>
          )
        })}
      </div>

      {data.expected_deaths_at_stake != null && (
        <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-2xl p-4 border border-rose-200">
          <p className="text-sm text-gray-600">Expected maternal deaths at stake in referred cases</p>
          <p className="text-2xl font-bold text-rose-700">{data.expected_deaths_at_stake.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">
            The risk these referred complications carry at West African case-fatality rates — the danger the
            referrals acted on, not a count of deaths averted. Source: {data.case_fatality_source}
          </p>
        </div>
      )}

      {data.average_icer_usd_per_daly != null && (
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-200">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <p className="text-sm text-gray-600">Cost-Effectiveness (ICER)</p>
          </div>
          <p className="text-2xl font-bold text-indigo-700">USD {data.average_icer_usd_per_daly.toFixed(2)} / DALY</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Referrals by Condition
        </h3>
        {conditions.length === 0 ? (
          <p className="text-sm text-gray-500">No referrals recorded yet. Referrals made from an assessment result appear here.</p>
        ) : (
          <div className="space-y-3">
            {conditions.map((cond) => (
              <div key={cond.condition}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{CONDITION_LABELS[cond.condition] ?? cond.condition}</span>
                  <span className="font-medium">{cond.count} {cond.count === 1 ? 'referral' : 'referrals'}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${(cond.count / maxCount) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {cond.case_fatality_rate != null
                    ? `Case-fatality rate ${(cond.case_fatality_rate * 100).toFixed(1)}% (West Africa)`
                    : 'No matching published case-fatality rate — not estimated'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.by_facility.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Facility Breakdown
          </h3>
          <div className="space-y-2">
            {data.by_facility.map((facility) => (
              <div key={facility.facility_name} className="flex justify-between items-center border-b py-2 text-sm">
                <span className="font-medium text-gray-800">{facility.facility_name}</span>
                <span className="text-right">
                  <span className="font-bold text-green-600">GHS {facility.cost_savings.toLocaleString()}</span>
                  <span className="block text-xs text-gray-400">{facility.dalys_averted.toFixed(1)} DALYs</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasOutcomeEstimates && (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex gap-3">
          <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">
            Cost savings and DALYs averted will appear once referral outcomes (arrival, treatment, survival) and
            facility costs are recorded. Until then MAMA-AI reports only what it measures directly, rather than
            modelled impact claims.
          </p>
        </div>
      )}
    </div>
  )
}
