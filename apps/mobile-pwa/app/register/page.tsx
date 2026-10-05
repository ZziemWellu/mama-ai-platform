"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Phone, Lock, User, Briefcase, AlertCircle } from "lucide-react";
import { register, login, ApiError, ROLES } from "../lib/api";

const ROLE_LABELS: Record<string, string> = {
  MIDWIFE: "Midwife",
  COMMUNITY_HEALTH_WORKER: "Community Health Worker",
  DISTRICT_HEALTH_OFFICER: "District Health Officer",
  ADMIN: "Administrator",
};

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>(ROLES[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register({ phone_number: phoneNumber, full_name: fullName, password, role });
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
          <h1 className="text-xl font-bold text-gray-800">Register for MAMA-AI</h1>
          <p className="text-sm text-gray-500 mt-1">For midwives, CHWs and facility staff</p>
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
              <User className="w-3.5 h-3.5" /> Full name
            </label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-xl p-2.5 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

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
              <Briefcase className="w-3.5 h-3.5" /> Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-xl p-2.5 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl p-2.5 text-sm mt-1 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">At least 8 characters.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 bg-teal-600 hover:bg-teal-700 hover:shadow-xl disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already registered?{" "}
            <Link href="/login" className="text-teal-700 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
