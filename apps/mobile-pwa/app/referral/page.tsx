"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Building2 } from "lucide-react";

export default function ReferralPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: "P004",
    latitude: 7.3833,
    longitude: -1.3667,
    gestation_weeks: 39,
    risk_level: "CRITICAL",
    primary_condition: "PPH",
    needs_csection: true,
    needs_icu: false,
  });

  const handleReferral = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://mama-ai-api.onrender.com/api/v1/referrals/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      alert("Failed to get referral recommendations");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Find Facility</h1>
          </div>
          <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">📍 Live</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3">Referral Details</h3>
            <div className="space-y-3">
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
                <label className="text-xs text-gray-500 font-medium">Risk Level</label>
                <select
                  value={formData.risk_level}
                  onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                  className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Condition</label>
                <select
                  value={formData.primary_condition}
                  onChange={(e) => setFormData({ ...formData, primary_condition: e.target.value })}
                  className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="PPH">Postpartum Haemorrhage</option>
                  <option value="PRE_ECLAMPSIA">Pre-eclampsia</option>
                  <option value="OBSTRUCTED_LABOUR">Obstructed Labour</option>
                  <option value="SEPSIS">Sepsis</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.needs_csection}
                    onChange={(e) => setFormData({ ...formData, needs_csection: e.target.checked })}
                    className="rounded"
                  />
                  Needs C-Section
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.needs_icu}
                    onChange={(e) => setFormData({ ...formData, needs_icu: e.target.checked })}
                    className="rounded"
                  />
                  Needs ICU
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleReferral}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl"
            }`}
          >
            {loading ? "⏳ Finding..." : "🚑 Find Nearest Facility"}
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Recommended Facility
            </h3>

            {result ? (
              result.destination_facility ? (
                <div className="p-4 border-4 border-blue-500 rounded-xl">
                  <p className="font-bold text-blue-700 text-lg">{result.destination_facility.name}</p>
                  <p className="text-sm text-gray-600">{result.destination_facility.type}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <span>📍 {result.destination_facility.distance_km} km</span>
                    <span>⏱ {result.destination_facility.travel_minutes} min</span>
                  </div>
                  <p className="mt-2 text-sm">📞 {result.destination_facility.phone}</p>
                  {result.referral_note && (
                    <div className="mt-3">
                      <p className="font-semibold text-sm">📝 Referral Note:</p>
                      <pre className="text-xs bg-gray-50 p-3 rounded-lg mt-1 whitespace-pre-wrap">
                        {result.referral_note}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <p>No facility found</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Enter referral details</p>
                <p className="text-xs">to find nearest facility</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
