'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Info, AlertTriangle } from 'lucide-react'

interface Factor {
  name: string
  value: number
  impact: 'positive' | 'negative'
}

interface ExplainableAIVisualProps {
  prediction?: string
  confidence?: number
  factors?: Factor[]
}

export default function ExplainableAIVisual({ 
  prediction = 'Postpartum Haemorrhage',
  confidence = 98,
  factors = [
    { name: 'Bleeding Volume', value: 85, impact: 'positive' },
    { name: 'Blood Pressure', value: 65, impact: 'positive' },
    { name: 'Gestation Age', value: 45, impact: 'positive' },
    { name: 'Previous PPH', value: 35, impact: 'positive' },
    { name: 'Fever', value: 15, impact: 'negative' },
  ]
}: ExplainableAIVisualProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getColor = (value: number) => {
    if (value > 70) return 'bg-red-500'
    if (value > 40) return 'bg-orange-500'
    return 'bg-yellow-500'
  }

  const getConfidenceColor = (value: number) => {
    if (value > 90) return 'text-green-600'
    if (value > 70) return 'text-blue-600'
    return 'text-yellow-600'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500">AI Prediction</h3>
            <p className="text-2xl font-bold text-gray-800">{prediction}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-medium text-gray-500">Confidence</h3>
            <p className={`text-2xl font-bold ${getConfidenceColor(confidence)}`}>
              {confidence}%
            </p>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mt-4">
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${getColor(confidence)}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Contributing Factors */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            Most Influential Factors
          </h4>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="space-y-4">
          {factors.map((factor, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{factor.name}</span>
                  {factor.impact === 'positive' ? (
                    <TrendingUp className="w-3 h-3 text-red-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-green-500" />
                  )}
                </div>
                <span className="font-semibold text-gray-700">{factor.value}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    factor.value > 70 ? 'bg-red-500' :
                    factor.value > 40 ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${factor.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {showDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600" />
              How This Works
            </h5>
            <p className="text-sm text-gray-600">
              SHAP (SHapley Additive exPlanations) shows how each factor contributes to the prediction.
              Higher percentages mean stronger influence on the risk assessment.
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold">Why {prediction}?</span> Bleeding Volume is the primary driver,
              combined with elevated blood pressure and gestational age. Immediate intervention recommended.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
