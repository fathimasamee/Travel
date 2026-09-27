"use client";

import React from "react";
import Link from "next/link";
import { Clock, Star, Users, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Package } from "../../types";

interface Props {
  packages: Package[];
}

export const FeaturedPackages: React.FC<Props> = ({ packages }) => {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Curated Masterpieces
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured Tour Packages
            </h2>
            <p className="mt-2 text-slate-500 max-w-xl text-sm sm:text-base">
              Impeccably planned luxury travel journeys with private chauffeurs, five-star accommodations, and VIP excursions.
            </p>
          </div>
          <Link
            href="/packages"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Explore All {packages.length}+ Packages <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.slice(0, 6).map((pkg) => {
            const effectivePrice = pkg.effectivePrice || pkg.price * (1 - pkg.discount / 100);

            return (
              <div
                key={pkg.id}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image & Badges */}
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />

                  {/* Discount Badge */}
                  {pkg.discount > 0 && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500 text-white shadow-md">
                        {pkg.discount}% OFF
                      </span>
                    </div>
                  )}

                  {/* Destination Tag */}
                  <div className="absolute bottom-3 left-4 z-10">
                    <span className="text-xs font-bold text-white uppercase tracking-wider drop-shadow-md">
                      {pkg.destination?.name}, {pkg.destination?.country}
                    </span>
                  </div>

                  {/* Rating Pill */}
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{pkg.rating.toFixed(2)}</span>
                    <span className="text-slate-400 font-normal">({pkg.reviewCount || 24})</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-3">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Clock className="w-4 h-4 text-primary" /> {pkg.duration}
                      </span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <Users className="w-4 h-4 text-emerald-600" /> Max {pkg.maxPeople} Guests
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      <Link href={`/packages/${pkg.id}`}>{pkg.title}</Link>
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Footer & Price */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      {pkg.discount > 0 && (
                        <span className="text-xs text-slate-400 line-through block">
                          ${pkg.price.toLocaleString()}
                        </span>
                      )}
                      <div className="text-xl font-extrabold text-slate-900">
                        ${Math.round(effectivePrice).toLocaleString()}
                        <span className="text-xs font-normal text-slate-500"> / guest</span>
                      </div>
                    </div>

                    <Link
                      href={`/booking/${pkg.id}`}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/95 hover:to-emerald-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all hover:scale-105"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
