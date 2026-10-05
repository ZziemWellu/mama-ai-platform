'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, CheckCircle, Loader2, Languages } from 'lucide-react'
import { assessRisk, ApiError } from '../../lib/api'
import { assessOffline } from '../../lib/offlineRiskRules'
import { enqueue } from '../../lib/offlineQueue'
import RiskExplanation from '../RiskExplanation'

interface VoiceAssistantProps {
  onAssessmentComplete?: (data: any) => void
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

type Lang = 'en' | 'tw'

// Twi audio prompts are pre-generated (see scripts/generate-twi-audio.mjs) — browsers have no Twi
// speech *recognition*, only synthesis works reliably here, so Twi mode plays a real recorded/
// synthesized question and takes the answer as a tap instead of trying to transcribe spoken Twi.
// This also means every question needs a tap control, not free text — see `control` below.
//
// Each id matches shared/voice-assessment-phrases.json exactly, which is what
// scripts/generate-twi-audio.mjs reads to generate public/audio/tw/{id}.mp3.
const QUESTIONS: Array<{
  id: string
  en: string
  field: string
  control: 'choice' | 'yesno' | 'severity' | 'number' | 'bp'
  choices?: { label: string; value: number }[]
}> = [
  { id: 'bleeding', en: 'Is the mother bleeding? Choose none, light, heavy, or very heavy.', field: 'bleeding_volume', control: 'choice', choices: [
    { label: 'None', value: 0 }, { label: 'Light', value: 300 }, { label: 'Heavy', value: 600 }, { label: 'Very heavy', value: 1000 },
  ] },
  { id: 'conscious', en: 'Is she conscious and responsive?', field: 'conscious', control: 'yesno' },
  { id: 'blood_pressure', en: 'What is her blood pressure? Enter the top number, then the bottom number.', field: 'bp', control: 'bp' },
  { id: 'headache', en: 'How severe is her headache? Choose none, mild, moderate, or severe.', field: 'headache_severity', control: 'severity' },
  { id: 'visual_changes', en: 'Are there any visual changes or blurred vision?', field: 'visual_changes', control: 'yesno' },
  // The two questions below didn't exist before — without them, this flow could only ever surface
  // PPH or pre-eclampsia, never the other two real hard rules (obstructed labour needs abdominal
  // pain severity, sepsis needs foul discharge) that assessments.py already checks for.
  { id: 'abdominal_pain', en: 'How severe is her abdominal pain? Choose none, mild, moderate, or severe.', field: 'abdominal_pain_severity', control: 'severity' },
  { id: 'foul_discharge', en: 'Is there any foul-smelling discharge?', field: 'foul_discharge', control: 'yesno' },
  { id: 'fever', en: 'Does she have a fever?', field: 'fever', control: 'yesno' },
  { id: 'labour_hours', en: 'How many hours has she been in labour? Enter the number of hours.', field: 'labour_hours', control: 'number' },
  { id: 'previous_csection', en: 'Has she had a previous caesarean section?', field: 'previous_csection', control: 'yesno' },
]

const SEVERITY_CHOICES = [
  { label: 'None', value: 0 }, { label: 'Mild', value: 3 }, { label: 'Moderate', value: 6 }, { label: 'Severe', value: 9 },
]

export default function VoiceAssistant({ onAssessmentComplete }: VoiceAssistantProps) {
  const [lang, setLang] = useState<Lang>('en')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [assessmentData, setAssessmentData] = useState<any>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [bpDraft, setBpDraft] = useState({ systolic: '', diastolic: '' })
  const [numberDraft, setNumberDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
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
          processEnglishTranscript(transcript)
        }
      }
    }

    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis
      audioRef.current = new Audio()
      audioRef.current.onplay = () => setIsSpeaking(true)
      audioRef.current.onended = () => setIsSpeaking(false)
      audioRef.current.onerror = () => setIsSpeaking(false)
    }

    setTimeout(() => speak('welcome', "Welcome to MAMA-AI. I will guide you through the emergency assessment. Let's begin."), 1000)

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch {}
      }
      synthesisRef.current?.cancel()
      audioRef.current?.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // English: browser TTS (works fine, always has). Twi: a real pre-generated audio file — browsers
  // cannot synthesize Twi themselves. Falls back to a text banner if the file is missing/unplayable
  // rather than silently doing nothing.
  const speak = (id: string, enText: string) => {
    if (lang === 'tw' && audioRef.current) {
      audioRef.current.src = `/audio/tw/${id}.mp3`
      audioRef.current.play().catch(() => setIsSpeaking(false))
      return
    }
    if (!synthesisRef.current) return
    try {
      synthesisRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(enText)
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

  useEffect(() => {
    if (currentStep < QUESTIONS.length) {
      const q = QUESTIONS[currentStep]
      speak(q.id, q.en)
      setBpDraft({ systolic: '', diastolic: '' })
      setNumberDraft('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, lang])

  const toggleListening = () => {
    if (!isSpeechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }
    if (isListening) {
      try { recognitionRef.current?.stop() } catch {}
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

  const processEnglishTranscript = (text: string) => {
    setIsProcessing(true)
    const question = QUESTIONS[currentStep]
    if (!question) { setIsProcessing(false); return }

    const value = text.toLowerCase().trim()
    let parsed: any
    switch (question.control) {
      case 'choice':
        if (value.includes('very heavy') || value.includes('1000')) parsed = 1000
        else if (value.includes('heavy') || value.includes('600')) parsed = 600
        else if (value.includes('light')) parsed = 300
        else if (value.includes('none') || value.includes('no')) parsed = 0
        else parsed = parseInt(value) || 0
        break
      case 'severity':
        if (value.includes('severe')) parsed = 9
        else if (value.includes('moderate')) parsed = 6
        else if (value.includes('mild')) parsed = 3
        else parsed = 0
        break
      case 'yesno':
        parsed = value.includes('yes') || value.includes('yeah')
        break
      case 'bp': {
        const bpMatch = text.match(/(\d+)\s*\/\s*(\d+)/)
        const numbers = text.match(/\d+/g)
        if (bpMatch) parsed = { systolic: parseInt(bpMatch[1]), diastolic: parseInt(bpMatch[2]) }
        else if (numbers && numbers.length >= 2) parsed = { systolic: parseInt(numbers[0]), diastolic: parseInt(numbers[1]) }
        else parsed = { systolic: 120, diastolic: 80 }
        break
      }
      case 'number':
        parsed = parseInt(value) || 0
        break
    }
    recordAnswer(question, parsed)
    setIsProcessing(false)
  }

  const recordAnswer = (question: (typeof QUESTIONS)[number], value: any) => {
    setAssessmentData((prev: any) => ({ ...prev, [question.field]: value }))
    const nextStep = currentStep + 1
    if (nextStep < QUESTIONS.length) {
      setCurrentStep(nextStep)
    } else {
      setTimeout(() => {
        speak('complete', 'Assessment complete. Processing your results.')
        completeAssessment({ ...assessmentData, [question.field]: value })
      }, 300)
    }
  }

  const completeAssessment = async (data: any) => {
    const patientData = {
      patient_id: `P${Date.now().toString().slice(-4)}`,
      symptoms: {
        bleeding_volume: data.bleeding_volume || 0,
        headache_severity: data.headache_severity || 0,
        visual_changes: !!data.visual_changes,
        abdominal_pain_severity: data.abdominal_pain_severity || 0,
        foul_discharge: !!data.foul_discharge,
        fever: !!data.fever,
      },
      vitals: {
        systolic_bp: data.bp?.systolic || 120,
        diastolic_bp: data.bp?.diastolic || 80,
        temperature: 36.8,
      },
      obstetric_history: {
        gestation_weeks: 38,
        labour_hours: data.labour_hours || 0,
        previous_csection: !!data.previous_csection,
        multiple_pregnancy: false,
      },
    }

    onAssessmentComplete?.(patientData)

    // This used to stop at the callback above, which nothing ever actually provided (VoiceAssistant
    // is rendered with no onAssessmentComplete prop in page.tsx) — completing the flow submitted
    // nowhere. Submits for real now, with the same real/offline fallback as the manual assessment
    // form (see app/assessment/page.tsx).
    setSubmitting(true)
    try {
      const apiResult = await assessRisk(patientData)
      setResult(apiResult)
    } catch (error) {
      if (error instanceof ApiError) {
        setResult({ error: error.message })
      } else {
        setResult({ ...assessOffline(patientData), assessment_id: null, shap_summary: {}, referral_options: [] })
        await enqueue('assessment', patientData)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const getProgress = () => Math.round((currentStep / QUESTIONS.length) * 100)
  const question = QUESTIONS[currentStep]
  const done = currentStep >= QUESTIONS.length

  const renderTapControl = () => {
    if (!question) return null
    switch (question.control) {
      case 'choice':
        return (
          <div className="grid grid-cols-2 gap-2">
            {question.choices!.map((c) => (
              <button key={c.label} onClick={() => recordAnswer(question, c.value)} className="py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-medium text-sm">
                {c.label}
              </button>
            ))}
          </div>
        )
      case 'severity':
        return (
          <div className="grid grid-cols-2 gap-2">
            {SEVERITY_CHOICES.map((c) => (
              <button key={c.label} onClick={() => recordAnswer(question, c.value)} className="py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-medium text-sm">
                {c.label}
              </button>
            ))}
          </div>
        )
      case 'yesno':
        return (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => recordAnswer(question, true)} className="py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 font-medium">Yes</button>
            <button onClick={() => recordAnswer(question, false)} className="py-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 font-medium">No</button>
          </div>
        )
      case 'number':
        return (
          <div className="flex gap-2">
            <input
              type="number" inputMode="numeric" value={numberDraft} onChange={(e) => setNumberDraft(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" placeholder="Number of hours"
            />
            <button onClick={() => recordAnswer(question, parseInt(numberDraft) || 0)} className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium">Next</button>
          </div>
        )
      case 'bp':
        return (
          <div className="flex gap-2 items-center">
            <input
              type="number" inputMode="numeric" value={bpDraft.systolic} onChange={(e) => setBpDraft((p) => ({ ...p, systolic: e.target.value }))}
              className="w-20 border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none" placeholder="Top"
            />
            <span className="text-gray-400">/</span>
            <input
              type="number" inputMode="numeric" value={bpDraft.diastolic} onChange={(e) => setBpDraft((p) => ({ ...p, diastolic: e.target.value }))}
              className="w-20 border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none" placeholder="Bottom"
            />
            <button
              onClick={() => recordAnswer(question, { systolic: parseInt(bpDraft.systolic) || 120, diastolic: parseInt(bpDraft.diastolic) || 80 })}
              className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium"
            >Next</button>
          </div>
        )
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Voice Assistant</h3>
            <p className="text-xs text-gray-500">Hands-free emergency assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLang((l) => (l === 'en' ? 'tw' : 'en')); setCurrentStep(0); setAssessmentData({}) }}
            className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full font-medium text-gray-700"
            title="Switch language (restarts the assessment)"
          >
            <Languages className="w-3 h-3" /> {lang === 'en' ? 'English' : 'Twi'}
          </button>
          {isSpeaking && (
            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              <Volume2 className="w-3 h-3" /> Speaking
            </span>
          )}
        </div>
      </div>

      {lang === 'tw' && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 text-xs text-amber-800">
          Twi audio is machine-generated (not a human recording) — pronunciation may be imperfect.
          Answer each question by tapping a choice below; free speech input isn't available in Twi.
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Assessment Progress</span>
          <span>{getProgress()}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${getProgress()}%` }} />
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl p-4 mb-4 min-h-[80px]">
        {!done ? (
          <div>
            <p className="text-xs text-purple-600 font-medium mb-1">Question {currentStep + 1} of {QUESTIONS.length}</p>
            <p className="text-gray-800 font-medium mb-3">{question.en}</p>
            <button onClick={() => speak(question.id, question.en)} disabled={isSpeaking} className="text-xs text-purple-600 underline mb-3 disabled:opacity-50">
              🔊 Replay question
            </button>
            {lang === 'tw' ? (
              renderTapControl()
            ) : (
              transcript && <p className="text-sm text-gray-500 mt-2">You said: "{transcript}"</p>
            )}
          </div>
        ) : submitting ? (
          <div className="flex items-center gap-2 text-purple-700">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Assessing...</span>
          </div>
        ) : result?.error ? (
          <div className="text-red-700 text-sm">{result.error}</div>
        ) : result ? (
          <div className="space-y-3">
            {result.offline && (
              <div className="bg-amber-100 border-2 border-amber-400 p-3 rounded-xl text-amber-800 text-xs font-semibold">
                ⚠️ Offline estimate — not yet confirmed by the server. Queued to sync automatically once you're back online.
              </div>
            )}
            <RiskExplanation
              riskLevel={result.risk_level}
              confidenceScore={result.confidence_score}
              shapSummary={result.shap_summary || {}}
              explanation={result.explanation || 'No explanation available'}
              primaryCondition={result.primary_condition}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Assessment Complete!</span>
          </div>
        )}
      </div>

      {lang === 'en' && !done && (
        <div className="flex items-center gap-3">
          <button
            onClick={toggleListening}
            disabled={isProcessing || isSpeaking}
            className={`flex-1 py-3 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${
              isListening ? 'bg-red-600 hover:bg-red-700' : isProcessing || isSpeaking ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isListening ? (<><Mic className="w-5 h-5" /> Stop Listening</>) : isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>) : isSpeaking ? (<><Volume2 className="w-5 h-5" /> Speaking...</>) : (<><Mic className="w-5 h-5" /> Speak Now</>)}
          </button>
          {!isSpeechSupported && (
            <div className="flex items-center gap-1 text-xs text-amber-700"><AlertCircle className="w-4 h-4" /> Not supported in this browser</div>
          )}
        </div>
      )}
    </div>
  )
}
