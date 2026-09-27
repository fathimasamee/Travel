"use client";

import React, { useState } from "react";
import { Mail, CheckCircle, Sparkles } from "lucide-react";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="py-20 bg-gradient-to-tr from-slate-900 via-primary/90 to-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
          <Sparkles className="w-3.5 h-3.5" /> Private Travel Circle
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Unlock Secret Escapes & Member Privileges
        </h2>
        <p className="text-slate-200 text-sm sm:text-base max-w-xl mx-auto mb-8 font-light">
          Subscribe to our bespoke journal to receive exclusive seasonal package releases, private villa invitations, and $150 credit towards your next journey.
        </p>

        {subscribed ? (
          <div className="max-w-md mx-auto p-4 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">Welcome to the Circle! Check your inbox for your $150 voucher code.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Enter your personal email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-md"
              />
            </div>
            <button
              type="submit"
              className="py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 shrink-0"
            >
              Claim Invitation
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
