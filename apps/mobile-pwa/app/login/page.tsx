"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Phone, Lock, AlertCircle } from "lucide-react";
import { login, ApiError } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(phoneNumber, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-lg mx-auto mb-3">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Sign in to MAMA-AI</h1>
          <p className="text-sm text-gray-500 mt-1">For registered midwives, CHWs and facility staff</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone number
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="024XXXXXXX"
              className="w-full border rounded-xl p-2.5 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl p-2.5 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 bg-teal-600 hover:bg-teal-700 hover:shadow-xl disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center text-sm text-gray-500">
            New here?{" "}
            <Link href="/register" className="text-teal-700 font-medium hover:underline">
              Register your account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
