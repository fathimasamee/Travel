"use client";

import React from "react";
import Link from "next/link";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { Destination } from "../../types";

interface Props {
  destinations: Destination[];
}

export const PopularDestinations: React.FC<Props> = ({ destinations }) => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest mb-2">
              <MapPin className="w-3.5 h-3.5" /> Iconic Sanctuaries
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Popular Destinations
            </h2>
            <p className="mt-2 text-slate-500 max-w-xl text-sm sm:text-base">
              From sun-drenched Mediterranean cliffs to serene alpine retreats, explore our travelers' most beloved destinations.
            </p>
          </div>
          <Link
            href="/destinations"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Browse All Destinations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.slice(0, 6).map((dest) => (
            <Link
              key={dest.id}
              href={`/packages?destinationId=${dest.id}`}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-end min-h-[380px]"
            >
              {/* Background Image */}
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

              {/* Country Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md text-white border border-white/30">
                  {dest.country}
                </span>
              </div>

              {/* Rating Pill */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{dest.rating.toFixed(2)}</span>
              </div>

              {/* Card Details */}
              <div className="relative z-10 p-6 text-white">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 mb-4 font-normal leading-relaxed">
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
                    View Trips <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
