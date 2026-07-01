"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Heart, AlertTriangle, Activity, MapPin, Clock, Shield } from "lucide-react";
import RiskExplanation from "../components/RiskExplanation";

// Inner component that uses useSearchParams
function AssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmergency = searchParams?.get('emergency') === 'true';
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: "P001",
    symptoms: {
      bleeding_volume: 600,
      headache_severity: 0,
      visual_changes: false,
      abdominal_pain_severity: 0,
      foul_discharge: false,
      fever: false,
    },
    vitals: {
      systolic_bp: 110,
      diastolic_bp: 70,
      temperature: 36.8,
    },
    obstetric_history: {
      gestation_weeks: 39,
      labour_hours: 0,
      previous_csection: false,
      multiple_pregnancy: false,
    },
  });

  useEffect(() => {
    if (isEmergency) {
      // Auto-fill emergency assessment
      setFormData({
        ...formData,
        symptoms: {
          ...formData.symptoms,
          bleeding_volume: 600,
        },
      });
      handleAssess();
    }
  }, [isEmergency]);

  const handleAssess = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("https://mama-ai-api.onrender.com/api/v1/assessments/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to connect to API" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${isEmergency ? 'text-red-600 animate-pulse' : 'text-red-600'}`} />
            <h1 className="text-xl font-bold text-gray-800">
              {isEmergency ? '🚨 Emergency Assessment' : 'Emergency Assessment'}
            </h1>
          </div>
          <span className="ml-auto text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">🚨 Live</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {isEmergency && (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 animate-pulse">
              <p className="text-red-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                EMERGENCY MODE — Rapid assessment initiated
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Patient ID</label>
                <input
                  type="text"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Gestation (weeks)</label>
                <input
                  type="number"
                  value={formData.obstetric_history.gestation_weeks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      obstetric_history: {
                        ...formData.obstetric_history,
                        gestation_weeks: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Symptoms
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Bleeding Volume</label>
                <select
                  value={formData.symptoms.bleeding_volume}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symptoms: {
                        ...formData.symptoms,
                        bleeding_volume: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="0">None</option>
                  <option value="300">300 mL</option>
                  <option value="500">500 mL</option>
                  <option value="600">600 mL</option>
                  <option value="1000">1000+ mL</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.symptoms.visual_changes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        symptoms: {
                          ...formData.symptoms,
                          visual_changes: e.target.checked,
                        },
                      })
                    }
                    className="rounded"
                  />
                  Visual Changes
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.symptoms.fever}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        symptoms: {
                          ...formData.symptoms,
                          fever: e.target.checked,
                        },
                      })
                    }
                    className="rounded"
                  />
                  Fever
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              Vital Signs
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Systolic BP</label>
                <input
                  type="number"
                  value={formData.vitals.systolic_bp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: {
                        ...formData.vitals,
                        systolic_bp: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Diastolic BP</label>
                <input
                  type="number"
                  value={formData.vitals.diastolic_bp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: {
                        ...formData.vitals,
                        diastolic_bp: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Temperature</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.vitals.temperature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: {
                        ...formData.vitals,
                        temperature: parseFloat(e.target.value) || 36.5,
                      },
                    })
                  }
                  className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleAssess}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              loading ? "bg-gray-400" : isEmergency ? "bg-red-600 hover:bg-red-700 hover:shadow-xl animate-pulse" : "bg-red-600 hover:bg-red-700 hover:shadow-xl"
            }`}
          >
            {loading ? "⏳ Assessing..." : isEmergency ? "🚨 CRITICAL ASSESSMENT" : "🚨 Assess Risk"}
          </button>
        </div>

        <div className="lg:col-span-1">
          {result ? (
            result.error ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-sm">
                {result.error}
              </div>
            ) : (
              <RiskExplanation
                riskLevel={result.risk_level}
                confidenceScore={result.confidence_score}
                shapSummary={result.shap_summary || {}}
                explanation={result.explanation || "No explanation available"}
                primaryCondition={result.primary_condition}
              />
            )
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
              <div className="text-center py-8 text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Complete the assessment</p>
                <p className="text-xs">to see explainable AI results</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Main export with Suspense boundary
export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading assessment...</p>
        </div>
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  );
}
