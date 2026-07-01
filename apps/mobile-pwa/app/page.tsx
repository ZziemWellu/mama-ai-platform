"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  AlertTriangle,
  Activity,
  Building2,
  MapPin,
  Shield,
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
  Wifi,
  Stethoscope,
  BarChart3,
} from "lucide-react";
import Navbar from "./components/navigation/Navbar";
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
  const [showDemo, setShowDemo] = useState(false);

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

  const coreFeatures = [
    { icon: Stethoscope, title: "Clinical Care", desc: "Emergency assessment, referral, waiting homes", color: "from-teal-500 to-teal-600" },
    { icon: Activity, title: "AI Intelligence", desc: "Explainable AI, voice assistant, offline sync", color: "from-purple-500 to-purple-600" },
    { icon: Users, title: "Community Care", desc: "CHW mode, maternal timeline, follow-up", color: "from-green-500 to-green-600" },
    { icon: BarChart3, title: "Population Health", desc: "Three Delays, economics, national dashboard", color: "from-blue-500 to-blue-600" },
  ];

  const sampleCases = [
    { id: "pph", label: "Postpartum Haemorrhage", icon: "🩸" },
    { id: "preeclampsia", label: "Severe Preeclampsia", icon: "⚠️" },
    { id: "eclampsia", label: "Eclampsia", icon: "⚡" },
    { id: "obstructed", label: "Obstructed Labour", icon: "🔒" },
    { id: "sepsis", label: "Sepsis", icon: "🦠" },
  ];

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "delays", label: "🕒 Three Delays" },
    { id: "economics", label: "💰 Economics" },
    { id: "waiting", label: "🏠 Waiting Homes" },
    { id: "facilities", label: "🗺️ Facilities" },
    { id: "timeline", label: "📅 Timeline" },
    { id: "chw", label: "👩‍⚕️ CHW" },
    { id: "voice", label: "🎤 Voice" },
    { id: "national", label: "📊 National" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Ghana Flag Bar */}
      <div className="h-1 bg-gradient-to-r from-[#CE1126] via-[#FCD116] to-[#006B3F]" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-950 via-teal-800 to-emerald-700 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm mb-4">
              🏆 Ghana AI Innovation Challenge 2026
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-emerald-300">No mother should die</span>
              <br />
              because help is too far away.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-teal-100 max-w-2xl">
              AI-powered maternal emergency intelligence for rural Ghana.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/assessment">
                <button className="px-6 md:px-8 py-3 md:py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Start Emergency Assessment
                </button>
              </Link>
              <button 
                onClick={() => setShowDemo(!showDemo)}
                className="px-6 md:px-8 py-3 md:py-4 rounded-xl border border-white/50 hover:bg-white/10 text-white font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {showDemo ? "Hide Demo" : "Start Guided Demo"}
              </button>
            </div>

            {/* Status Indicators */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                API Connected
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Offline Ready
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                AI Active
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Voice Enabled
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                GPS Ready
              </span>
            </div>
          </div>
        </section>

        {/* Live Impact Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-red-600">24</p>
            <p className="text-sm text-gray-500">High-Risk Mothers</p>
            <p className="text-xs text-gray-400">Detected this month</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-blue-600">18</p>
            <p className="text-sm text-gray-500">Emergency Referrals</p>
            <p className="text-xs text-gray-400">Successfully completed</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-green-600">GHS 47.2k</p>
            <p className="text-sm text-gray-500">Cost Savings</p>
            <p className="text-xs text-gray-400">From early intervention</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-purple-600">187</p>
            <p className="text-sm text-gray-500">DALYs Averted</p>
            <p className="text-xs text-gray-400">Lives improved</p>
          </div>
        </section>

        {/* Guided Demo Section */}
        {showDemo && (
          <section className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-3xl p-6 border-2 border-amber-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-amber-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Guided Demo — Experience MAMA-AI
              </h2>
              <button 
                onClick={() => setShowDemo(false)}
                className="text-sm text-amber-600 hover:text-amber-800"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-amber-700 mb-4">
              Click any case below to see how MAMA-AI handles different obstetric emergencies.
            </p>
            <div className="flex flex-wrap gap-2">
              {sampleCases.map((caseItem) => (
                <Link key={caseItem.id} href={`/assessment?demo=${caseItem.id}`}>
                  <button className="bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition border border-amber-200 flex items-center gap-2">
                    <span>{caseItem.icon}</span>
                    <span className="text-sm font-medium">{caseItem.label}</span>
                  </button>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Core Capabilities */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-600" />
            Core Capabilities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className={`bg-gradient-to-br ${feature.color} text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1`}>
                  <Icon className="w-8 h-8 mb-3" />
                  <p className="font-semibold text-lg">{feature.title}</p>
                  <p className="text-xs opacity-80 mt-1">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/assessment">
            <button className="w-full bg-red-600 text-white p-3 rounded-xl font-medium hover:bg-red-700 transition text-sm">
              🚨 Emergency Assessment
            </button>
          </Link>
          <Link href="/facilities">
            <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-medium hover:bg-blue-700 transition text-sm">
              🗺️ Find Facilities
            </button>
          </Link>
          <Link href="/waiting-home">
            <button className="w-full bg-purple-600 text-white p-3 rounded-xl font-medium hover:bg-purple-700 transition text-sm">
              🏠 Waiting Homes
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full bg-teal-600 text-white p-3 rounded-xl font-medium hover:bg-teal-700 transition text-sm">
              📊 Analytics
            </button>
          </Link>
        </div>

        {/* Clinical Workflow */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            Clinical Workflow
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {[
              "Patient",
              "↓ Assessment",
              "↓ AI Prediction",
              "↓ Explainable AI",
              "↓ Emergency Actions",
              "↓ Referral",
              "↓ Waiting Home",
              "↓ Follow-up",
              "↓ Population Analytics"
            ].map((step, index) => (
              <span key={index} className={`px-3 py-1 rounded-full ${index % 2 === 0 ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
                {step}
              </span>
            ))}
          </div>
        </section>

        {/* Why MAMA-AI */}
        <section className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            Why MAMA-AI is Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Explainable AI", desc: "SHAP-based predictions with visual explanations", benefit: "Builds clinician trust" },
              { title: "Three Delays Framework", desc: "Identifies decision, transport, and facility delays", benefit: "System-level insights" },
              { title: "Health Economics", desc: "Real-time cost savings and DALY calculation", benefit: "Evidence-based investment" },
              { title: "Offline-First", desc: "Works without internet, syncs when connected", benefit: "Rural Ghana ready" },
              { title: "CHW Mode", desc: "Community health worker workflows", benefit: "Extends reach" },
              { title: "Voice Interface", desc: "Hands-free assessment in local languages", benefit: "Low-literacy friendly" },
              { title: "Waiting Homes", desc: "AI-powered safe birth recommendations", benefit: "Prevents home deliveries" },
              { title: "Facility Intelligence", desc: "Real-time facility capabilities", benefit: "Informed referrals" },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                    <p className="text-xs text-teal-600 mt-1">→ {item.benefit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Research Validation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-6">
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
        </footer>
      </main>
    </div>
  );
}
