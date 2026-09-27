"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "../../lib/api";
import { Package, Destination } from "../../types";
import {
  Search,
  Filter,
  Clock,
  Users,
  Star,
  MapPin,
  Sparkles,
  ArrowUpDown,
  Tag,
} from "lucide-react";

function PackagesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialDest = searchParams.get("destinationId") || "all";
  const initialCat = searchParams.get("category") || "all";
  const initialMaxPrice = searchParams.get("maxPrice") || "";

  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialSearch);
  const [selectedDestination, setSelectedDestination] = useState(initialDest);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sortBy, setSortBy] = useState("featured");

  const categories = ["All", "Beach", "Mountain", "Cultural", "Adventure", "Luxury", "City"];

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await api.get("/destinations");
        if (res.data?.success) {
          setDestinations(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDestinations();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedDestination !== "all") params.set("destinationId", selectedDestination);
      if (selectedCategory !== "All" && selectedCategory !== "all") params.set("category", selectedCategory);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (sortBy) params.set("sortBy", sortBy);

      const res = await api.get(`/packages?${params.toString()}`);
      if (res.data?.success) {
        setPackages(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [selectedDestination, selectedCategory, maxPrice, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPackages();
  };

  return (
    <div className="pt-24 pb-20 bg-slate-50/60 min-h-screen">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">
            Curated Expeditions
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            Explore All Tour Packages
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base font-light">
            Discover bespoke journeys planned with private transportation, top-tier accommodations, and licensed insider guides.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Filter Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                  <Filter className="w-4 h-4 text-primary" /> Filter Tours
                </h3>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedDestination("all");
                    setSelectedCategory("All");
                    setMaxPrice("");
                    setSortBy("featured");
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* Search query */}
              <form onSubmit={handleSearchSubmit} className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Keywords
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title, city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </form>

              {/* Destination Dropdown */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Destination
                </label>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-primary text-slate-800"
                >
                  <option value="all">All Destinations</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Pills */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Travel Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
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

              {/* Max Budget Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Max Budget: {maxPrice ? `$${parseInt(maxPrice).toLocaleString()}` : "Any"}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="6000"
                  step="250"
                  value={maxPrice || "6000"}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>$1,000</span>
                  <span>$6,000+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-semibold text-slate-700">
                Showing <strong className="text-slate-900">{packages.length}</strong> Curated Packages
              </span>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-bold p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none text-slate-800"
                >
                  <option value="featured">Featured First</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Releases</option>
                </select>
              </div>
            </div>

            {/* Loading Skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : packages.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Tour Packages Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  We couldn't find any journeys matching your criteria. Try adjusting your filters or search keywords.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedDestination("all");
                    setSelectedCategory("All");
                    setMaxPrice("");
                  }}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map((pkg) => {
                  const effectivePrice = pkg.effectivePrice || pkg.price * (1 - pkg.discount / 100);

                  return (
                    <div
                      key={pkg.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="relative h-56 overflow-hidden bg-slate-100">
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60" />

                        {pkg.discount > 0 && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500 text-white shadow-md">
                              {pkg.discount}% OFF
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 z-10">
                          <span className="text-xs font-bold text-white uppercase tracking-wider drop-shadow-md">
                            {pkg.destination?.name}, {pkg.destination?.country}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
                          <Star className="w-3.5 h-3.5 fill-amber-300" />
                          <span>{pkg.rating.toFixed(2)}</span>
                          <span className="text-slate-400 font-normal">({pkg.reviewCount || 20})</span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mb-2">
                            <span className="flex items-center gap-1 text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-primary" /> {pkg.duration}
                            </span>
                            <span className="flex items-center gap-1 text-slate-700">
                              <Users className="w-3.5 h-3.5 text-emerald-600" /> {pkg.availableSeats} Seats Left
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            <Link href={`/packages/${pkg.id}`}>{pkg.title}</Link>
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            {pkg.discount > 0 && (
                              <span className="text-[11px] text-slate-400 line-through block leading-tight">
                                ${pkg.price.toLocaleString()}
                              </span>
                            )}
                            <div className="text-lg font-extrabold text-slate-900">
                              ${Math.round(effectivePrice).toLocaleString()}
                              <span className="text-xs font-normal text-slate-500"> / guest</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/packages/${pkg.id}`}
                              className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
                            >
                              Details
                            </Link>
                            <Link
                              href={`/booking/${pkg.id}`}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/95 hover:to-emerald-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all hover:scale-105"
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">Loading tour packages...</div>}>
      <PackagesContent />
    </Suspense>
  );
}
