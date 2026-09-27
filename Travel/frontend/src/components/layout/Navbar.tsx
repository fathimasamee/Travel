"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  Compass,
  User,
  Heart,
  Calendar,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Briefcase,
  ChevronDown,
} from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";
  const navBg = scrolled || !isHome
    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 text-slate-900"
    : "bg-transparent text-white";

  const linkClass = (path: string) => {
    const active = pathname === path;
    if (scrolled || !isHome) {
      return active ? "text-primary font-semibold" : "text-slate-600 hover:text-primary transition-colors";
    }
    return active ? "text-white font-semibold underline underline-offset-4" : "text-white/90 hover:text-white transition-colors";
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className={`text-xl font-bold tracking-tight ${scrolled || !isHome ? "text-slate-900" : "text-white"}`}>
                Travel<span className="text-emerald-500">Sphere</span>
              </span>
              <span className={`block text-[10px] tracking-widest uppercase font-medium -mt-1 ${scrolled || !isHome ? "text-slate-400" : "text-white/70"}`}>
                Luxury Journeys
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className={linkClass("/")}>
              Home
            </Link>
            <Link href="/destinations" className={linkClass("/destinations")}>
              Destinations
            </Link>
            <Link href="/packages" className={linkClass("/packages")}>
              Tour Packages
            </Link>
            <Link href="/packages?category=Luxury" className={linkClass("/packages?category=Luxury")}>
              Bespoke Luxury
            </Link>
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full border-2 border-emerald-400 object-cover"
                  />
                  <div className="text-left">
                    <span className={`text-xs font-semibold block leading-tight ${scrolled || !isHome ? "text-slate-800" : "text-white"}`}>
                      {user.firstName}
                    </span>
                    <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 ${scrolled || !isHome ? "text-slate-500" : "text-white/80"}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-primary" />
                      My Bookings & Invoices
                    </Link>

                    <Link
                      href="/dashboard?tab=favourites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      Saved Favourites
                    </Link>

                    {(user.role === "STAFF" || user.role === "ADMIN") && (
                      <Link
                        href="/staff"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                        Staff Operations Portal
                      </Link>
                    )}

                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors border-t border-slate-100"
                      >
                        <ShieldAlert className="w-4 h-4 text-primary" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                    scrolled || !isHome
                      ? "text-slate-700 hover:text-primary"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  Join TravelSphere
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${scrolled || !isHome ? "text-slate-800" : "text-white"}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-slate-900 border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/destinations"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 hover:text-primary"
          >
            Destinations
          </Link>
          <Link
            href="/packages"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 hover:text-primary"
          >
            Tour Packages
          </Link>
          {user ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-slate-700 hover:text-primary"
              >
                Customer Dashboard
              </Link>
              {(user.role === "STAFF" || user.role === "ADMIN") && (
                <Link
                  href="/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-emerald-600 font-semibold"
                >
                  Staff Portal
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-primary font-semibold"
                >
                  Admin Control Center
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left text-base font-medium text-rose-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold rounded-lg border border-slate-200 text-slate-700"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold rounded-lg bg-emerald-500 text-white"
              >
                Join TravelSphere
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
