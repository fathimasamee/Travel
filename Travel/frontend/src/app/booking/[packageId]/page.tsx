"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { Package, Traveller, Booking } from "../../../types";
import {
  Calendar,
  Users,
  CreditCard,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  FileText,
  Download,
  Printer,
  Sparkles,
  Lock,
} from "lucide-react";

export default function BookingWorkflowPage({ params }: { params: Promise<{ packageId: string }> }) {
  const { packageId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  // Step 1: Date & Guests
  const [travelDate, setTravelDate] = useState(searchParams.get("date") || "");
  const [guestCount, setGuestCount] = useState<number>(parseInt(searchParams.get("guests") || "2", 10));
  const [specialRequests, setSpecialRequests] = useState("");

  // Step 2: Travellers Information
  const [travellers, setTravellers] = useState<Traveller[]>([
    {
      fullName: user ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
      phone: user?.phone || "",
      passportNumber: "",
      age: 32,
      gender: "Male",
      isLead: true,
    },
    {
      fullName: "",
      email: "",
      phone: "",
      passportNumber: "",
      age: 30,
      gender: "Female",
      isLead: false,
    },
  ]);

  // Step 3: Payment & Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "BANK_TRANSFER" | "CASH">("CARD");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cardName, setCardName] = useState(user ? `${user.firstName} ${user.lastName}` : "Eleanor Vance");
  const [isProcessing, setIsProcessing] = useState(false);

  // Step 4: Confirmed Booking Details
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await api.get(`/packages/${packageId}`);
        if (res.data?.success) {
          setPkg(res.data.data);
          if (!travelDate) {
            const d = new Date();
            d.setDate(d.getDate() + 30);
            setTravelDate(d.toISOString().split("T")[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [packageId]);

  // Adjust travellers array when guest count changes
  useEffect(() => {
    setTravellers((prev) => {
      const updated = [...prev];
      if (guestCount > updated.length) {
        for (let i = updated.length; i < guestCount; i++) {
          updated.push({
            fullName: "",
            email: "",
            phone: "",
            passportNumber: "",
            age: 28,
            gender: "Other",
            isLead: false,
          });
        }
      } else if (guestCount < updated.length) {
        return updated.slice(0, guestCount);
      }
      return updated;
    });
  }, [guestCount]);

  const handleTravellerChange = (index: number, field: keyof Traveller, value: any) => {
    const updated = [...travellers];
    updated[index] = { ...updated[index], [field]: value };
    setTravellers(updated);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponMessage("");
    try {
      const effectivePrice = pkg ? (pkg.effectivePrice || pkg.price * (1 - pkg.discount / 100)) : 0;
      const subtotal = effectivePrice * guestCount;

      const res = await api.post("/coupons/validate", {
        code: couponCode,
        amount: subtotal,
      });

      if (res.data?.success) {
        setCouponDiscount(res.data.data.calculatedDiscount);
        setCouponMessage(`Discount of $${res.data.data.calculatedDiscount.toLocaleString()} applied!`);
      }
    } catch (err: any) {
      setCouponDiscount(0);
      setCouponMessage(err.response?.data?.message || "Invalid coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleExecuteBooking = async () => {
    if (!user) {
      router.push(`/login?redirect=/booking/${packageId}`);
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create booking in system
      const bookingRes = await api.post("/bookings", {
        packageId,
        travelDate,
        numberOfPeople: guestCount,
        travellers,
        couponCode: couponDiscount > 0 ? couponCode : undefined,
        specialRequests,
      });

      if (!bookingRes.data?.success) {
        throw new Error(bookingRes.data?.message || "Failed to create booking");
      }

      const newBooking = bookingRes.data.data;

      // 2. Execute Payment Confirmation
      const paymentRes = await api.post("/payments/confirm", {
        bookingId: newBooking.id,
        method: paymentMethod,
        transactionId: `TXN_${paymentMethod}_${Date.now()}`,
        notes: `Confirmed via ${paymentMethod}`,
      });

      if (!paymentRes.data?.success) {
        throw new Error("Payment verification failed");
      }

      // Fetch refreshed confirmed booking details
      const detailRes = await api.get(`/bookings/${newBooking.id}`);
      setConfirmedBooking(detailRes.data.data);
      setStep(4);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Booking transaction failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      const res = await api.get(`/payments/invoice/${bookingId}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TravelSphere-Invoice-${bookingId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed", err);
      alert("Failed to download PDF invoice. Please view in Dashboard.");
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 text-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Initializing Booking Engine...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-xl font-bold">Package Not Found</h2>
        <Link href="/packages" className="text-primary mt-2 inline-block">Browse Packages</Link>
      </div>
    );
  }

  const effectivePrice = pkg.effectivePrice || pkg.price * (1 - pkg.discount / 100);
  const subtotal = effectivePrice * guestCount;
  const finalPrice = Math.max(0, subtotal - couponDiscount);

  return (
    <div className="pt-24 pb-20 bg-slate-50/60 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator Header */}
        <div className="mb-10 text-center">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
            VIP Reservation
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            TravelSphere Booking Engine
          </h1>

          {/* Stepper Progress */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8 max-w-xl mx-auto">
            {[
              { num: 1, label: "Expedition & Date" },
              { num: 2, label: "Traveller Info" },
              { num: 3, label: "Payment & Perks" },
              { num: 4, label: "Confirmation" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.num
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                      : step > s.num
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${step === s.num ? "text-slate-900" : "text-slate-400"}`}>
                  {s.label}
                </span>
                {s.num < 4 && <div className="w-4 sm:w-8 h-0.5 bg-slate-200" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Package & Date */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Selected Package Banner */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full sm:w-36 h-28 rounded-xl object-cover"
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                    {pkg.destination?.name}, {pkg.destination?.country}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{pkg.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{pkg.duration} • 5-Star Accommodations</p>
                </div>
              </div>

              {/* Date & Guests Form */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-slate-900">Configure Dates & Guests</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      required
                      value={travelDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full p-3 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Total Guests
                    </label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                      className="w-full p-3 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <option key={num} value={num} disabled={num > pkg.availableSeats}>
                          {num} Guest{num > 1 ? "s" : ""} {num > pkg.availableSeats ? "(Sold Out)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Special Concierge Requests (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Dietary requirements, honeymoon/anniversary perks, bed configurations, airport meet & greet preferences..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  Continue to Traveller Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sidebar Pricing Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Reservation Summary
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>${Math.round(effectivePrice).toLocaleString()} × {guestCount} Guests</span>
                    <span>${Math.round(subtotal).toLocaleString()}</span>
                  </div>
                  {pkg.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Exclusive Discount ({pkg.discount}%)</span>
                      <span>-${Math.round((pkg.price * (pkg.discount / 100)) * guestCount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
                    <span>Subtotal</span>
                    <span className="text-primary">${Math.round(subtotal).toLocaleString()} USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Traveller Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Enter Traveller Information</h3>
                <p className="text-xs text-slate-500">
                  Please ensure names match government-issued passport documentation.
                </p>
              </div>

              {travellers.map((traveller, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                      {idx === 0 ? "Lead Traveller (Primary Contact)" : `Guest #${idx + 1}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Johnathan Doe"
                        value={traveller.fullName}
                        onChange={(e) => handleTravellerChange(idx, "fullName", e.target.value)}
                        className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. US98471209"
                        value={traveller.passportNumber || ""}
                        onChange={(e) => handleTravellerChange(idx, "passportNumber", e.target.value)}
                        className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Gender
                      </label>
                      <select
                        value={traveller.gender || "Female"}
                        onChange={(e) => handleTravellerChange(idx, "gender", e.target.value)}
                        className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other / Decline</option>
                      </select>
                    </div>
                  </div>

                  {idx === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                          Email for Confirmation & Invoices
                        </label>
                        <input
                          type="email"
                          required
                          value={traveller.email || ""}
                          onChange={(e) => handleTravellerChange(idx, "email", e.target.value)}
                          className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                          Phone Number (SMS Notifications)
                        </label>
                        <input
                          type="tel"
                          value={traveller.phone || ""}
                          onChange={(e) => handleTravellerChange(idx, "phone", e.target.value)}
                          className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                Proceed to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment & Coupon */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method Selector */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Select Payment Method
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "CARD", label: "Credit Card", icon: CreditCard },
                    { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2 },
                    { id: "CASH", label: "Cash on Arrival", icon: CheckCircle2 },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        paymentMethod === m.id
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <m.icon className="w-5 h-5 mx-auto mb-1.5" />
                      <span className="text-xs font-bold block">{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Card Payment Form */}
                {paymentMethod === "CARD" && (
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full p-2.5 text-xs font-mono font-bold border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                          Expiration (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full p-2.5 text-xs font-mono font-bold border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                          Security CVV
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full p-2.5 text-xs font-mono font-bold border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Bank Transfer Instructions */}
                {paymentMethod === "BANK_TRANSFER" && (
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs text-slate-700">
                    <p className="font-bold text-slate-900">Bank Wire Instructions:</p>
                    <p>Beneficiary: <strong>TravelSphere Global Escrow Ltd.</strong></p>
                    <p>Bank: <strong>HSBC Private Bank London</strong></p>
                    <p>IBAN: <strong>GB29 HBUK 4012 8847 2910 44</strong></p>
                    <p>SWIFT/BIC: <strong>HBUKGB41XXX</strong></p>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Our system will record this reservation immediately as Confirmed.
                    </p>
                  </div>
                )}

                {/* Cash on Arrival Instructions */}
                {paymentMethod === "CASH" && (
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-2">
                    <p className="font-bold text-slate-900">Concierge Cash Settlement:</p>
                    <p>
                      You may settle your total balance with our lead concierge at the hotel lobby upon check-in.
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold">
                      ✓ Instant confirmation secured with no upfront credit charge.
                    </p>
                  </div>
                )}
              </div>

              {/* Coupon Code Section */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Promotional Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10, LUXURY250"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 p-2.5 text-xs font-bold uppercase border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    disabled={validatingCoupon || !couponCode}
                    onClick={handleValidateCoupon}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                  >
                    {validatingCoupon ? "Checking..." : "Apply Code"}
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-xs font-semibold ${couponDiscount > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecuteBooking}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/95 hover:to-emerald-600 text-white font-bold text-sm shadow-xl shadow-primary/25 transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {isProcessing ? "Processing VIP Booking..." : `Authorize & Confirm ($${Math.round(finalPrice).toLocaleString()})`}
                </button>
              </div>
            </div>

            {/* Sidebar Pricing Breakdown */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Final Checkout Summary
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>${Math.round(effectivePrice).toLocaleString()} × {guestCount} Guests</span>
                    <span>${Math.round(subtotal).toLocaleString()}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promo ({couponCode.toUpperCase()})</span>
                      <span>-${Math.round(couponDiscount).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                    <span>Total Due</span>
                    <span className="text-primary">${Math.round(finalPrice).toLocaleString()} USD</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-slate-400 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>256-bit SSL Bank Security Protection</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation & Invoices */}
        {step === 4 && confirmedBooking && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in-50 zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Booking Secured Successfully
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Pack Your Bags! Your Journey is Confirmed.
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                A formal itinerary confirmation and official VAT tax receipt have been sent to your email.
              </p>
            </div>

            {/* Reference Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-bold text-primary text-sm">{confirmedBooking.bookingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expedition:</span>
                <span className="font-semibold text-slate-800">{pkg.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Travel Date:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(confirmedBooking.travelDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Party:</span>
                <span className="font-semibold text-slate-800">{confirmedBooking.numberOfPeople} Guest(s)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-600">${confirmedBooking.finalPrice.toLocaleString()} USD</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadInvoice(confirmedBooking.id)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                Download PDF Invoice
              </button>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                View in Customer Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
