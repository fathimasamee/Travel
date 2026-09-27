"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../lib/api";
import {
  Users,
  CalendarCheck,
  DollarSign,
  Package,
  Compass,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/analytics"),
        ]);
        if (statsRes.data?.success) setStats(statsRes.data.data);
        if (chartsRes.data?.success) setCharts(chartsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Gathering Global Analytics...</p>
      </div>
    );
  }

  const cards = stats?.cards || {
    totalCustomers: 24,
    totalBookings: 18,
    totalRevenue: 64250,
    activePackages: 6,
    popularDestinationsCount: 8,
  };

  const monthlyTrends = charts?.monthlyTrends || [];
  const maxRevenue = Math.max(...monthlyTrends.map((m: any) => m.revenue), 100000);
  const destinationStats = charts?.destinationStats || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time commercial metrics, passenger booking velocity, and revenue intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            Export CSV Reports
          </Link>
          <Link
            href="/admin/packages"
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            + Create Tour Package
          </Link>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Card 1: Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{cards.totalCustomers}</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              +14% this month
            </span>
          </div>
        </div>

        {/* Card 2: Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{cards.totalBookings}</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              +8% conversion rate
            </span>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-600">
              ${cards.totalRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">Verified gross deposits</span>
          </div>
        </div>

        {/* Card 4: Active Packages */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Packages
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{cards.activePackages}</span>
            <span className="text-[11px] text-slate-500 block mt-1">Live in catalog</span>
          </div>
        </div>

        {/* Card 5: Popular Destinations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Destinations
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{cards.popularDestinationsCount}</span>
            <span className="text-[11px] text-slate-500 block mt-1">Global locations</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Monthly Revenue & Booking Trends
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Annual gross commercial performance</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              FY 2026
            </span>
          </div>

          {/* SVG / Bar Chart Representation */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 border-b border-slate-100">
            {monthlyTrends.map((item: any, i: number) => {
              const heightPercent = Math.max(10, Math.round((item.revenue / maxRevenue) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${Math.round(item.revenue / 1000)}k
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[32px] bg-gradient-to-t from-primary to-emerald-400 rounded-t-lg group-hover:brightness-110 transition-all shadow-sm"
                  />
                  <span className="text-[11px] font-bold text-slate-600 mt-1">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Destinations Share */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Popular Destinations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by customer bookings</p>
          </div>

          <div className="space-y-4">
            {destinationStats.map((dest: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{dest.name}</span>
                  <span className="text-emerald-600">{dest.rating} ★</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, dest.bookingsCount * 3)}%` }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Bookings</h3>
            <p className="text-xs text-slate-500">Live booking reservations across the system</p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            View All Bookings <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {stats?.recentBookings?.map((b: any) => (
            <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-mono font-bold text-primary mr-2">#{b.bookingNumber}</span>
                <span className="font-bold text-slate-900">{b.customer?.firstName} {b.customer?.lastName}</span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-slate-600">{b.package?.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-900">${b.finalPrice.toLocaleString()} USD</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    b.status === "CONFIRMED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
