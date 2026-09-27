"use client";

import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import { Vehicle } from "../../../types";
import { Car, Plus, Trash2, Users, DollarSign, CheckCircle2 } from "lucide-react";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"VAN" | "CAR" | "BUS" | "AIRPORT_TRANSFER">("VAN");
  const [capacity, setCapacity] = useState("8");
  const [price, setPrice] = useState("350");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vehicles");
      if (res.data?.success) setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/vehicles", {
        name,
        type,
        capacity: parseInt(capacity, 10),
        price: parseFloat(price),
        driverIncluded: true,
        availability: true,
        image: image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        features: ["Leather Recliners", "Wi-Fi", "Champagne Bar", "Panoramic Roof"],
      });
      setShowModal(false);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create vehicle");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this vehicle from the fleet?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete vehicle");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" /> Fleet & Chauffeur Logistics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage executive vehicles: VIP Vans, Luxury Sedans, Motorcoaches, and Airport Transfers.
          </p>
        </div>

        <button
          onClick={() => {
            setName("");
            setImage("");
            setShowModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Vehicle to Fleet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between"
          >
            <div className="relative h-40">
              <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-white">
                {v.type.replace("_", " ")}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{v.name}</h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-primary" /> Capacity: {v.capacity} Passengers
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900">
                  ${v.price} <span className="font-normal text-slate-400">/ day</span>
                </span>
                <button
                  onClick={() => handleDelete(v.id)}
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
            <h3 className="text-lg font-bold text-slate-900">Add Fleet Vehicle</h3>
            <form onSubmit={handleSaveVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Vehicle Name / Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mercedes-Benz Sprinter Executive"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Vehicle Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="VAN">VIP Van</option>
                    <option value="CAR">Luxury Car / SUV</option>
                    <option value="BUS">Tour Motorcoach</option>
                    <option value="AIRPORT_TRANSFER">Airport Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Passenger Capacity</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Daily Charter Rate (USD)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Vehicle Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
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
                  {saving ? "Saving..." : "Add to Fleet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
