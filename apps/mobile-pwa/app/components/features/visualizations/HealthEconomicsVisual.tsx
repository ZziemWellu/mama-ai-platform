"use client";

import { Wallet, Heart, TrendingUp, BarChart3 } from "lucide-react";

// Every value is optional. A missing value shows "Not yet estimated"; no figure is invented.
interface HealthEconomicsVisualProps {
  costSaved?: number;
  dalys?: number;
  icer?: number;
  roi?: number;
}

const NOT_YET = "Not yet estimated";

export default function HealthEconomicsVisual({ costSaved, dalys, icer, roi }: HealthEconomicsVisualProps) {
  const metrics = [
    { label: "Cost saved", value: costSaved != null ? `GHS ${costSaved.toLocaleString()}` : NOT_YET, icon: Wallet, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "DALYs averted", value: dalys != null ? dalys.toFixed(1) : NOT_YET, icon: Heart, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "ICER", value: icer != null ? `USD ${icer}` : NOT_YET, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" />
          Health economics
        </h3>
        <p className="text-sm text-gray-500">Shown only once outcome and costing data exist.</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className={`${m.bg} rounded-xl p-4 text-center`}>
                <Icon className={`w-5 h-5 mx-auto ${m.color} mb-1`} />
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-gray-500">{m.label}</p>
              </div>
            );
          })}
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Return on investment</span>
            <span className="font-semibold text-gray-800">{roi != null ? `${roi}x` : NOT_YET}</span>
          </div>
          {roi != null && (
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: `${Math.min(roi * 25, 100)}%` }} />
            </div>
          )}
        </div>

        {icer != null && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-xs text-indigo-700">
              <span className="font-semibold">ICER: USD {icer} per DALY</span>. Compare with Ghana's GDP per capita threshold (USD 2,200) before calling this cost-effective.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
