"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("travelsphere_access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await api.get("/auth/me");
      if (res.data?.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error("Failed to restore auth session:", err);
      localStorage.removeItem("travelsphere_access_token");
      localStorage.removeItem("travelsphere_refresh_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data?.success) {
        const { user: userData, accessToken, refreshToken } = res.data.data;
        localStorage.setItem("travelsphere_access_token", accessToken);
        localStorage.setItem("travelsphere_refresh_token", refreshToken);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: res.data?.message || "Login failed" };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Invalid email or password",
      };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await api.post("/auth/register", formData);
      if (res.data?.success) {
        const { user: userData, accessToken, refreshToken } = res.data.data;
        localStorage.setItem("travelsphere_access_token", accessToken);
        localStorage.setItem("travelsphere_refresh_token", refreshToken);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: res.data?.message || "Registration failed" };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("travelsphere_access_token");
    localStorage.removeItem("travelsphere_refresh_token");
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    const res = await api.put("/users/profile", data);
    if (res.data?.success) {
      setUser((prev) => (prev ? { ...prev, ...res.data.data } : res.data.data));
    }
  };

  const refreshUserProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
