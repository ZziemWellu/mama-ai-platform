'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface VoiceAssistantProps {
  onAssessmentComplete?: (data: any) => void
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function VoiceAssistant({ onAssessmentComplete }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [assessmentData, setAssessmentData] = useState<any>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)

  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  const questions = [
    { id: 'bleeding', question: "Is the mother bleeding? If yes, how much? (none, light, heavy, very heavy)", field: 'bleeding_volume' },
    { id: 'conscious', question: "Is she conscious and responsive?", field: 'conscious' },
    { id: 'bp', question: "What is her blood pressure? (systolic over diastolic)", field: 'bp' },
    { id: 'headache', question: "Does she have a severe headache?", field: 'headache' },
    { id: 'visual', question: "Are there any visual changes or blurred vision?", field: 'visual_changes' },
    { id: 'fever', question: "Does she have a fever?", field: 'fever' },
    { id: 'labour', question: "How long has she been in labour? (in hours)", field: 'labour_hours' },
    { id: 'previous', question: "Has she had a previous C-section?", field: 'previous_csection' }
  ]

  useEffect(() => {
    // Check if speech recognition is supported
    const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    setIsSpeechSupported(isSupported)

    if (isSupported) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcriptText = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('')
        setTranscript(transcriptText)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        if (transcript) {
          processResponse(transcript)
        }
      }
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis
    }

    // Start with introduction
    setTimeout(() => {
      if (isSupported) {
        speakText("Welcome to MAMA-AI Voice Assistant. I'll guide you through the emergency assessment. Let's begin.")
      }
    }, 1000)

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          // Ignore abort errors
        }
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
      }
    }
  }, [])

  const speakText = (text: string) => {
    if (!synthesisRef.current) return
    try {
      synthesisRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      synthesisRef.current.speak(utterance)
    } catch (e) {
      console.error('Speech synthesis error:', e)
      setIsSpeaking(false)
    }
  }

  const toggleListening = () => {
    if (!isSpeechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop()
      } catch (e) {
        // Ignore stop errors
      }
      setIsListening(false)
    } else {
      setTranscript('')
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (e) {
        console.error('Speech recognition start error:', e)
        alert('Unable to start speech recognition. Please try again.')
      }
    }
  }

  const processResponse = (text: string) => {
    setIsProcessing(true)
    
    const question = questions[currentStep]
    if (!question) {
      setIsProcessing(false)
      return
    }

    let value: any = text.toLowerCase().trim()
    
    switch (question.field) {
      case 'bleeding_volume':
        if (value.includes('none') || value.includes('no')) value = 0
        else if (value.includes('heavy') || value.includes('600')) value = 600
        else if (value.includes('light')) value = 300
        else if (value.includes('very heavy') || value.includes('1000')) value = 1000
        else value = parseInt(value) || 0
        break
      case 'conscious':
        value = value.includes('yes') || value.includes('conscious') || value.includes('awake')
        break
      case 'bp':
        const bpMatch = text.match(/(\d+)\s*\/\s*(\d+)/)
        if (bpMatch) {
          value = { systolic: parseInt(bpMatch[1]), diastolic: parseInt(bpMatch[2]) }
        } else {
          const numbers = text.match(/\d+/g)
          if (numbers && numbers.length >= 2) {
            value = { systolic: parseInt(numbers[0]), diastolic: parseInt(numbers[1]) }
          } else {
            value = { systolic: 120, diastolic: 80 }
          }
        }
        break
      case 'headache':
        value = value.includes('yes') || value.includes('severe')
        break
      case 'visual_changes':
        value = value.includes('yes') || value.includes('blurred') || value.includes('visual')
        break
      case 'fever':
        value = value.includes('yes') || value.includes('fever') || value.includes('hot')
        break
      case 'labour_hours':
        value = parseInt(value) || 0
        break
      case 'previous_csection':
        value = value.includes('yes') || value.includes('previous')
        break
    }

    setAssessmentData((prev: any) => ({
      ...prev,
      [question.field]: value,
      [`${question.field}_text`]: text
    }))

    const nextStep = currentStep + 1
    if (nextStep < questions.length) {
      setCurrentStep(nextStep)
      const nextQuestion = questions[nextStep]
      setTimeout(() => {
        speakText(nextQuestion.question)
        setIsProcessing(false)
      }, 500)
    } else {
      setTimeout(() => {
        speakText("Assessment complete. Processing your results...")
        setIsProcessing(false)
        completeAssessment()
      }, 500)
    }
  }

  const completeAssessment = () => {
    const patientData = {
      patient_id: `P${Date.now().toString().slice(-4)}`,
      symptoms: {
        bleeding_volume: assessmentData.bleeding_volume || 0,
        headache_severity: assessmentData.headache ? 8 : 0,
        visual_changes: assessmentData.visual_changes || false,
        abdominal_pain_severity: 0,
        foul_discharge: false,
        fever: assessmentData.fever || false
      },
      vitals: {
        systolic_bp: assessmentData.bp?.systolic || 120,
        diastolic_bp: assessmentData.bp?.diastolic || 80,
        temperature: 36.8
      },
      obstetric_history: {
        gestation_weeks: 38,
        labour_hours: assessmentData.labour_hours || 0,
        previous_csection: assessmentData.previous_csection || false,
        multiple_pregnancy: false
      }
    }

    if (onAssessmentComplete) {
      onAssessmentComplete(patientData)
    }

    setResponse("Assessment complete! I've recorded all your responses. Redirecting to results...")
    speakText("Assessment complete. Redirecting to results.")
  }

  const getProgress = () => {
    return Math.round((currentStep / questions.length) * 100)
  }

  if (!isSpeechSupported) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Voice Assistant</h3>
            <p className="text-xs text-gray-500">Speech recognition not supported</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700">
            ⚠️ Voice Assistant is not supported in this browser. 
            Please use Chrome or Edge for voice features, or use the manual assessment form.
          </p>
          <a 
            href="/assessment" 
            className="mt-3 inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition"
          >
            Go to Manual Assessment →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Voice Assistant</h3>
            <p className="text-xs text-gray-500">Hands-free emergency assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isListening && (
            <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full animate-pulse">
              <Mic className="w-3 h-3" /> Listening
            </span>
          )}
          {isSpeaking && (
            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              <Volume2 className="w-3 h-3" /> Speaking
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Assessment Progress</span>
          <span>{getProgress()}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl p-4 mb-4 min-h-[80px]">
        {currentStep < questions.length ? (
          <div>
            <p className="text-xs text-purple-600 font-medium mb-1">Question {currentStep + 1} of {questions.length}</p>
            <p className="text-gray-800 font-medium">{questions[currentStep].question}</p>
            {transcript && (
              <p className="text-sm text-gray-500 mt-2">
                You said: "{transcript}"
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Assessment Complete!</span>
          </div>
        )}
      </div>

      {response && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-700">
          {response}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={toggleListening}
          disabled={isProcessing || isSpeaking}
          className={`flex-1 py-3 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700' 
              : isProcessing || isSpeaking
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isListening ? (
            <>
              <Mic className="w-5 h-5" /> Stop Listening
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Processing...
            </>
          ) : isSpeaking ? (
            <>
              <Volume2 className="w-5 h-5" /> Speaking...
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" /> Speak Now
            </>
          )}
        </button>

        <button
          onClick={() => {
            if (currentStep < questions.length) {
              speakText(questions[currentStep].question)
            }
          }}
          disabled={isSpeaking || isProcessing}
          className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          title="Repeat question"
        >
          <Volume2 className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={() => {
            if (synthesisRef.current) {
              synthesisRef.current.cancel()
              setIsSpeaking(false)
            }
          }}
          className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
          title="Stop speaking"
        >
          <VolumeX className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : isSpeaking ? 'bg-blue-500' : 'bg-gray-300'}`} />
        <span>
          {isListening ? 'Listening...' : 
           isSpeaking ? 'Speaking...' : 
           isProcessing ? 'Processing...' :
           'Ready — click "Speak Now" to start'}
        </span>
      </div>
    </div>
  )
}
