'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Heart,
  Home,
  AlertTriangle,
  Activity,
  Building2,
  MapPin,
  Users,
  Calendar,
  Clock,
  BarChart3,
  Globe,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Award,
  BookOpen,
  Settings,
  Mic,
  Wifi,
  Stethoscope,
} from 'lucide-react'

interface NavItem {
  label: string
  href?: string
  icon?: any
  children?: NavItem[]
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  {
    label: 'Assessment',
    icon: AlertTriangle,
    children: [
      { label: 'Emergency Assessment', href: '/assessment', icon: AlertTriangle },
      { label: 'Explainable AI', href: '/assessment', icon: Activity },
      { label: 'Emergency Mode', href: '/assessment?emergency=true', icon: AlertTriangle },
      { label: 'Voice Assistant', href: '/assessment', icon: Mic },
    ]
  },
  {
    label: 'Care',
    icon: Stethoscope,
    children: [
      { label: 'Referral Intelligence', href: '/referral', icon: MapPin },
      { label: 'Facility Map', href: '/facilities', icon: Building2 },
      { label: 'Waiting Homes', href: '/waiting-home', icon: Building2 },
      { label: 'Maternal Timeline', href: '/', icon: Calendar },
      { label: 'CHW Mode', href: '/', icon: Users },
    ]
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { label: 'Overview Dashboard', href: '/dashboard', icon: BarChart3 },
      { label: 'Three Delays', href: '/', icon: Clock },
      { label: 'Health Economics', href: '/dashboard', icon: Activity },
      { label: 'National Dashboard', href: '/', icon: Globe },
    ]
  },
  {
    label: 'Research',
    icon: BookOpen,
    children: [
      { label: 'CS-TC Framework', href: '/', icon: Award },
      { label: 'Evidence Base', href: '/', icon: BookOpen },
      { label: 'WHO Alignment', href: '/', icon: Globe },
      { label: 'Publications', href: '/', icon: BookOpen },
    ]
  },
  { label: 'Guided Demo', href: '/', icon: Sparkles },
]

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label)
  }

  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href || pathname?.startsWith(href + '?')
  }

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
                MAMA-AI
              </span>
              <span className="text-[10px] text-gray-400 block -mt-0.5 font-medium tracking-wider uppercase">
                Maternal Emergency Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        openDropdown === item.label
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.label}
                      <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Mega Menu Dropdown */}
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href || '#'}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                              isActive(child.href)
                                ? 'bg-teal-50 text-teal-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => setOpenDropdown(null)}
                          >
                            {child.icon && <child.icon className="w-4 h-4" />}
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive(item.href)
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* Emergency Action Button */}
            <Link href="/assessment?emergency=true">
              <button className="ml-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                🚨 Emergency
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className="flex items-center justify-between w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition"
                    >
                      <span className="flex items-center gap-2">
                        {item.icon && <item.icon className="w-4 h-4" />}
                        {item.label}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === item.label && (
                      <div className="pl-8 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href || '#'}
                            className={`flex items-center gap-3 px-4 py-2 text-sm transition ${
                              isActive(child.href)
                                ? 'text-teal-700 bg-teal-50 rounded-lg'
                                : 'text-gray-600 hover:bg-gray-50 rounded-lg'
                            }`}
                            onClick={() => {
                              setIsMobileMenuOpen(false)
                              setOpenDropdown(null)
                            }}
                          >
                            {child.icon && <child.icon className="w-4 h-4" />}
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className={`flex items-center gap-3 px-4 py-2 text-sm transition ${
                      isActive(item.href)
                        ? 'text-teal-700 bg-teal-50 rounded-lg'
                        : 'text-gray-700 hover:bg-gray-50 rounded-lg'
                    }`}
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setOpenDropdown(null)
                    }}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
