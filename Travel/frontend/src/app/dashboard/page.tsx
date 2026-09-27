"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Booking, Package, NotificationItem } from "../../types";
import {
  Calendar,
  Heart,
  User,
  Bell,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "bookings";

  const { user, loading: authLoading, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favourites, setFavourites] = useState<Package[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Profile Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone || "");
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookRes, favRes, notifRes] = await Promise.all([
        api.get("/bookings/my-bookings"),
        api.get("/users/favourites"),
        api.get("/users/notifications"),
      ]);

      if (bookRes.data?.success) setBookings(bookRes.data.data);
      if (favRes.data?.success) setFavourites(favRes.data.data);
      if (notifRes.data?.success) setNotifications(notifRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (bookingId: string, bookingNumber: string) => {
    try {
      const res = await api.get(`/payments/invoice/${bookingId}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${bookingNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error generating invoice. Please retry.");
    }
  };

  const handleExecuteCancel = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    try {
      const res = await api.put(`/bookings/${cancellingBooking.id}/cancel`, {
        cancellationReason,
      });
      if (res.data?.success) {
        setCancellingBooking(null);
        setCancellationReason("");
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRemoveFavourite = async (packageId: string) => {
    try {
      await api.post(`/users/favourites/${packageId}`);
      setFavourites((prev) => prev.filter((p) => p.id !== packageId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMessage("");
    try {
      await updateUserProfile({ firstName, lastName, phone });
      setProfileMessage("Profile updated successfully!");
    } catch (err: any) {
      setProfileMessage("Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <Clock className="w-3.5 h-3.5" /> Pending Payment
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Accessing Customer Suite...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pt-24 pb-20 bg-slate-50/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Welcome Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`}
              alt={user.firstName}
              className="w-16 h-16 rounded-full border-2 border-emerald-400 object-cover shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome back, {user.firstName}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">
                  VIP Traveler
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {user.email} • Member since {new Date(user.createdAt).getFullYear()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xl font-extrabold text-slate-900">{bookings.length}</span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Trips Booked</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xl font-extrabold text-rose-500">{favourites.length}</span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Wishlisted</span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          {[
            { id: "bookings", label: "My Bookings & Invoices", icon: Calendar },
            { id: "favourites", label: `Saved Favourites (${favourites.length})`, icon: Heart },
            { id: "profile", label: "Profile & Security", icon: User },
            { id: "notifications", label: `Notifications (${notifications.length})`, icon: Bell },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 py-3 px-5 font-semibold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: My Bookings */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Reservations Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  You haven't reserved any luxury journeys yet. Explore our handcrafted expeditions to get started.
                </p>
                <Link
                  href="/packages"
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Explore Tour Packages
                </Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <img
                      src={booking.package.image}
                      alt={booking.package.title}
                      className="w-full sm:w-40 h-28 rounded-xl object-cover shadow-inner"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-primary font-mono">
                          #{booking.bookingNumber}
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                        {booking.package.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Departure: <strong>{new Date(booking.travelDate).toLocaleDateString()}</strong> • {booking.numberOfPeople} Guest(s)
                      </p>
                      <p className="text-xs font-bold text-slate-900 mt-2">
                        Total: ${booking.finalPrice.toLocaleString()} USD •{" "}
                        <span className="text-emerald-600 font-semibold">{booking.paymentStatus}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(booking.id, booking.bookingNumber)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Invoice PDF
                    </button>

                    {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => setCancellingBooking(booking)}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-all"
                      >
                        Cancel Trip
                      </button>
                    )}

                    <Link
                      href={`/packages/${booking.packageId}`}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all"
                    >
                      View Package
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Favourites */}
        {activeTab === "favourites" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Your Wishlist is Empty</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  Save your favorite dream destinations and packages to monitor seasonal deals and seat availability.
                </p>
                <Link
                  href="/packages"
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Browse Tours
                </Link>
              </div>
            ) : (
              favourites.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="relative h-48">
                    <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveFavourite(pkg.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-500 hover:bg-rose-50 shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{pkg.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{pkg.duration}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                      <span className="text-base font-extrabold text-slate-900">
                        ${pkg.price.toLocaleString()}
                      </span>
                      <Link
                        href={`/booking/${pkg.id}`}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm"
                      >
                        Book Trip
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Profile Settings */}
        {activeTab === "profile" && (
          <div className="max-w-2xl bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Personal Account Details</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your contact details and communication preferences.
              </p>
            </div>

            {profileMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {updatingProfile ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === "notifications" && (
          <div className="max-w-3xl bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              VIP Notifications & Updates
            </h3>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No notifications at this time.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{n.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Cancellation Modal */}
        {cancellingBooking && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in-50 zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">Cancel Reservation</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to cancel booking #{cancellingBooking.bookingNumber}? This action will release your reserved seats.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Schedule conflict, medical reason, personal..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingBooking(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  disabled={isCancelling || !cancellationReason}
                  onClick={handleExecuteCancel}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">Loading Customer Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
