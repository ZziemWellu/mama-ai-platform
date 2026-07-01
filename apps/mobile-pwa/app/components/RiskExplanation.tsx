'use client'

import { AlertTriangle, CheckCircle, Info, Shield, TrendingUp, TrendingDown } from 'lucide-react'

interface RiskExplanationProps {
  riskLevel: string
  confidenceScore: number
  shapSummary: Record<string, number>
  explanation: string
  primaryCondition: string
}

export default function RiskExplanation({
  riskLevel,
  confidenceScore,
  shapSummary,
  explanation,
  primaryCondition
}: RiskExplanationProps) {
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'CRITICAL': return 'bg-red-600'
      case 'HIGH': return 'bg-orange-500'
      case 'MODERATE': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'CRITICAL': return <AlertTriangle className="w-6 h-6" />
      case 'HIGH': return <AlertTriangle className="w-6 h-6" />
      case 'MODERATE': return <Info className="w-6 h-6" />
      case 'LOW': return <CheckCircle className="w-6 h-6" />
      default: return <Shield className="w-6 h-6" />
    }
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.9) return 'Very High'
    if (score >= 0.7) return 'High'
    if (score >= 0.5) return 'Moderate'
    return 'Low'
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500'
    if (score >= 0.7) return 'bg-blue-500'
    if (score >= 0.5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatFeatureName = (key: string) => {
    const names: Record<string, string> = {
      bleeding_volume: 'Bleeding Volume',
      previous_csection: 'Previous C-Section',
      multiple_pregnancy: 'Multiple Pregnancy',
      systolic_bp: 'Systolic Blood Pressure',
      diastolic_bp: 'Diastolic Blood Pressure',
      headache: 'Headache Severity',
      fever: 'Fever',
      labour_hours: 'Labour Duration',
      visual_changes: 'Visual Changes',
      foul_discharge: 'Foul Discharge',
      gestation: 'Gestation Age',
      transport: 'Transport Access'
    }
    return names[key] || key.replace(/_/g, ' ')
  }

  // Sort features by importance
  const sortedFeatures = Object.entries(shapSummary || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Calculate total for percentage
  const total = sortedFeatures.reduce((sum, [, val]) => sum + val, 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Risk Banner */}
      <div className={`${getRiskColor()} text-white p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getRiskIcon()}
            <div>
              <p className="text-sm opacity-80">Risk Level</p>
              <p className="text-3xl font-bold">{riskLevel || 'UNKNOWN'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Confidence</p>
            <div className="flex items-center gap-3">
              <div className="w-32 h-3 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getConfidenceColor(confidenceScore || 0)}`}
                  style={{ width: `${Math.round((confidenceScore || 0) * 100)}%` }}
                />
              </div>
              <span className="text-2xl font-bold">{Math.round((confidenceScore || 0) * 100)}%</span>
            </div>
            <p className="text-xs opacity-80 mt-1">
              Model certainty: {getConfidenceLabel(confidenceScore || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Why {riskLevel}?</span> {explanation}
        </p>
        {primaryCondition && primaryCondition !== 'NORMAL' && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Primary Condition:</span> {primaryCondition}
            </p>
          </div>
        )}
      </div>

      {/* SHAP Feature Importance */}
      {Object.keys(shapSummary || {}).length > 0 && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">Top Contributing Factors</p>
            <span className="text-xs text-gray-400">Impact on risk</span>
          </div>
          <div className="space-y-4">
            {sortedFeatures.map(([key, value], index) => {
              const percentage = total > 0 ? Math.round((value / total) * 100) : Math.round(value * 100)
              const isPositive = value > 0.3
              
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400 w-6">{index + 1}</span>
                      <span className="text-sm text-gray-700">{formatFeatureName(key)}</span>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-red-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{percentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage > 30 ? 'bg-red-500' :
                        percentage > 15 ? 'bg-orange-400' :
                        'bg-yellow-400'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  {/* Small indicator dots */}
                  <div className="flex justify-between text-[10px] text-gray-400 px-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Low Confidence Warning */}
      {(confidenceScore || 0) < 0.6 && (
        <div className="p-4 bg-amber-50 border-t border-amber-200">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>Low confidence prediction — recommend clinician review</span>
          </p>
        </div>
      )}
    </div>
  )
}
