"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Package,
  CalendarCheck,
  Users,
  Building,
  Car,
  CreditCard,
  Star,
  Tag,
  BarChart3,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export const AdminSidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Tour Packages", href: "/admin/packages", icon: Package },
    { label: "Destinations", href: "/admin/destinations", icon: Compass },
    { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { label: "Users & Staff", href: "/admin/users", icon: Users },
    { label: "Hotels", href: "/admin/hotels", icon: Building },
    { label: "Vehicles & Fleet", href: "/admin/vehicles", icon: Car },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Reports & CSV", href: "/admin/reports", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 min-h-screen p-5 flex flex-col justify-between shrink-0 border-r border-slate-900">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 pb-6 mb-6 border-b border-slate-900">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">
              TravelSphere <span className="text-emerald-400">Admin</span>
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block -mt-0.5">
              Management Suite
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 text-xs font-semibold">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switcher */}
      <div className="pt-6 border-t border-slate-900">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <span>Return to Client Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
};
