"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { Compass, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirect);
    } else {
      setError(res.message || "Invalid credentials.");
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword("Travel@123456");
    setLoading(true);
    setError("");
    const res = await login(demoEmail, "Travel@123456");
    setLoading(false);
    if (res.success) {
      if (demoEmail === "admin@travelsphere.com") {
        router.push("/admin");
      } else if (demoEmail === "staff@travelsphere.com") {
        router.push("/staff");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError(res.message || "Demo login failed.");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-slate-50/70 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center shadow-md">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Travel<span className="text-emerald-500">Sphere</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your curated itineraries, invoices, and concierge team.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        {/* 1-Click Demo Buttons for Fast Evaluation */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-500 block flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" /> One-Click Demo Role Accounts:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("admin@travelsphere.com", "Admin")}
              className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold border border-purple-200 transition-colors"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("staff@travelsphere.com", "Staff")}
              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 transition-colors"
            >
              👔 Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("customer@travelsphere.com", "Customer")}
              className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-primary rounded-lg text-xs font-bold border border-blue-200 transition-colors"
            >
              🌴 Customer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-600">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/95 hover:to-emerald-600 text-white font-bold text-xs shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to TravelSphere"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          New to TravelSphere?{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">Loading sign-in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
