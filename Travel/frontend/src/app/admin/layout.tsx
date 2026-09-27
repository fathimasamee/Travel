"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { AdminSidebar } from "../../components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login?redirect=/admin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 text-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Verifying Administrative Privileges...</p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="pt-20 flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 max-w-7xl overflow-x-hidden">{children}</main>
    </div>
  );
}
