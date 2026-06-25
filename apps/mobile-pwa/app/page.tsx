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
  Clock,
  Wallet,
  TrendingUp,
  Award,
  Globe,
  CheckCircle,
  Phone,
} from "lucide-react";

export default function HomePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

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

  const navItems = [
    { icon: Home, label: "Home", href: "/", active: true },
    { icon: AlertTriangle, label: "Emergency Assessment", href: "/assessment" },
    { icon: Activity, label: "Dashboard", href: "/dashboard" },
    { icon: Building2, label: "Find Facility", href: "/referral" },
    { icon: Building2, label: "Safe Birth Centers", href: "/waiting-home" },
  ];

  const features = [
    { title: "Emergency Assessment", color: "red", desc: "AI-powered danger sign detection", icon: AlertTriangle, href: "/assessment" },
    { title: "Dashboard", color: "blue", desc: "Real-time health economics", icon: Activity, href: "/dashboard" },
    { title: "Find Facility", color: "green", desc: "Referral intelligence", icon: Building2, href: "/referral" },
    { title: "Safe Birth Centers", color: "purple", desc: "Waiting home recommendations", icon: Building2, href: "/waiting-home" },
  ];

  const stats = [
    { number: "47", title: "High Risk Cases", desc: "Identified and supported" },
    { number: "GHS 47k", title: "Cost Savings", desc: "Through early intervention" },
    { number: "187", title: "DALYs Averted", desc: "Lives improved" },
  ];

  const waitingHomes = [
    { name: "Kintampo Waiting Center", distance: "9 km", capacity: "24 mothers", available: 18, phone: "+233 24 123 4567" },
    { name: "Ejura Maternal Home", distance: "15 km", capacity: "32 mothers", available: 24, phone: "+233 24 765 4321" },
  ];

  const facilities = [
    { name: "District Hospital", distance: "6 km", type: "Referral Facility", phone: "+233 24 111 2222" },
    { name: "Teaching Hospital", distance: "18 km", type: "Specialist Care", phone: "+233 24 333 4444" },
    { name: "Community Clinic", distance: "4 km", type: "Primary Care", phone: "+233 24 555 6666" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r shadow-lg p-6 hidden lg:flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-teal-700">MAMA-AI</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">Maternal Emergency Intelligence</p>
          </div>
        </div>
        <div className="mt-2 text-sm text-green-600 font-medium">🇬🇭 Ghana</div>

        <nav className="mt-8 space-y-1 flex-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 0;
            return (
              <Link key={index} href={item.href}>
                <div className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${isActive ? "bg-teal-50 text-teal-700 shadow-sm" : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-teal-600" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-teal-400" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 rounded-2xl bg-green-50 border border-green-100">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
            <div className="font-semibold text-sm text-green-700">{isOnline ? "Connected to API" : "Offline Mode"}</div>
          </div>
          <p className="text-xs text-gray-600 mt-1">{isOnline ? "All systems operational" : "Working offline — data will sync"}</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-teal-700">MAMA-AI</h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Maternal Emergency Intelligence</p>
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${isOnline ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {isOnline ? "🟢 Online" : "⚪ Offline"}
          </span>
        </div>

        {/* Hero */}
        <section className="rounded-3xl overflow-hidden bg-gradient-to-r from-teal-950 via-teal-800 to-emerald-700 text-white p-8 md:p-12 lg:p-16 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="max-w-3xl relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm mb-4">🏆 Ghana AI Innovation Challenge 2026</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">No mother should die because help is too far away.</h1>
            <p className="mt-4 text-lg md:text-xl text-teal-100 max-w-2xl">AI-powered maternal emergency support for rural Ghana.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/assessment"><button className="px-6 md:px-8 py-3 md:py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Emergency Assessment</button></Link>
              <Link href="/dashboard"><button className="px-6 md:px-8 py-3 md:py-4 rounded-xl border border-white/50 hover:bg-white/10 text-white font-semibold transition-all duration-200">View Dashboard</button></Link>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {features.map((f, i) => {
            const colors = { red: "from-red-500 to-red-600", blue: "from-blue-500 to-blue-600", green: "from-green-500 to-green-600", purple: "from-purple-500 to-purple-600" };
            const Icon = f.icon;
            return (
              <Link key={i} href={f.href}>
                <div className={`bg-gradient-to-br ${colors[f.color as keyof typeof colors]} text-white p-4 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}>
                  <Icon className="w-6 h-6 mb-2" />
                  <h3 className="font-semibold text-sm md:text-base">{f.title}</h3>
                  <p className="text-xs text-white/70 mt-1">{f.desc}</p>
                </div>
              </Link>
            );
          })}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
              <h2 className="text-4xl md:text-5xl font-bold text-teal-700">{s.number}</h2>
              <p className="mt-2 text-lg font-semibold text-gray-800">{s.title}</p>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </section>

        {/* Impact */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📍 Impact So Far</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "24 high-risk cases detected this month",
              "18 successful emergency referrals",
              "GHS 47,200 in estimated cost savings",
              "187 DALYs averted through early intervention"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Waiting Homes */}
        <section className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mt-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Maternal Waiting Homes</h2>
          </div>
          <p className="text-gray-600">Women close to labour and far from hospitals can stay safely until delivery.</p>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-4">
            {waitingHomes.map((home, i) => (
              <div key={i} className="border rounded-2xl p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><MapPin className="w-5 h-5 text-teal-600" /></div>
                  <div><h3 className="text-lg font-semibold text-gray-800">{home.name}</h3><p className="text-sm text-gray-500">📍 {home.distance} · 🛏 {home.available}/{home.capacity}</p></div>
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">{home.available} beds available</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">📞 {home.phone}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
              <div><p className="font-semibold text-amber-800">AI Recommendation</p><p className="text-sm text-amber-700">Immediate transfer advised for women with access risk score above 70 percent</p></div>
            </div>
          </div>
        </section>

        {/* Facilities */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm mt-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Nearby Facilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {facilities.map((f, i) => (
              <div key={i} className="border rounded-2xl p-5 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-semibold text-gray-800">{f.name}</h3><p className="text-sm text-gray-500">{f.type}</p></div>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{f.distance}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">📞 {f.phone}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-4"><span className="font-medium text-gray-700">MAMA-AI v1.0</span><span>•</span><span>Ghana AI Innovation Challenge 2026</span></div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-green-600" /> Secure</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-red-500" /> Built for Ghana</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4 text-blue-500" /> Powered by AI</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
