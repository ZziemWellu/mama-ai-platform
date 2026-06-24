import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-GH').format(num)
}

export function getRiskColor(level: string): string {
  switch (level?.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-600 text-white border-red-700'
    case 'HIGH': return 'bg-orange-500 text-white border-orange-600'
    case 'MODERATE': return 'bg-yellow-500 text-black border-yellow-600'
    case 'LOW': return 'bg-green-500 text-white border-green-600'
    default: return 'bg-gray-500 text-white border-gray-600'
  }
}

export function getRiskBadgeVariant(level: string): any {
  switch (level?.toUpperCase()) {
    case 'CRITICAL': return 'critical'
    case 'HIGH': return 'destructive'
    case 'MODERATE': return 'warning'
    case 'LOW': return 'success'
    default: return 'secondary'
  }
}
