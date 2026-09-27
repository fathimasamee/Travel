"use client";

import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import { Review } from "../../../types";
import { Star, CheckCircle, EyeOff, Trash2 } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reviews/admin/all");
      if (res.data?.success) setReviews(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id: string) => {
    try {
      const res = await api.put(`/reviews/admin/${id}/approve`);
      if (res.data?.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: !r.isApproved } : r))
        );
      }
    } catch (err: any) {
      alert("Failed to toggle approval status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert("Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Review Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Approve, hide, or moderate customer expedition feedback and star ratings.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Tour Package</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Comment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No customer reviews to moderate.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        {r.user?.firstName} {r.user?.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400">{r.user?.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">
                      {r.package?.title}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-500">
                      {r.rating} ★
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-md italic">
                      "{r.comment}"
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          r.isApproved
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {r.isApproved ? "Approved" : "Hidden"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleApproval(r.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          r.isApproved
                            ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {r.isApproved ? "Hide" : "Approve"}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
