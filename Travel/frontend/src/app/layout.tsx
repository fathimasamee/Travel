import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TravelSphere | Luxury Curated Travel & Expeditions",
  description:
    "Experience the world with confidence. TravelSphere provides bespoke luxury travel packages, five-star private itineraries, seamless booking, and 24/7 dedicated concierge service.",
  keywords: [
    "luxury travel",
    "bespoke tours",
    "vacation packages",
    "private villas",
    "safari expeditions",
    "travel booking engine",
  ],
  openGraph: {
    title: "TravelSphere | Explore The World With Confidence",
    description: "Curated 5-star travel packages, private yachts, alpine journeys, and safari expeditions.",
    url: "https://travelsphere.com",
    siteName: "TravelSphere",
    images: [
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "TravelSphere Luxury Journeys",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50/50 text-slate-900 antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
