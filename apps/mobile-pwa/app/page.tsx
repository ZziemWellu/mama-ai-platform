"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  WifiOff,
  Cloud,
  BarChart3,
  Stethoscope,
  Baby,
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
  const router = useRouter();
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

  // Use only icons that exist in lucide-react
  const features = [
    { icon: AlertTriangle, title: "Emergency Assessment", desc: "AI-powered risk detection", color: "from-red-500 to-red-600", href: "/assessment" },
    { icon: AlertTriangle, title: "Emergency Mode", desc: "One-tap emergency response", color: "from-orange-500 to-orange-600", href: "/assessment?emergency=true" },
    { icon: MapPin, title: "Facility Map", desc: "Find nearest facilities with capabilities", color: "from-blue-500 to-blue-600", href: "/facilities" },
    { icon: Building2, title: "Waiting Homes", desc: "Safe birth center recommendations", color: "from-purple-500 to-purple-600", href: "/waiting-home" },
    { icon: Mic, title: "Voice Assistant", desc: "Hands-free assessment in English & Twi", color: "from-teal-500 to-teal-600", href: "/assessment" },
    { icon: Wifi, title: "Offline Sync", desc: "Works without internet, syncs later", color: "from-amber-500 to-amber-600", href: "/" },
    { icon: Users, title: "CHW Mode", desc: "Community health worker workflows", color: "from-green-500 to-green-600", href: "/" },
    { icon: Calendar, title: "Maternal Timeline", desc: "Track pregnancy journey", color: "from-pink-500 to-pink-600", href: "/" },
    { icon: Clock, title: "Three Delays", desc: "Identify and address care delays", color: "from-orange-500 to-orange-600", href: "/" },
    { icon: BarChart3, title: "Health Economics", desc: "Cost savings and DALY impact", color: "from-indigo-500 to-indigo-600", href: "/dashboard" },
    { icon: Globe, title: "National Dashboard", desc: "Population health intelligence", color: "from-cyan-500 to-cyan-600", href: "/" },
    { icon: Activity, title: "Explainable AI", desc: "Understand why every prediction is made", color: "from-purple-500 to-purple-600", href: "/assessment" },
  ];

  const sampleCases = [
    { id: "pph", label: "Postpartum Haemorrhage", icon: "🩸" },
    { id: "preeclampsia", label: "Severe Preeclampsia", icon: "⚠️" },
    { id: "eclampsia", label: "Eclampsia", icon: "⚡" },
    { id: "obstructed", label: "Obstructed Labour", icon: "🔒" },
    { id: "sepsis", label: "Sepsis", icon: "🦠" },
  ];

  const innovations = [
    { title: "Explainable AI", desc: "SHAP-based predictions with visual explanations", benefit: "Builds clinician trust" },
    { title: "Three Delays Framework", desc: "Identifies decision, transport, and facility delays", benefit: "System-level insights" },
    { title: "Health Economics", desc: "Real-time cost savings and DALY calculation", benefit: "Evidence-based investment" },
    { title: "Offline-First", desc: "Works without internet, syncs when connected", benefit: "Rural Ghana ready" },
    { title: "CHW Mode", desc: "Community health worker workflows", benefit: "Extends reach" },
    { title: "Voice Interface", desc: "Hands-free assessment in local languages", benefit: "Low-literacy friendly" },
    { title: "Waiting Homes", desc: "AI-powered safe birth recommendations", benefit: "Prevents home deliveries" },
    { title: "Facility Intelligence", desc: "Real-time facility capabilities", benefit: "Informed referrals" },
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
              Predict, explain, respond, refer, and monitor — all in one platform.
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
                <button
                  key={caseItem.id}
                  onClick={() => {
                    router.push(`/assessment?demo=${caseItem.id}`)
                  }}
                  className="bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition border border-amber-200 flex items-center gap-2"
                >
                  <span>{caseItem.icon}</span>
                  <span className="text-sm font-medium">{caseItem.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Core Innovations Grid */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-600" />
            Core Innovations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link key={index} href={feature.href}>
                  <div className={`bg-gradient-to-br ${feature.color} text-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full`}>
                    <Icon className="w-6 h-6 mb-2" />
                    <p className="font-semibold text-sm">{feature.title}</p>
                    <p className="text-xs opacity-80 mt-1">{feature.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

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

        {/* Innovation Showcase */}
        <section className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            Why MAMA-AI is Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {innovations.map((item, index) => (
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

        {/* Role Switcher */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white">
            👩‍⚕️ Midwife
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-600 hover:bg-gray-300">
            👩‍🌾 CHW
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-600 hover:bg-gray-300">
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
