"use client";

import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import { Hotel, Destination } from "../../../types";
import { Building, Plus, Trash2, Edit2, Star, Search } from "lucide-react";

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerNight, setPricePerNight] = useState("450");
  const [rooms, setRooms] = useState("12");
  const [rating, setRating] = useState("4.8");
  const [saving, setSaving] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const [hRes, dRes] = await Promise.all([
        api.get("/hotels"),
        api.get("/destinations"),
      ]);
      if (hRes.data?.success) setHotels(hRes.data.data);
      if (dRes.data?.success) {
        setDestinations(dRes.data.data);
        if (dRes.data.data.length > 0) setDestinationId(dRes.data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/hotels", {
        name,
        destinationId,
        location,
        description,
        pricePerNight: parseFloat(pricePerNight),
        rooms: parseInt(rooms, 10),
        rating: parseFloat(rating),
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        ],
        amenities: ["Spa & Wellness", "Infinity Pool", "Private Butler", "Michelin Dining"],
      });
      setShowModal(false);
      fetchHotels();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create hotel");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;
    try {
      await api.delete(`/hotels/${id}`);
      setHotels((prev) => prev.filter((h) => h.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete hotel");
    }
  };

  const filtered = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-primary" /> Hotel & Resort Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Partner properties, luxury suites, room allocations, and nightly tariffs.
          </p>
        </div>

        <button
          onClick={() => {
            setName("");
            setLocation("");
            setDescription("");
            setShowModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Partner Hotel
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search hotels by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs font-medium focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((h) => (
          <div
            key={h.id}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between"
          >
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {h.destination?.name || "Global Partner"}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {h.rating}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{h.name}</h3>
                <p className="text-xs text-slate-500">{h.location}</p>
                <p className="text-xs text-slate-600 line-clamp-2 mt-2">{h.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tariff</span>
                  <span className="font-extrabold text-slate-900">
                    ${h.pricePerNight} <span className="font-normal text-slate-400">/ night</span>
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(h.id)}
                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Partner Hotel</h3>
            <form onSubmit={handleSaveHotel} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Hotel / Resort Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    <option key={d.id} value={d.id}>{d.name} ({d.country})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Location Details</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Price / Night (USD)</label>
                  <input
                    type="number"
                    required
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Rooms Allocated</label>
                  <input
                    type="number"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
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
                  {saving ? "Saving..." : "Save Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
