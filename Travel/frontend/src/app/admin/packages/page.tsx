"use client";

import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import { Package, Destination } from "../../../types";
import {
  Package as PackageIcon,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [title, setTitle] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("7 Days / 6 Nights");
  const [price, setPrice] = useState("2500");
  const [discount, setDiscount] = useState("10");
  const [maxPeople, setMaxPeople] = useState("12");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const [pkgRes, destRes] = await Promise.all([
        api.get("/packages?limit=50"),
        api.get("/destinations"),
      ]);
      if (pkgRes.data?.success) setPackages(pkgRes.data.data);
      if (destRes.data?.success) {
        setDestinations(destRes.data.data);
        if (destRes.data.data.length > 0) setDestinationId(destRes.data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openCreateModal = () => {
    setEditingPackage(null);
    setTitle("");
    setDescription("");
    setDuration("7 Days / 6 Nights");
    setPrice("2500");
    setDiscount("10");
    setMaxPeople("12");
    setImage("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80");
    setShowModal(true);
  };

  const openEditModal = (p: Package) => {
    setEditingPackage(p);
    setTitle(p.title);
    setDestinationId(p.destinationId);
    setDescription(p.description);
    setDuration(p.duration);
    setPrice(String(p.price));
    setDiscount(String(p.discount));
    setMaxPeople(String(p.maxPeople));
    setImage(p.image);
    setShowModal(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        destinationId,
        description,
        duration,
        durationDays: parseInt(duration) || 7,
        price: parseFloat(price),
        discount: parseFloat(discount),
        maxPeople: parseInt(maxPeople, 10),
        image,
      };

      if (editingPackage) {
        await api.put(`/packages/${editingPackage.id}`, payload);
      } else {
        await api.post("/packages", payload);
      }

      setShowModal(false);
      fetchPackages();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this tour package?")) return;
    try {
      await api.delete(`/packages/${id}`);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete package");
    }
  };

  const filtered = packages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.destination?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <PackageIcon className="w-6 h-6 text-primary" /> Tour Package Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, update pricing, configure itineraries, and manage live availability.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Package
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search packages by title or destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs font-medium focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Seats Left</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Loading packages...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No tour packages found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.title} className="w-12 h-9 rounded-lg object-cover" />
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">{p.title}</span>
                          <span className="text-[10px] text-slate-400">ID: {p.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {p.destination?.name} ({p.destination?.country})
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{p.duration}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ${p.price.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.discount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 text-[10px]">
                          {p.discount}% OFF
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {p.availableSeats} / {p.maxPeople}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(p.id)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingPackage ? "Edit Tour Package" : "Create New Tour Package"}
            </h3>

            <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Package Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Destination</label>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Max Guests</label>
                <input
                  type="number"
                  value={maxPeople}
                  onChange={(e) => setMaxPeople(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Primary Image URL</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
