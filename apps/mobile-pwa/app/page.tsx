"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  AlertTriangle,
  Building2,
  Activity,
  Heart,
  Shield,
  MapPin,
  ChevronRight,
  Globe,
  CheckCircle,
  TrendingUp,
  Award,
  Users,
  Clock,
  Car,
  Phone,
  Sparkles,
  Calendar,
  Mic,
} from "lucide-react";
import EmergencyButton from "./components/EmergencyButton";
import ThreeDelaysDashboard from "./components/ThreeDelaysDashboard";
import EnhancedEconomics from "./components/EnhancedEconomics";
import WaitingHomeRecommendation from "./components/WaitingHomeRecommendation";
import FacilityMap from "./components/FacilityMap";
import MaternalTimeline from "./components/features/MaternalTimeline";
import CommunityHealthWorkerMode from "./components/features/CommunityHealthWorkerMode";
import VoiceAssistant from "./components/features/VoiceAssistant";
import LiveNationalDashboard from "./components/features/LiveNationalDashboard";
import OfflineSyncIndicator from "./components/OfflineSyncIndicator";

export default function HomePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState<"midwife" | "chw" | "dho">("midwife");

  useEffect(() => {
    setMounted(true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!mounted) return null;

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "delays", label: "🕒 Three Delays" },
    { id: "economics", label: "💰 Economics" },
    { id: "waiting", label: "🏠 Waiting Homes" },
    { id: "facilities", label: "🗺️ Facilities" },
    { id: "timeline", label: "📅 Timeline" },
    { id: "chw", label: "👩‍⚕️ CHW Mode" },
    { id: "voice", label: "🎤 Voice" },
    { id: "national", label: "📊 National" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Ghana Flag Bar */}
      <div className="h-1 bg-gradient-to-r from-[#CE1126] via-[#FCD116] to-[#006B3F]" />

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
                MAMA-AI
              </h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                Maternal Emergency Intelligence Platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OfflineSyncIndicator />
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
              🇬🇭 Ghana
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Tagline */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-teal-600 via-amber-500 to-red-600 bg-clip-text text-transparent">
              Saving Mothers Through Predictive Care
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            AI-powered maternal emergency intelligence for rural Ghana
          </p>
        </div>

        {/* Role Switcher */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setUserRole("midwife")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              userRole === "midwife"
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            👩‍⚕️ Midwife
          </button>
          <button
            onClick={() => setUserRole("chw")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              userRole === "chw"
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            👩‍🌾 CHW
          </button>
          <button
            onClick={() => setUserRole("dho")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              userRole === "dho"
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            📊 DHO
          </button>
        </div>

        {/* Emergency Button - Prominent */}
        <EmergencyButton />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Today's Assessments</p>
            <p className="text-2xl font-bold text-teal-600">47</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Critical Cases</p>
            <p className="text-2xl font-bold text-red-600">12</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Ambulances</p>
            <p className="text-2xl font-bold text-blue-600">8</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Facilities Online</p>
            <p className="text-2xl font-bold text-green-600">146</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/assessment">
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
              <AlertTriangle className="w-6 h-6 mb-1" />
              <p className="font-semibold text-sm">Emergency</p>
              <p className="text-xs opacity-80">AI-powered risk detection</p>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
              <Activity className="w-6 h-6 mb-1" />
              <p className="font-semibold text-sm">Dashboard</p>
              <p className="text-xs opacity-80">Health economics</p>
            </div>
          </Link>
          <Link href="/facilities">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
              <Building2 className="w-6 h-6 mb-1" />
              <p className="font-semibold text-sm">Facilities</p>
              <p className="text-xs opacity-80">Referral intelligence</p>
            </div>
          </Link>
          <Link href="/waiting-home">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
              <MapPin className="w-6 h-6 mb-1" />
              <p className="font-semibold text-sm">Waiting Homes</p>
              <p className="text-xs opacity-80">Safe birth centers</p>
            </div>
          </Link>
          <Link href="/assessment?emergency=true">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer animate-pulse">
              <AlertTriangle className="w-6 h-6 mb-1" />
              <p className="font-semibold text-sm">🚨 Emergency</p>
              <p className="text-xs opacity-80">One-tap assessment</p>
            </div>
          </Link>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-teal-600 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Platform Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700">What We Do</h4>
                  <ul className="mt-2 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">✅ AI-powered emergency risk detection</li>
                    <li className="flex items-center gap-2">✅ Explainable predictions with SHAP</li>
                    <li className="flex items-center gap-2">✅ Referral optimization with facility mapping</li>
                    <li className="flex items-center gap-2">✅ Health economics & cost savings</li>
                    <li className="flex items-center gap-2">✅ Safe birth center recommendations</li>
                    <li className="flex items-center gap-2">✅ Offline-first design for rural areas</li>
                    <li className="flex items-center gap-2">✅ Community health worker support</li>
                    <li className="flex items-center gap-2">✅ Voice-activated emergency assessment</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Evidence Base</h4>
                  <ul className="mt-2 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">📄 Peer-reviewed CS-TC Framework</li>
                    <li className="flex items-center gap-2">📊 Validated health economics model</li>
                    <li className="flex items-center gap-2">🔬 Explainable AI with clinical reasoning</li>
                    <li className="flex items-center gap-2">🏥 Ghana Health Service protocols</li>
                    <li className="flex items-center gap-2">🌍 WHO IMPAC guidelines aligned</li>
                    <li className="flex items-center gap-2">🎯 SDG 3, 5, 9, 10 contributions</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "delays" && <ThreeDelaysDashboard />}
          {activeTab === "economics" && <EnhancedEconomics />}
          {activeTab === "waiting" && <WaitingHomeRecommendation />}
          {activeTab === "facilities" && <FacilityMap />}
          {activeTab === "timeline" && <MaternalTimeline />}
          {activeTab === "chw" && <CommunityHealthWorkerMode />}
          {activeTab === "voice" && <VoiceAssistant />}
          {activeTab === "national" && <LiveNationalDashboard />}
        </div>

        {/* Research Validation Footer */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-800">Research-Backed Innovation</h3>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              CS-TC Framework (Peer-reviewed)
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              Health Economics Validation
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              Explainable AI (SHAP)
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              Offline-First Architecture
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              SDG-Aligned Impact
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">MAMA-AI v2.0</span>
              <span>•</span>
              <span>Ghana AI Innovation Challenge 2026</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                Saving Mothers
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-600" />
                Secure
              </span>
              <span>•</span>
              <span>Powered by CS-TC Framework</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4 text-blue-500" />
                Built for Ghana
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
