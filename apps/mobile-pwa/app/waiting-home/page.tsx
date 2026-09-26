"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Building2, Shield } from "lucide-react";
import { assessAccessRisk, ApiError } from "../lib/api";
import { useRequireAuth } from "../lib/useRequireAuth";

export default function WaitingHomePage() {
  const router = useRouter();
  const { ready } = useRequireAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: "P003",
    gestation_weeks: 38,
    distance_to_facility_km: 25,
    transport_available: false,
    previous_complications: false,
  });

  const handleAssess = async () => {
    setLoading(true);
    try {
      // This used to call a separate `mama-ai-access-risk.onrender.com` host that isn't part of this
      // deployment at all (dead link) — /access-risk/assess is the real, existing route, on the same
      // backend as everything else. Its response shape today is {risk_level, reason, recommendation,
      // distance_km, transport_available} — the richer {waiting_homes: [...], risk_score} shape this
      // page used to assume was never actually implemented server-side; surfacing real nearby waiting
      // homes (GET /waiting-centers/) is Phase B work, not a wiring fix.
      const data = await assessAccessRisk(formData);
      setResult(data);
    } catch (error) {
      alert(error instanceof ApiError ? error.message : "Failed to connect to access risk service. Please try again.");
    }
    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  const getRiskColor = (level?: string) => {
    if (level === "CRITICAL") return "bg-red-600 text-white";
    if (level === "HIGH") return "bg-orange-500 text-white";
    if (level === "MODERATE") return "bg-yellow-500 text-black";
    return "bg-green-500 text-white";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-800">Safe Birth Centers</h1>
          </div>
          <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">🏠 Live</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3">Patient Information</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Gestation (weeks)</label>
                  <input
                    type="number"
                    value={formData.gestation_weeks}
                    onChange={(e) => setFormData({ ...formData, gestation_weeks: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Distance (km)</label>
                  <input
                    type="number"
                    value={formData.distance_to_facility_km}
                    onChange={(e) => setFormData({ ...formData, distance_to_facility_km: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-xl p-2 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.transport_available}
                    onChange={(e) => setFormData({ ...formData, transport_available: e.target.checked })}
                    className="rounded"
                  />
                  Has Transport
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.previous_complications}
                    onChange={(e) => setFormData({ ...formData, previous_complications: e.target.checked })}
                    className="rounded"
                  />
                  Previous Complications
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleAssess}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              loading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700 hover:shadow-xl"
            }`}
          >
            {loading ? "⏳ Finding..." : "🏠 Find Safe Birth Center"}
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              Access Risk Assessment
            </h3>

            {result ? (
              <div className={`p-4 rounded-xl ${getRiskColor(result.risk_level)}`}>
                <p className="text-sm opacity-75">Access Risk</p>
                <p className="text-2xl font-bold">{result.risk_level}</p>

                {result.recommendation && (
                  <div className="mt-3">
                    <p className="font-semibold text-sm">Recommendation:</p>
                    <p className="text-sm">{result.recommendation}</p>
                  </div>
                )}

                {result.reason && (
                  <div className="mt-2 text-sm opacity-80">
                    <p className="font-semibold">Why:</p>
                    <p>{result.reason}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Enter patient details</p>
                <p className="text-xs">to find safe birth centers</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
