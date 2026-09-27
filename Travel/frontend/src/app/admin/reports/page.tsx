"use client";

import React, { useState } from "react";
import api from "../../../lib/api";
import { BarChart3, Download, FileSpreadsheet, Users, DollarSign, CalendarCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: "bookings" | "revenue" | "users") => {
    setDownloading(type);
    try {
      const res = await api.get(`/reports/export/${type}`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TravelSphere-${type.toUpperCase()}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Failed to export ${type} data.`);
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      id: "bookings",
      title: "Passenger Bookings Manifest",
      desc: "Complete chronological report of all reservations, destinations, customer contacts, flight departure dates, and operational statuses.",
      icon: CalendarCheck,
      color: "text-primary",
      bg: "bg-blue-50",
    },
    {
      id: "revenue",
      title: "Financial Ledger & Revenue Audit",
      desc: "Itemized transaction records including card transactions, bank wire clears, net amounts, and discount deductions.",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "users",
      title: "Client & Staff Directory",
      desc: "Comprehensive register of customer profiles, email verifications, assigned roles, and total historic journey counts.",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Reports & Manifest Exporters
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate production CSV data dumps for accounting, external audits, and travel partner dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-xl ${r.bg} ${r.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{r.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{r.desc}</p>
              </div>

              <button
                type="button"
                disabled={downloading === r.id}
                onClick={() => handleDownload(r.id as any)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading === r.id ? "Generating CSV..." : "Download CSV Data"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
