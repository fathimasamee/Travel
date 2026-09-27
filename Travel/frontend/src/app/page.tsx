import React from "react";
import { HeroSection } from "../components/home/HeroSection";
import { PopularDestinations } from "../components/home/PopularDestinations";
import { FeaturedPackages } from "../components/home/FeaturedPackages";
import { WhyChooseUs } from "../components/home/WhyChooseUs";
import { Testimonials } from "../components/home/Testimonials";
import { Newsletter } from "../components/home/Newsletter";

async function getHomeData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  try {
    const [destRes, pkgRes] = await Promise.all([
      fetch(`${apiUrl}/destinations/popular`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/packages/featured`, { next: { revalidate: 60 } }),
    ]);

    const destData = destRes.ok ? await destRes.json() : { data: [] };
    const pkgData = pkgRes.ok ? await pkgRes.json() : { data: [] };

    return {
      destinations: destData.data || [],
      packages: pkgData.data || [],
    };
  } catch (error) {
    console.warn("⚠️ API fetch on SSR failed, fallback to empty arrays:", error);
    return { destinations: [], packages: [] };
  }
}

export default async function HomePage() {
  const { destinations, packages } = await getHomeData();

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <PopularDestinations destinations={destinations} />
      <FeaturedPackages packages={packages} />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </div>
  );
}
