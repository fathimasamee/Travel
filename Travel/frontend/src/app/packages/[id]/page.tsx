"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { Package } from "../../../types";
import {
  Clock,
  Users,
  Star,
  MapPin,
  Check,
  X,
  Calendar,
  ShieldCheck,
  Building,
  Car,
  Heart,
  Share2,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");
  const [isFavourite, setIsFavourite] = useState(false);

  // Booking widget state
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await api.get(`/packages/${id}`);
        if (res.data?.success) {
          const data = res.data.data;
          setPkg(data);
          setActiveImage(data.image);

          // default travel date: 30 days from today
          const d = new Date();
          d.setDate(d.getDate() + 30);
          setSelectedDate(d.toISOString().split("T")[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  const handleToggleFavourite = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const res = await api.post(`/users/favourites/${id}`);
      if (res.data?.success) {
        setIsFavourite(res.data.isFavourite);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProceedBooking = () => {
    router.push(`/booking/${id}?date=${selectedDate}&guests=${guests}`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post("/reviews", {
        packageId: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.data?.success) {
        setReviewSuccess(true);
        setReviewComment("");
        // Reload package to refresh reviews
        const updatedRes = await api.get(`/packages/${id}`);
        if (updatedRes.data?.success) setPkg(updatedRes.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 text-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading luxury expedition details...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="pt-32 pb-24 text-center min-h-screen">
        <h2 className="text-2xl font-bold text-slate-800">Package Not Found</h2>
        <Link href="/packages" className="mt-4 inline-block text-primary font-semibold hover:underline">
          Return to Tour Packages
        </Link>
      </div>
    );
  }

  const effectivePrice = pkg.effectivePrice || pkg.price * (1 - pkg.discount / 100);
  const totalTripPrice = effectivePrice * guests;
  const galleryList = Array.isArray(pkg.gallery) && pkg.gallery.length > 0 ? pkg.gallery : [pkg.image];

  return (
    <div className="pt-24 pb-20 bg-slate-50/50 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/packages" className="hover:text-primary transition-colors">
            Tour Packages
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">{pkg.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
                {pkg.destination?.name}, {pkg.destination?.country}
              </span>
              {pkg.discount > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-500 text-white">
                  Save {pkg.discount}%
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {pkg.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-slate-600">
              <span className="flex items-center gap-1 font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {pkg.rating.toFixed(2)}
                <span className="text-slate-400 font-normal">({pkg.reviews?.length || 24} reviews)</span>
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-4 h-4 text-primary" /> {pkg.duration}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-4 h-4 text-emerald-600" /> Max {pkg.maxPeople} Guests
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleToggleFavourite}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold ${
                isFavourite
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavourite ? "fill-rose-500 text-rose-500" : ""}`} />
              <span className="hidden sm:inline">{isFavourite ? "Saved" : "Save"}</span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: pkg.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-semibold"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-12">
          {/* Main Large Photo */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden h-[420px] bg-slate-900 shadow-md">
            <img
              src={activeImage}
              alt={pkg.title}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
          </div>

          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
            {galleryList.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`relative flex-1 rounded-xl overflow-hidden h-24 lg:h-[96px] border-2 transition-all ${
                  activeImage === img ? "border-primary scale-[1.02] shadow-md" : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content & Sticky Booking Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details, Itinerary, Services, Reviews */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview Section */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Expedition Overview</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {pkg.description}
              </p>

              {/* Quick Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Duration</span>
                  <span className="text-sm font-bold text-slate-800">{pkg.duration}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Available Seats</span>
                  <span className="text-sm font-bold text-emerald-600">{pkg.availableSeats} of {pkg.maxPeople}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Rating</span>
                  <span className="text-sm font-bold text-slate-800">{pkg.rating.toFixed(2)} / 5.0</span>
                </div>
              </div>
            </div>

            {/* Day-by-Day Itinerary Timeline */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Day-by-Day Itinerary</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Carefully structured chronological journey</p>
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {pkg.itinerary?.length || 0} Days Planned
                </span>
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {pkg.itinerary?.map((day, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary border-4 border-white shadow-sm flex items-center justify-center text-[10px] text-white font-bold" />

                    <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100 group-hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                          Day {day.day || idx + 1}
                        </span>
                        {day.meals && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                            {day.meals}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-2">{day.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {day.description}
                      </p>

                      {day.hotel && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                          <Building className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Overnight: {day.hotel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Included & Excluded Services */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900">What's Included & Excluded</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Included */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                    <Check className="w-4 h-4" /> Included In Package
                  </h3>
                  <ul className="space-y-2.5">
                    {pkg.includedServices?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Excluded */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
                    <X className="w-4 h-4" /> Excluded From Package
                  </h3>
                  <ul className="space-y-2.5">
                    {pkg.excludedServices?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                        <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                          <X className="w-3 h-3" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Hotel & Vehicle Details */}
            {(pkg.hotel || pkg.vehicle) && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Accommodations & Chauffeur</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pkg.hotel && (
                    <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                        <Building className="w-4 h-4" /> 5-Star Partner Property
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{pkg.hotel.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 mb-3">{pkg.hotel.location}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{pkg.hotel.description}</p>
                    </div>
                  )}

                  {pkg.vehicle && (
                    <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-2">
                        <Car className="w-4 h-4" /> VIP Fleet Transport
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{pkg.vehicle.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        Capacity: {pkg.vehicle.capacity} Guests • Chauffeur Included
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Enjoy effortless transfers equipped with air conditioning, panoramic windows, and complimentary onboard amenities.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Reviews & Feedback */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Traveler Reviews</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {pkg.rating.toFixed(2)} out of 5 ({pkg.reviews?.length || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {pkg.reviews && pkg.reviews.length > 0 ? (
                  pkg.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${rev.user?.firstName}`}
                            alt={rev.user?.firstName}
                            className="w-8 h-8 rounded-full border border-emerald-400 object-cover"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {rev.user?.firstName} {rev.user?.lastName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No reviews posted yet. Be the first to review!</p>
                )}
              </div>

              {/* Add Review Form */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" /> Leave a Review
                </h3>

                {reviewSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    Thank you! Your review has been submitted.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-600">Your Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 text-amber-400"
                          >
                            <Star className={`w-5 h-5 ${star <= reviewRating ? "fill-amber-400" : "text-slate-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      required
                      rows={3}
                      placeholder="Share details of your journey..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Engine Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xl space-y-6">
              {/* Pricing Header */}
              <div className="pb-4 border-b border-slate-100">
                <div className="flex items-baseline gap-2">
                  {pkg.discount > 0 && (
                    <span className="text-sm text-slate-400 line-through">
                      ${pkg.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-3xl font-extrabold text-slate-900">
                    ${Math.round(effectivePrice).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ person</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Best Commercial Rate Guarantee
                </div>
              </div>

              {/* Date & Guests Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Departure Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Number of Guests
                  </label>
                  <div className="flex items-center justify-between p-2 border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      type="button"
                      disabled={guests <= 1}
                      onClick={() => setGuests(guests - 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-slate-900">{guests} Traveller{guests > 1 ? "s" : ""}</span>
                    <button
                      type="button"
                      disabled={guests >= pkg.availableSeats}
                      onClick={() => setGuests(guests + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {pkg.availableSeats} seats remaining for immediate booking
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>${Math.round(effectivePrice).toLocaleString()} × {guests} Guest{guests > 1 ? "s" : ""}</span>
                  <span>${Math.round(totalTripPrice).toLocaleString()}</span>
                </div>
                {pkg.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Package Discount ({pkg.discount}%)</span>
                    <span>-${Math.round((pkg.price * (pkg.discount / 100)) * guests).toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Estimated Total</span>
                  <span className="text-primary">${Math.round(totalTripPrice).toLocaleString()} USD</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={handleProceedBooking}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/95 hover:to-emerald-600 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Book This Journey
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Free cancellation up to 30 days before departure. You won't be charged until the final payment step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
