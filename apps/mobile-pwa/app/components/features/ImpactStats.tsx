"use client";

import { useEffect, useState } from "react";

// Reads only what the API actually computes. Anything it does not compute yet is shown as
// "not yet estimated", never as a number.
type Economics = { high_risk_cases: number; successful_referrals: number };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function ImpactStats() {
  const [data, setData] = useState<Economics | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/economics/dashboard`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  const count = (v?: number) => (data && typeof v === "number" ? v.toString() : "Not yet available");

  const cards = [
    { value: count(data?.high_risk_cases), label: "High-risk assessments", note: "Recorded in the app", color: "text-red-600" },
    { value: count(data?.successful_referrals), label: "Referrals initiated", note: "From assessments", color: "text-blue-600" },
    { value: "Not yet estimated", label: "Cost savings", note: "Needs outcome and costing data", color: "text-gray-500" },
    { value: "Not yet estimated", label: "DALYs averted", note: "Needs outcome data", color: "text-gray-500" },
  ];

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-xs text-gray-400">{c.note}</p>
          </div>
        ))}
      </section>
      {failed && <p className="text-xs text-gray-500 mt-2">Live figures are unavailable right now.</p>}
    </>
  );
}
