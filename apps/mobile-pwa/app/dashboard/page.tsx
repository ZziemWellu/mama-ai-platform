"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp } from "lucide-react";
import EnhancedEconomics from "../components/EnhancedEconomics";
import { useRequireAuth } from "../lib/useRequireAuth";

// Same component as the home screen's Economics tab, so the two can never disagree about the same data.
export default function DashboardPage() {
  const router = useRouter();
  const { ready } = useRequireAuth();

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <EnhancedEconomics />
      </main>
    </div>
  );
}
