"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Users, DollarSign, MapPin, Sparkles } from "lucide-react";

export const HeroSection = () => {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travellers, setTravellers] = useState("2");
  const [budget, setBudget] = useState("any");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("search", destination);
    if (budget && budget !== "any") params.set("maxPrice", budget);
    router.push(`/packages?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=85"
          alt="Luxury Tropical Ocean Escape"
          className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[10000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/50 to-slate-950/80" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          The Gold Standard in Luxury Travel
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-sm">
          Explore The World <br />
          <span className="bg-gradient-to-r from-blue-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
            With Confidence
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-200 font-light mb-12 drop-shadow">
          Handcrafted luxury tour packages, private aircraft transfers, and five-star sanctuaries tailored to your exact desires.
        </p>

        {/* Floating Glass Search Box */}
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl text-slate-800 text-left border border-white/60 ring-1 ring-black/5">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
            {/* Field 1: Destination */}
            <div className="flex-[1.2] min-w-0 flex items-center gap-3 p-3 bg-slate-50/90 hover:bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 rounded-xl sm:rounded-2xl border border-slate-200/80 transition-all">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Destination
                </label>
                <input
                  type="text"
                  placeholder="Where to next?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Field 2: Date */}
            <div className="flex-1 min-w-0 flex items-center gap-3 p-3 bg-slate-50/90 hover:bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 rounded-xl sm:rounded-2xl border border-slate-200/80 transition-all">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Field 3: Travellers */}
            <div className="flex-1 min-w-0 flex items-center gap-3 p-3 bg-slate-50/90 hover:bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 rounded-xl sm:rounded-2xl border border-slate-200/80 transition-all">
              <Users className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Travellers
                </label>
                <select
                  value={travellers}
                  onChange={(e) => setTravellers(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>
            </div>

            {/* Field 4: Budget */}
            <div className="flex-1 min-w-0 flex items-center gap-2.5 p-3 bg-slate-50/90 hover:bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 rounded-xl sm:rounded-2xl border border-slate-200/80 transition-all">
              <DollarSign className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Budget
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                >
                  <option value="any">Flexible</option>
                  <option value="2500">&lt; $2,500</option>
                  <option value="4000">&lt; $4,000</option>
                  <option value="6000">&lt; $6,000</option>
                </select>
              </div>
            </div>

            {/* Search CTA Button cleanly integrated inside the white card */}
            <button
              type="submit"
              className="w-full lg:w-auto h-[54px] px-6 lg:px-7 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/95 hover:to-emerald-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Feature Highlights beneath search */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-300 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Verified 5-Star Properties
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 100% Guaranteed Departures
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Zero Hidden Reservation Fees
          </span>
        </div>
      </div>
    </section>
  );
};
