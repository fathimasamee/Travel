import React from "react";
import Link from "next/link";
import { Compass, ShieldCheck, Award, CreditCard, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Travel<span className="text-emerald-400">Sphere</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              TravelSphere is a premier commercial travel management company curating bespoke luxury expeditions, VIP private itineraries, and unforgettable journeys across the globe.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-300 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> ATOL & IATA Protected
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> World Travel Award 2026
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Exploration</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/destinations" className="hover:text-white transition-colors">
                  Top Destinations
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-white transition-colors">
                  Curated Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/packages?category=Luxury" className="hover:text-white transition-colors">
                  Private Villa Escapes
                </Link>
              </li>
              <li>
                <Link href="/packages?category=Adventure" className="hover:text-white transition-colors">
                  Safari & Wildlife
                </Link>
              </li>
            </ul>
          </div>

          {/* Corporate / Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Customer Portal
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-white transition-colors">
                  Operations Desk
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Executive Suite
                </Link>
              </li>
              <li>
                <span className="text-slate-500">24/7 Global Concierge</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Concierge Office</h4>
            <div className="space-y-2.5 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>One Mayfair Grand, London & 5th Ave, New York</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+1 (800) 555-SPHERE</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>concierge@travelsphere.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TravelSphere Global Management Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>PCI-DSS Level 1 Secure Payments</span>
            <span>256-bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
