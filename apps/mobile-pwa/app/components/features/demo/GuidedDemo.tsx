'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  MapPin, 
  Building2, 
  BarChart3, 
  Globe,
  Heart,
  Mic,
  Shield,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

interface DemoStep {
  id: number
  title: string
  description: string
  icon: any
  color: string
  action: () => void
}

interface GuidedDemoProps {
  onClose?: () => void
}

export default function GuidedDemo({ onClose }: GuidedDemoProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const steps: DemoStep[] = [
    {
      id: 1,
      title: '1. Emergency Assessment',
      description: 'AI-powered risk detection for obstetric emergencies',
      icon: AlertTriangle,
      color: 'bg-red-500',
      action: () => router.push('/assessment')
    },
    {
      id: 2,
      title: '2. Explainable AI (SHAP)',
      description: 'Understand why each prediction is made',
      icon: Activity,
      color: 'bg-purple-500',
      action: () => router.push('/assessment?demo=pph')
    },
    {
      id: 3,
      title: '3. Emergency Response',
      description: 'One-tap emergency actions and alerts',
      icon: Shield,
      color: 'bg-orange-500',
      action: () => router.push('/assessment?emergency=true')
    },
    {
      id: 4,
      title: '4. Referral Intelligence',
      description: 'Find the nearest facility with capabilities',
      icon: MapPin,
      color: 'bg-blue-500',
      action: () => router.push('/referral')
    },
    {
      id: 5,
      title: '5. Waiting Home Recommendation',
      description: 'Safe birth center recommendations',
      icon: Building2,
      color: 'bg-purple-600',
      action: () => router.push('/waiting-home')
    },
    {
      id: 6,
      title: '6. Health Economics',
      description: 'Cost savings and DALY impact',
      icon: BarChart3,
      color: 'bg-indigo-500',
      action: () => router.push('/dashboard')
    },
    {
      id: 7,
      title: '7. National Dashboard',
      description: 'Population health intelligence',
      icon: Globe,
      color: 'bg-cyan-500',
      action: () => router.push('/')
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsComplete(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepAction = () => {
    steps[currentStep].action()
    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 1500)
    } else {
      setIsComplete(true)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100
  const StepIcon = steps[currentStep].icon

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-bold">Guided Demo</h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/80 hover:text-white">
              ✕ Close
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-4 text-sm text-white/80">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!isComplete ? (
          <div className="space-y-6">
            {/* Step Info */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl ${steps[currentStep].color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <StepIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">{steps[currentStep].title}</h3>
                <p className="text-gray-500 mt-1">{steps[currentStep].description}</p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleStepAction}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Try Now <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Complete Demo <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  currentStep === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4 inline" /> Previous
              </button>
              <span className="text-xs text-gray-400">
                {currentStep + 1} / {steps.length}
              </span>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg text-sm font-medium text-teal-600 hover:bg-teal-50 transition"
              >
                Skip <ChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        ) : (
          // Completion Screen
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">🎉 Demo Complete!</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              You've experienced all the key features of MAMA-AI.
              Ready to make a real impact?
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <button
                onClick={() => {
                  setCurrentStep(0)
                  setIsComplete(false)
                }}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition"
              >
                Run Demo Again
              </button>
              <button
                onClick={() => router.push('/assessment')}
                className="px-6 py-3 border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-xl font-medium transition"
              >
                Start Assessment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step Indicators */}
      <div className="px-6 pb-4 flex justify-center gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index <= currentStep ? 'bg-teal-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
