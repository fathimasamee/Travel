"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Booking } from "../../types";
import {
  Briefcase,
  Users,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Save,
  MessageSquare,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function StaffOperationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);
  const [notesState, setNotesState] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "STAFF" && user.role !== "ADMIN"))) {
      router.push("/login?redirect=/staff");
    }
  }, [user, authLoading, router]);

  const fetchAssignedBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookings/staff/assigned");
      if (res.data?.success) {
        setBookings(res.data.data);
        const initialNotes: { [id: string]: string } = {};
        res.data.data.forEach((b: Booking) => {
          initialNotes[b.id] = b.operationsNotes || "";
        });
        setNotesState(initialNotes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === "STAFF" || user.role === "ADMIN")) {
      fetchAssignedBookings();
    }
  }, [user]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data?.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus as any } : b))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleSaveNotes = async (bookingId: string) => {
    setSavingNotesId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/operations`, {
        operationsNotes: notesState[bookingId] || "",
      });
      alert("Operations notes saved!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save notes");
    } finally {
      setSavingNotesId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "ALL") return true;
    return b.status === statusFilter;
  });

  if (authLoading || loading) {
    return (
      <div className="pt-32 pb-24 text-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading Operations Portal...</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-slate-50/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
              <Briefcase className="w-4 h-4" /> Concierge Operations Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Assigned Expeditions & Traveler Care
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage day-to-day guest itineraries, contact travellers, and dispatch chauffeur logistics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "PENDING", "CONFIRMED", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all ${
                  statusFilter === st
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Assigned Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">All Operations Clear</h3>
              <p className="text-xs text-slate-500 mt-1">No reservations found for this filter criteria.</p>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 hover:shadow-md transition-all"
              >
                {/* Top Row: Ref, Status, Dates */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-primary font-mono">
                      #{b.bookingNumber}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        b.status === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      Departure: {new Date(b.travelDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-emerald-600" />
                      {b.numberOfPeople} Guest(s)
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Journey */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Tour Package
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{b.package.title}</h4>
                    <p className="text-xs text-slate-500">
                      Destination: {b.package.destination?.name}, {b.package.destination?.country}
                    </p>
                    <p className="text-xs font-bold text-emerald-600">
                      Paid: ${b.finalPrice.toLocaleString()} USD ({b.paymentStatus})
                    </p>
                  </div>

                  {/* Column 2: Lead Customer & Contact */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Lead Traveler
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {b.customer?.firstName} {b.customer?.lastName}
                    </h4>
                    <div className="space-y-1 text-xs">
                      <a
                        href={`mailto:${b.customer?.email}`}
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Mail className="w-3.5 h-3.5" /> {b.customer?.email}
                      </a>
                      {b.customer?.phone && (
                        <a
                          href={`tel:${b.customer?.phone}`}
                          className="flex items-center gap-1.5 text-emerald-600 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" /> {b.customer?.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Special Requests & Status Controls */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Operational Status
                    </span>
                    <select
                      value={b.status}
                      onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                      className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>

                    {b.specialRequests && (
                      <div className="mt-2 p-2.5 rounded-lg bg-amber-50 text-amber-900 text-xs border border-amber-200">
                        <strong>Guest Request:</strong> {b.specialRequests}
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations Dispatch Notes */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Internal Trip Operations Notes (Chauffeur, Room Upgrades, Guide Assignment)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. VIP honeymoon fruit basket requested. Assigned Guide: Master Kenji. Limousine pickup confirmed."
                      value={notesState[b.id] || ""}
                      onChange={(e) => setNotesState({ ...notesState, [b.id]: e.target.value })}
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={savingNotesId === b.id}
                    onClick={() => handleSaveNotes(b.id)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingNotesId === b.id ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
