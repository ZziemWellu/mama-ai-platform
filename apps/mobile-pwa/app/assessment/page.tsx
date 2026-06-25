"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, AlertTriangle, Activity, MapPin, Clock, Shield } from "lucide-react";

export default function AssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: "P001",
    symptoms: { bleeding_volume: 600, headache_severity: 0, visual_changes: false, abdominal_pain_severity: 0, foul_discharge: false, fever: false },
    vitals: { systolic_bp: 110, diastolic_bp: 70, temperature: 36.8 },
    obstetric_history: { gestation_weeks: 39, labour_hours: 0, previous_csection: false, multiple_pregnancy: false },
  });

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

  const getRiskColor = (level?: string) => {
    if (level === "CRITICAL") return "bg-red-600 text-white border-red-700";
    if (level === "HIGH") return "bg-orange-500 text-white border-orange-600";
    if (level === "MODERATE") return "bg-yellow-500 text-black border-yellow-600";
    if (level === "LOW") return "bg-green-500 text-white border-green-600";
    return "bg-gray-500 text-white border-gray-600";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-600" /><h1 className="text-xl font-bold text-gray-800">Emergency Assessment</h1></div>
          <span className="ml-auto text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">🚨 Live</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" /> Patient</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500 font-medium">Patient ID</label><input type="text" value={formData.patient_id} onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })} className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Gestation</label><input type="number" value={formData.obstetric_history.gestation_weeks} onChange={(e) => setFormData({ ...formData, obstetric_history: { ...formData.obstetric_history, gestation_weeks: parseInt(e.target.value) || 0 } })} className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Symptoms</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500 font-medium">Bleeding</label><select value={formData.symptoms.bleeding_volume} onChange={(e) => setFormData({ ...formData, symptoms: { ...formData.symptoms, bleeding_volume: parseInt(e.target.value) || 0 } })} className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"><option value="0">None</option><option value="300">300 mL</option><option value="500">500 mL</option><option value="600">600 mL</option><option value="1000">1000+ mL</option></select></div>
              <div className="grid grid-cols-2 gap-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.symptoms.visual_changes} onChange={(e) => setFormData({ ...formData, symptoms: { ...formData.symptoms, visual_changes: e.target.checked } })} className="rounded" /> Visual Changes</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.symptoms.fever} onChange={(e) => setFormData({ ...formData, symptoms: { ...formData.symptoms, fever: e.target.checked } })} className="rounded" /> Fever</label></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500" /> Vitals</h3>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-gray-500 font-medium">Systolic</label><input type="number" value={formData.vitals.systolic_bp} onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, systolic_bp: parseInt(e.target.value) || 0 } })} className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Diastolic</label><input type="number" value={formData.vitals.diastolic_bp} onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, diastolic_bp: parseInt(e.target.value) || 0 } })} className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none" /></div>
              <div><label className="text-xs text-gray-500 font-medium">Temp °C</label><input type="number" step="0.1" value={formData.vitals.temperature} onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, temperature: parseFloat(e.target.value) || 36.5 } })} className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            </div>
          </div>

          <button onClick={handleAssess} disabled={loading} className={`w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700 hover:shadow-xl"}`}>{loading ? "⏳ Assessing..." : "🚨 Assess Risk"}</button>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-teal-600" /> Result</h3>
            {result ? result.error ? <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-sm">{result.error}</div> : (
              <div className={`p-4 rounded-xl ${getRiskColor(result.risk_level)}`}>
                <div className="flex justify-between"><div><p className="text-sm opacity-75">Risk</p><p className="text-2xl font-bold">{result.risk_level || "UNKNOWN"}</p></div><div className="text-right"><p className="text-sm opacity-75">Confidence</p><p className="text-xl font-bold">{Math.round((result.confidence_score || 0) * 100)}%</p></div></div>
                {result.primary_condition && result.primary_condition !== "NORMAL" && <div className="mt-3 p-3 bg-white/20 rounded-lg"><p className="font-semibold text-sm">{result.primary_condition}</p><p className="text-sm opacity-90">{result.explanation}</p></div>}
                {result.recommended_actions && <div className="mt-3"><p className="font-semibold text-sm">Actions:</p><ul className="list-disc list-inside text-sm space-y-1 mt-1">{result.recommended_actions.map((a: string, i: number) => <li key={i}>{a}</li>)}</ul></div>}
                {result.referral_options && result.referral_options.length > 0 && <div className="mt-3"><p className="font-semibold text-sm">Nearby:</p>{result.referral_options.map((f: any, i: number) => <div key={i} className="bg-white/20 p-3 rounded-lg mt-2 text-sm"><p className="font-medium">{f.facility_name}</p><div className="flex gap-3 mt-1 opacity-80"><span>📍 {f.distance_km} km</span><span>⏱ {f.estimated_travel_minutes} min</span></div><p className="mt-1">📞 {f.phone}</p></div>)}</div>}
              </div>
            ) : <div className="text-center py-8 text-gray-400"><Shield className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm">Complete assessment</p><p className="text-xs">to see results</p></div>}
          </div>
        </div>
      </main>
    </div>
  );
}
