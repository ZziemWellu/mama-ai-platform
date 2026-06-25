"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, Heart, Activity, TrendingUp, Award, Building2, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://mama-ai-api.onrender.com/api/v1/economics/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const cards = [
    { icon: Wallet, label: "Cost Savings", value: `GHS ${stats?.total_cost_savings_ghs?.toLocaleString() || 0}`, color: "bg-green-50 text-green-700 border-green-200" },
    { icon: Heart, label: "DALYs Averted", value: stats?.total_dalys_averted?.toFixed(1) || 0, color: "bg-purple-50 text-purple-700 border-purple-200" },
    { icon: Activity, label: "High Risk Cases", value: stats?.high_risk_cases || 0, color: "bg-red-50 text-red-700 border-red-200" },
    { icon: TrendingUp, label: "Referrals", value: stats?.successful_referrals || 0, color: "bg-blue-50 text-blue-700 border-blue-200" },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          </div>
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">🟢 Live</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className={`p-6 rounded-2xl border ${card.color} shadow-sm`}>
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <p className="text-sm font-medium">{card.label}</p>
                </div>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
            );
          })}
        </div>

        {stats?.average_icer_usd_per_daly !== undefined && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-700">Cost-Effectiveness (ICER)</h3>
            </div>
            <p className="text-3xl font-bold text-indigo-700 mt-2">
              USD {stats.average_icer_usd_per_daly.toFixed(2)} / DALY
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.average_icer_usd_per_daly < 2200
                ? "✅ Cost-effective (below GDP per capita threshold)"
                : "⚠️ Above GDP per capita threshold"}
            </p>
          </div>
        )}

        {stats?.facility_breakdown && stats.facility_breakdown.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-700">Facility Breakdown</h3>
            </div>
            <div className="space-y-2">
              {stats.facility_breakdown.map((facility: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b py-3">
                  <div>
                    <p className="font-medium text-gray-800">{facility.facility_name}</p>
                    <p className="text-xs text-gray-500">{facility.cases} cases</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">GHS {facility.cost_savings.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{facility.dalys_averted.toFixed(1)} DALYs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats?.conditions_breakdown && stats.conditions_breakdown.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-700">Conditions Breakdown</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.conditions_breakdown.map((cond: any, i: number) => (
                <div key={i} className="bg-gray-50 px-4 py-2 rounded-xl border">
                  <span className="font-medium text-gray-700">{cond.condition}</span>
                  <span className="ml-2 text-sm text-gray-500">{cond.count} cases</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
