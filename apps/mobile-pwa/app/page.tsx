'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Activity,
  Ambulance,
  BarChart3,
  Home,
  Heart,
  MapPin,
  Shield,
  Sparkles,
  Users,
  Wallet,
  Zap,
  TrendingUp,
  Award,
  Leaf,
  Globe,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { cn, formatCurrency, formatNumber } from '@/app/lib/utils'

export default function HomePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!mounted) return null

  const stats = [
    { label: 'High Risk Cases', value: 47, icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Cost Savings', value: 'GHS 47.2K', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'DALYs Averted', value: 187, icon: Heart, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Referrals', value: 38, icon: Ambulance, color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  const features = [
    { title: 'Emergency Assessment', icon: Zap, href: '/assessment', color: 'bg-red-600', description: 'AI-powered danger sign detection' },
    { title: 'Dashboard', icon: BarChart3, href: '/dashboard', color: 'bg-green-600', description: 'Real-time health economics' },
    { title: 'Find Facility', icon: MapPin, href: '/referral', color: 'bg-blue-600', description: 'Referral intelligence' },
    { title: 'Safe Birth Centers', icon: Home, href: '/waiting-home', color: 'bg-purple-600', description: 'Waiting home recommendations' },
  ]

  const impactPoints = [
    { icon: CheckCircle, text: '24 high-risk cases detected this month' },
    { icon: CheckCircle, text: '18 successful emergency referrals' },
    { icon: CheckCircle, text: 'GHS 47,200 in estimated cost savings' },
    { icon: CheckCircle, text: '187 DALYs averted through early intervention' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Ghana Flag Bar */}
      <div className="ghana-flag" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ghana-green to-ghana-red flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-ghana-green via-ghana-yellow to-ghana-red bg-clip-text text-transparent">
                MAMA-AI
              </h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                Maternal Emergency Intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isOnline ? 'success' : 'secondary'} className="gap-1">
              <span className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-green-500" : "bg-gray-400")} />
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Globe className="w-3 h-3" />
              🇬🇭 Ghana
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ghana-green/5 via-transparent to-ghana-red/5" />
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge variant="success" className="mb-4 text-sm py-1.5 px-4">
              🏆 Ghana AI Innovation Challenge 2026
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              <span className="gradient-text">No mother should die</span>
              <br />
              <span className="text-gray-700">because help is too far away</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              AI-powered maternal emergency support, referral intelligence, and safe birth coordination for rural Ghana.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/assessment">
                <Button variant="ghana" size="lg" className="gap-2 shadow-xl hover:shadow-2xl">
                  <Zap className="w-5 h-5" />
                  Start Emergency Assessment
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="gap-2">
                  <BarChart3 className="w-5 h-5" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className={cn("w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center", stat.bg)}>
                    <Icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-ghana-green" />
          <h2 className="text-xl font-semibold text-gray-800">Platform Features</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <Link href={feature.href}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group card-hover">
                    <CardContent className="p-4 text-center">
                      <div className={cn("w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300", feature.color)}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">{feature.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Impact Section */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-ghana-green/5 via-white to-ghana-red/5">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-ghana-green" />
              <h2 className="text-xl font-semibold text-gray-800">Impact So Far</h2>
              <Badge variant="success" className="ml-auto">Live</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {impactPoints.map((point, index) => {
                const Icon = point.icon
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <Icon className="w-5 h-5 text-ghana-green flex-shrink-0" />
                    <p className="text-sm text-gray-700">{point.text}</p>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200/60 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Updated in real-time from pilot facilities</span>
              </div>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Phase 1: 10 facilities</span>
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-ghana-red" />
              <span className="text-sm text-gray-600">MAMA-AI v1.0</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-sm text-gray-600">Ghana AI Innovation Challenge 2026</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Built with ❤️ for Ghana</span>
              <span>•</span>
              <span>Powered by CS-TC Framework</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
