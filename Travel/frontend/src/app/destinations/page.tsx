"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../lib/api";
import { Destination } from "../../types";
import { Compass, Search, Star, ArrowRight, MapPin } from "lucide-react";

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Beach", "Mountain", "Cultural", "Adventure", "Luxury", "City"];

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/destinations");
        if (res.data?.success) setDestinations(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const filtered = destinations.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase());

    if (selectedCategory === "All") return matchesSearch;
    return matchesSearch && d.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="pt-24 pb-20 bg-slate-50/60 min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">
            World Sanctuaries
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            Handpicked Global Destinations
          </h1>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base font-light">
            From the turquoise atolls of Southeast Asia to the historic peaks of the Swiss Alps, explore our premier travel destinations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & Category Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by country or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  selectedCategory.toLowerCase() === c.toLowerCase()
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No destinations found</h3>
            <p className="text-xs text-slate-500 mt-1">Try another search term or filter category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((dest) => (
              <Link
                key={dest.id}
                href={`/packages?destinationId=${dest.id}`}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-end min-h-[380px]"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md text-white border border-white/30">
                    {dest.country}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{dest.rating.toFixed(2)}</span>
                </div>

                <div className="relative z-10 p-6 text-white">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed font-normal">
                    {dest.description}
                  </p>

                  <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                        Starting From
                      </span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        ${(dest.startingPrice || 1850).toLocaleString()} <span className="text-xs font-normal text-slate-300">/ person</span>
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all">
                      Explore Tours <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
